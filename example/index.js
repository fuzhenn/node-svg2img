const fs = require('fs');
const { join } = require('path');
const svg2img = require('../index');

// Base64 or remote URLs are also supported.
const svgFile = join(__dirname, '../test/tiger.svg');

svg2img(svgFile, {
    resvg: {
        fitTo: {
            mode: 'width',
            value: 900,
        },
        background: 'skyblue',
    }
}, function (error, buffer) {
    fs.writeFileSync(__dirname + '/index.png', buffer);
});