var canvg = require('canvg'),
    jsdom = require('jsdom'),
    atob = require('atob'),
    fs = require('fs'),
    http = require('http'),
    https = require('https'),
    Canvas = require('canvas');

var jsdomWindow = (new jsdom.JSDOM()).window;

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
    loadSVGContent(svg, async function(error, content) {
        if (error) {
            callback(error);
            return;
        }
        if (options.width || options.height) {
            content = scale(content, options.width, options.height, options.preserveAspectRatio);
        }
        var format = options.format;
        if (!format) {
            format = 'png';
        }
        var canvas;
        try {
            canvas = await convert(content, options, callback);
        } catch (error) {
            callback(error);
        }
        var stream;
        if (format === 'jpg' || format === 'jpeg') {
            stream = canvas.createJPEGStream({
                quality: options['quality'] // JPEG quality (0-100) default: 75
            });
        } else {
            stream = canvas.createPNGStream({
                compressionLevel: options['compressionLevel']
            });
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

async function convert(svgContent, options, callback) {
    var canvas = Canvas.createCanvas(options.width||100, options.height||100);
    var ctx = canvas.getContext('2d');
    try {
        const renderer = canvg.Canvg.fromString(ctx, svgContent, { DOMParser: jsdomWindow.DOMParser, window: jsdomWindow, ignoreMouse: true, ignoreAnimation: true, createCanvas: Canvas.createCanvas, createImage: Canvas.loadImage, ImageClass: Canvas.Image });
        await renderer.render();
    } catch (error) {
        callback(error);
    }
    return canvas;
}

function scale(svgContent, w, h, preserveAspectRatio) {
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
    var finalAspectRatio;
    if (preserveAspectRatio) {
        if (typeof preserveAspectRatio === 'string') {
            finalAspectRatio = '"' + preserveAspectRatio + '"';
        } else {
            if (/ preserveAspectRatio\W/.test(svgContent)) {
                var quoChar = svgTag.match(/ preserveAspectRatio\s*=\s*(['"])/);
                if (quoChar) {
                    quoChar = quoChar[1];
                    var aspectRatio = svgTag.match(new RegExp(' preserveAspectRatio\\s*=\\s*' + quoChar + '([^' + quoChar + ']*)'));
                    if (aspectRatio && aspectRatio[1]) {
                        finalAspectRatio = aspectRatio[1].replace(/^\s*(\S.*\S)\s*$/, '"$1"');
                    }
                }
            }
        }
    }
    var props = {};
    var splits = svgTag.substring(4, svgTag.length-1).split(' ');
    var lastKey;
    var i;
    for (i = 0; i < splits.length; i++) {
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
    var ow = props['width'] ? parseInt(props['width'].replace('"',''), 10) : null,
        oh = props['height'] ? parseInt(props['height'].replace('"',''), 10) : null;
    if (w) {
        props['width'] = '"'+w+'"';
    }
    if (h) {
        props['height'] = '"'+h+'"';
    }
    if (!props['viewBox']) {
        props['viewBox'] = '"'+[0,0,ow?ow:w,oh?oh:h].join(' ')+'"';
    }
    props['preserveAspectRatio'] = finalAspectRatio || '"none"';

    // update width and height in style attribute
    if (props['style'] && props['style'].length > 2) {
        var styleUpdated = false;
        var styleStr = props['style'].substring(1, props['style'].length - 1);
        var styles = styleStr.split(';');
        for (var i = 0; i < styles.length; i++) {
            var styleKV = styles[i].split(':');
            if (styleKV.length === 2) {
                var key = styleKV[0].trim();
                if (key === 'width') {
                    styles[i] = 'width : ' + w +'px';
                    styleUpdated = true;
                } else if (key === 'height') {
                    styles[i] = 'height : ' + h +'px';
                    styleUpdated = true;
                }
            }
        }
        if (styleUpdated) {
            props['style'] = '"' + styles.join(';') + '"';
        }
    }

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
    if (svg.indexOf('data:image/svg+xml;base64,') >= 0 && !/^<svg/.test(svg)) {
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

