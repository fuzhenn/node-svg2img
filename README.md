# node-svg2img

[![CircleCI](https://circleci.com/gh/fuzhenn/node-svg2img.svg?style=svg)](https://circleci.com/gh/fuzhenn/node-svg2img)
<a href="https://www.npmjs.com/package/svg2img"><img src="https://img.shields.io/npm/v/svg2img.svg?sanitize=true" alt="npm version"></a>

A high-performance in-memory convertor to convert SVG to png/jpeg images for Node.js.

Starting with v1.0, we switched to [resvg-js](https://github.com/yisibl/resvg-js) for better performance and compatibility to render SVG.

> Please notice: this library is only for Node.js, can not run in browsers.
> (If your Node.js version is lower, you can `npm i svg2img@0.6.3` instead which only required Node.js v4)

## Install

```bash
npm i svg2img@next
```

## Usage
### Conversion

```javascript
const fs = require('fs');
const svg2img = require('svg2img');
const btoa = require('btoa');

const svgString = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="236" height="120" viewBox="0 0 236 120"><rect x="14" y="23" width="200" height="50" fill="#55FF55" stroke="black" stroke-width="1" /></svg>`;

//1. Convert from svg string
svg2img(svgString, function(error, buffer) {
    //returns a Buffer
    fs.writeFileSync('foo1.png', buffer);
});

//2. Convert from svg's base64 string
svg2img(
    'data:image/svg+xml;base64,' + btoa(svgString),
    function(error, buffer) {
        fs.writeFileSync('foo2.png', buffer);
});

fs.writeFileSync('foo.svg', new Buffer(svgString));

//3. Convert from a local file
svg2img(__dirname + '/foo.svg', function(error, buffer) {
    fs.writeFileSync('foo3.png', buffer);
});

//4. Convert from a remote file
svg2img(
    'https://upload.wikimedia.org/wikipedia/commons/a/a0/Svg_example1.svg',
    function(error, buffer) {
        fs.writeFileSync('foo4.png', buffer);
});

//5. Convert to jpeg file
svg2img(svgString, { format: 'jpg', 'quality': 75 }, function(error, buffer) {
    //default jpeg quality is 75
    fs.writeFileSync('foo5.jpg', buffer);
});
```

### Scale

You can scale the svg by giving width or height, svg2img Always maintain aspect ratio.

```javascript
svg2img(__dirname + '/foo.svg', {
    resvg: {
        fitTo: {
            mode: 'width', // or height
            value: 600,
        },
    }
} ,function(error, buffer) {
    fs.writeFileSync('foo.png', buffer);
});
```

### More options

resvg-js supports [more features](https://github.com/yisibl/resvg-js#features), such as Loading fonts, setting `background`, `crop`, etc.

In svg2img, you can configure it with the `resvg` option.

```js
export type ResvgRenderOptions = {
  font?: {
    loadSystemFonts?: boolean
    fontFiles?: string[]
    fontDirs?: string[]
    defaultFontFamily?: string
    defaultFontSize?: number
    serifFamily?: string
    sansSerifFamily?: string
    cursiveFamily?: string
    fantasyFamily?: string
    monospaceFamily?: string
  }
  dpi?: number
  languages?: string[]
  shapeRendering?:
    | 0 // optimizeSpeed
    | 1 // crispEdges
    | 2 // geometricPrecision
  textRendering?:
    | 0 // optimizeSpeed
    | 1 // optimizeLegibility
    | 2 // geometricPrecision'
  imageRendering?:
    | 0 // optimizeQuality
    | 1 // optimizeSpeed
  fitTo?:
    | { mode: 'original' }
    | { mode: 'width'; value: number }
    | { mode: 'height'; value: number }
    | { mode: 'zoom'; value: number }
  background?: string // Support CSS3 color, e.g. rgba(255, 255, 255, .8)
  crop?: {
    left: number
    top: number
    right?: number
    bottom?: number
  }
  logLevel?: 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
}
```


## Run the Test

```bash
    npm i
    npm test
```
