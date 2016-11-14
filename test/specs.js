var svg2img = require('../index'),
    expect = require('expect.js'),
    btoa = require('btoa'),
    fs = require('fs'),
<<<<<<< HEAD
<<<<<<< HEAD
    Image = require('canvas').Image,
=======
>>>>>>> master
=======
>>>>>>> origin/master
    Image64 = require('node-base64-image'),
    util = require('util');
describe('Convert SVG', function () {
    it('convert a svg file to png',function(done) {
        svg2img(__dirname+'/ph.svg', function(error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert tiger file to png',function(done) {
        svg2img(__dirname+'/tiger.svg', function(error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a svg file and scale it',function(done) {
        svg2img(__dirname+'/ph.svg', {'width':400, 'height':400}, function(error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a remote svg file to png',function(done) {
        this.timeout(5000);
        svg2img('https://upload.wikimedia.org/wikipedia/commons/a/a0/Svg_example1.svg', function(error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a svg string to png',function(done) {
        var svg = fs.readFileSync(__dirname+'/ph.svg');
        svg2img(svg, null ,function(error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a svg string to jpg',function(done) {
        var svg = fs.readFileSync(__dirname+'/ph.svg');
        svg2img(svg, {format:'jpeg'} ,function(error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a svg base64 to png',function(done) {
        var svg = fs.readFileSync(__dirname+'/ph.svg').toString('utf-8');
        svg = 'data:image/svg+xml;base64,'+ btoa(svg);
        svg2img(svg, null ,function(error, data) {
            expect(error).not.to.be.ok();
            expect(Buffer.isBuffer(data)).to.be.ok();
            expect(data.length).to.be.above(0);
            done();
        })
    });

    it('convert a svg with an image', function (done) {
        var imageUrl = 'https://www.baidu.com/img/bd_logo1.png';
        Image64.encode(imageUrl, {}, function (err, base64) {            
            var svgString = util.format('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="540" height="258" ' +
                'viewBox="0 0 540 258"><image width="540" height="258" x="0" y="0" href="%s"></image></svg>', 'data:image/png;base64,' + base64.toString('base64'));
            svg2img(svgString, function(error, data) {
                expect(error).not.to.be.ok();
                expect(Buffer.isBuffer(data)).to.be.ok();
                expect(data.length).to.be.above(0);
                done();
            });
        });
    });

    it('scale a svg with width and height in style', function (done) {
        svg2img(__dirname+'/fy.svg', {width : 20, height: 30}, function (err, data) {
            var img = new Image();
            img.onload = function () {
                expect(img.width).to.be.eql(20);
                expect(img.height).to.be.eql(30);
                done();
            }
            img.src = data;
        });
    });
});