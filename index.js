var fs = require('fs');
var atob = require('atob');
var http = require('http');
var https = require('https');

var jimp = require('jimp-compact');
var { Resvg } = require('@resvg/resvg-js');

/**
 * Main method
 * @param  {String|Buffer}   svg      - A SVG string, Buffer or a base64 string starts with "data:image/svg+xml;base64", or a file url (http or local)
 * @param  {Object} [options=null]          - options
 * @param  {Object} [options.format=png]    - format of the image: png or jpeg, default is png
 * @param  {Function} callback - result callback, 2 parameters: error, and result image buffer
 */
function svg2img(svg, options, callback) {
    if (isFunction(options)) {
        callback = options;
        options = null;
    }
    if (!options) {
        options = {};
    }
    loadSVGContent(svg, async function (error, content) {
        if (error) {
            callback(error);
            return;
        }

        // Set the width and height with the options in resvg-js.
        options.resvg = options.resvg ? options.resvg : {};

        // JPEG quality (0-100) default: 75
        options.quality = options.quality ? parseInt(options.quality, 10) : 75;
        options.format = options.format ? options.format.toLowerCase() : 'png';

        var isJpg = options.format === 'jpg' || options.format === 'jpeg';

        var imgBuffer;
        var pngData;
        try {
            // Set the default background color of jpg to white, otherwise it is black.
            if (isJpg) {
                options.resvg.background = '#fff';
            }
            var resvg = new Resvg(content, options.resvg);
            pngData = resvg.render();
        } catch (error) {
            callback(error);
        }

        if (isJpg) {
            try {
                // Convert png to jpg using jimp.
                // resvg-js does not currently support generating jpg buffer.
                var pngBuffer = pngData.asPng();
                var image = await jimp.read(pngBuffer);
                await image.quality(options.quality);
                imgBuffer = await image.getBufferAsync(jimp.MIME_JPEG);
            } catch (error) {
                callback(error);
            }
        } else {
            imgBuffer = pngData.asPng();
        }

        callback(null, imgBuffer);
    });
}

function loadSVGContent(svg, callback) {
    if (svg.indexOf('data:image/svg+xml;base64,') >= 0 && !/^<svg/.test(svg)) {
        callback(null, atob(svg.substring('data:image/svg+xml;base64,'.length)));
    } else if (svg.indexOf('<svg') >= 0) {
        callback(null, svg);
    } else {
        if (svg.indexOf('http://') >= 0 || svg.indexOf('https://') >= 0) {
            loadRemoteImage(svg, callback);
        } else {
            fs.readFile(svg, function (error, data) {
                if (error) {
                    callback(error);
                    return;
                }
                // callback(null, data.toString('utf-8'));
                callback(null, data);
            });
        }
    }
}

function loadRemoteImage(url, onComplete) {
    // http
    var loader;
    if (url.indexOf('https://') >= 0) {
        loader = https;
    } else {
        loader = http;
    }
    loader.get(url, function (res) {
        var data = [];
        res.on('data', function (chunk) {
            data.push(chunk)
        });
        res.on('end', function () {
            var content = Buffer.concat(data);
            onComplete(null, content);
        });
    }).on('error', onComplete);
}

function isFunction(func) {
    if (!func) {
        return false;
    }
    return typeof func === 'function' || (func.constructor !== null && func.constructor == Function);
}

exports = module.exports = svg2img;

