var canvg = require('canvg'),
    atob = require('atob'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    Canvas = require('canvas');

/**
 * Main method
 * @param  {String}   svg      - a svg string, or a base64 string starts with "data:image/svg+xml;base64", or a file url (http or local)
 * @param  {Object} [options=null]          - options
 * @param  {Object} [options.format=png]    - format of the image: png or jpeg, default is png
 * @param  {Function} callback - result callback, 2 parameters: error, and result buffer in png
 */
function svg2img(svg, options, callback) {
    if (isFunction(options)) {
        callback = options;
        options = null;
    }
    if (!options) {
        options = {};
    }
    loadSVGContent(svg, function(error, content) {
        if (error) {
            callback(error);
            return;
        }
        if (options.width || options.height) {
            content = scale(content, options.width, options.height);
        }
        var format = options.format;
        if (!format) {
            format = 'png';
        }
        var canvas = convert(content, options);
        var stream;
        if (format === 'jpg' || format === 'jpeg') {
            stream = canvas.jpegStream({
                quality: options['quality'] // JPEG quality (0-100) default: 75
            });
        } else {
            stream = canvas.pngStream();
        }
        var data = [];
        var pos = 0;
        stream.on('data', function(chunk) {
            data.push(chunk);
        });
        stream.on('error', function(error) {
            callback(error);
        });
        stream.on('end', function () {
            callback(null,Buffer.concat(data));
        });
    });
}

function convert(svgContent) {
    var canvas = new Canvas();
    canvg(canvas, svgContent, { ignoreMouse: true, ignoreAnimation: true, ImageClass: Canvas.Image });
    return canvas;
}

function scale(svgContent, w, h) {
    var index = svgContent.indexOf('<svg');
    var svgTag = [];
    var endIndex = index;
    for (var i = index; i < svgContent.length; i++) {
        var char = svgContent.charAt(i);
        svgTag.push(char);
        if (char === '>') {
          endIndex = i;
          break;
        }
    }
    svgTag = svgTag.join('').replace(/\n/g, ' ').replace(/\r/g, '');
    var props = {};
    var splits = svgTag.substring(4, svgTag.length-1).split(' ');
    var lastKey;
    for (var i = 0; i < splits.length; i++) {
        if (splits[i] === '') {
            continue;
        } else {
            if (splits[i].indexOf('=') < 0) {
                props[lastKey] = props[lastKey]+' '+splits[i];
            } else {
                var keyvalue = splits[i].split('=');
                lastKey = keyvalue[0];
                props[lastKey] = keyvalue[1];
            }
        }
    }
    var ow = parseInt(props['width'].replace('"',''), 10),
        oh = parseInt(props['height'].replace('"',''), 10);
    if (w) {
        props['width'] = '"'+w+'"';
    }
    if (h) {
        props['height'] = '"'+h+'"';
    }
    if (!props['viewBox']) {
        props['viewBox'] = '"'+[0,0,ow?ow:w,oh?oh:h].join(' ')+'"';
    }
    props['preserveAspectRatio'] = '"none"';
    var newSvgTag = ['<svg'];
    for (var p in props) {
        newSvgTag.push(p+'='+props[p]);
    }
    newSvgTag.push('>');
    return svgContent.substring(0, index)+newSvgTag.join(' ')+svgContent.substring(endIndex+1);
}

function loadSVGContent(svg, callback) {
    if (Buffer.isBuffer(svg)) {
        svg = svg.toString('utf-8');
    }
    if (svg.indexOf('data:image/svg+xml;base64,') >= 0) {
        callback(null,atob(svg.substring('data:image/svg+xml;base64,'.length)));
    } else if (svg.indexOf('<svg') >= 0) {
        callback(null, svg);
    } else {
        if (svg.indexOf('http://')>=0 || svg.indexOf('https://')>=0) {
            loadRemoteImage(svg, callback);
        } else {
            fs.readFile(svg, function(error, data) {
                if (error) {
                    callback(error);
                    return;
                }
                callback(null, data.toString('utf-8'));
            });
        }
    }
}

function loadRemoteImage(url, onComplete) {
    //http
    var loader;
    if (url.indexOf('https://') >= 0) {
        loader = https;
    } else {
        loader = http;
    }
    loader.get(url, function(res) {
        var data = [];
        res.on('data', function(chunk) {
          data.push(chunk)
        });
        res.on('end', function () {
            var content = Buffer.concat(data).toString('utf-8');
            onComplete(null, content);
        });
    }).on('error', onComplete);
}

function isFunction(func) {
    if (!func) {
        return false;
    }
    return typeof func === 'function' || (func.constructor!==null && func.constructor == Function);
}

exports = module.exports = svg2img;

