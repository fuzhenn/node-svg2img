var fs = require('fs');

var expect = require('expect.js');
var btoa = require('btoa');
var jimp = require('jimp');
var assert = require('assert');

var svg2img = require('../index');
var Image64 = require('node-base64-image');
var util = require('util');

describe('Convert SVG', function () {
    it('convert a svg file to png', function (done) {
        svg2img(__dirname + '/ph.svg', function (error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert tiger file to png', function (done) {
        svg2img(__dirname + '/tiger.svg', function (error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a svg file and scale it', function (done) {
        svg2img(__dirname + '/ph.svg', {
            resvg: {
                fitTo: {
                    mode: 'width',
                    value: 400,
                },
            }
        }, function (error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a svg file and scale it, keep preserveAspectRatio', function (done) {
        svg2img(__dirname + '/ph.svg', { 'width': 400, 'height': 400, preserveAspectRatio: true }, function (error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    // it('convert a remote svg file to png', function (done) {
    //     this.timeout(5000);
    //     svg2img('https://iconfont.alicdn.com/s/5335462e-5d18-4018-9091-9ff7451368f0_origin.svg', function (error, data) {
    //         expect(error).not.to.be.ok();
    //         expect(Buffer.isBuffer(data)).to.be.ok();
    //         expect(data.length).to.be.above(0);
    //         done();
    //     })
    // });

    it('convert a svg string to png', function (done) {
        var svg = fs.readFileSync(__dirname + '/ph.svg');
        svg2img(svg, null, function (error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a svg string with data URI to png', function (done) {
        var svg = fs.readFileSync(__dirname + '/atob.svg');
        svg2img(svg, null, function (error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a svg string to jpg', function (done) {
        var svg = fs.readFileSync(__dirname + '/ph.svg');
        svg2img(svg, { format: 'jpg', quality: 30 }, async function (error, data) {
            const result = await jimp.read(data);

            expect(error).not.to.be.ok();
            expect(result.getMIME()).to.be.eql('image/jpeg');
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    // failed after upgrading to canvg 3.x, need investigations, pr #36
    it('convert a svg base64 to png', function (done) {
        var svg = fs.readFileSync(__dirname + '/ph.svg').toString('utf-8');
        svg = 'data:image/svg+xml;base64,' + btoa(svg);
        svg2img(svg, null, function (error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    // it('convert a svg with an image', function (done) {
    //     this.timeout(5000);
    //     var imageUrl = 'https://res.cloudinary.com/verticalaxisbd/image/upload/h_239,w_239/rg1kxkgxayhdgoqdaejz.jpg';
    //     Image64.encode(imageUrl, {}, function (err, base64) {
    //         var svgString = util.format('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="540" height="258" ' +
    //             'viewBox="0 0 540 258"><image width="540" height="258" x="0" y="0" href="%s"></image></svg>', 'data:image/png;base64,' + base64.toString('base64'));
    //         svg2img(svgString, function(error, data) {
    //             expect(error).not.to.be.ok();
    //             expect(Buffer.isBuffer(data)).to.be.ok();
    //             expect(data.length).to.be.above(0);
    //             done();
    //         });
    //     });
    // });

    it('scale a svg with width and height in style', function (done) {
        svg2img(__dirname + '/fy.svg', {
            resvg: {
                fitTo: {
                    mode: 'width',
                    value: 160,
                },
            }
        }, async function (err, data) {
            const result = await jimp.read(data);
            expect(result.getWidth()).to.be.eql(160);
            expect(result.getHeight()).to.be.eql(160);
            done();
        });
    });

    it('#20', function (done) {
        svg2img(__dirname + '/20.svg', {}, function (error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });
});
