const fs = require('fs');
const { join } = require('path')
const svg2img = require('../index');

const svgFile = join(__dirname, '../test/tiger.svg')
svg2img(svgFile, {
    format: 'jpg',
    quality: 50,
    resvg: {
        fitTo: {
            mode: 'height',
            value: 600,
        },
    }
}, function (error, buffer) {
    fs.writeFileSync(__dirname + '/write-jpg.jpg', buffer);
});