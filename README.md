<p align="center">
  <img src="https://s3.amazonaws.com/howler.js/phaser-webpack-loader2.png" alt="Phaser Webpack Loader">
</p>

# Phaser 3 Webpack Loader
Instead of manually calling `scene.load.image`, `scene.load.audio`, etc for every asset in your game (and then dealing with caching issues), phaser-webpack-loader lets you define all assets in a simple manifest file and handles the rest for you.

**NOTE:** This plugin now only supports Phaser 3 and later. If you need support for Phaser 2, [use v1.1.0](https://github.com/goldfire/phaser-webpack-loader/tree/d3c9683e6a5ba9541ec0b0cd11c89fb824ff45b6).

## Features

* Load all game assets in parallel.
* Load images, spritesheets, atlases, audio, bitmap fonts and web fonts.
* Integrated with Webpack for automatic cache-busting.
* Supports all filetypes.
* Supports asset postfix for retina support ('@2x', '@3x', etc).
* Custom event to track each file load (including fonts).

## Install

Install the plugin through NPM (or Yarn):

```
npm install phaser-webpack-loader --save
```

Then create your manifest file and add the plugin as outlined below.

## Manifest File (AssetManifest.js)

```javascript
const AssetManifest = {
  images: [
    'image001.png',
    'image002.jpg',
    '...',
  ],
  sprites: [
    'sprite001.png',
    'sprite002.png',
    '...',
  ],
  audio: [
    'audio001.webm',
    'audio002.mp3',
    '...',
  ],
  bitmapFonts: [
    'font001.png',
    'font002.png',
    '...',
  ],
  fonts: {
    google: {
      families: [
        'Open Sans:300,700',
      ],
    },
  },
};

export default AssetManifest;
```

## Running Plugin (Preload.js)

In your preload state, add the plugin. It uses promises, which makes it flexible to move to the next step when ready.

```javascript
import WebpackLoader from 'phaser-webpack-loader';
import AssetManifest from '../AssetManifest';

export default class Preload extends Phaser.Scene {
  preload() {
    this.load.scenePlugin('WebpackLoader', WebpackLoader, 'loader', 'loader');
  }

  create() {
    this.loader.start(AssetManifest);
    this.loader.load().then(() => {
      // Done loading!
    });
  }
}
```

If you want to load high DPI assets, you can pass an optional postfix string:

```javascript
this.loader.start(AssetManifest, '@2x');
```

If you want to know when each file is loaded, use the optional callback:

```javascript
this.loader.systems.events.on('load', (file) => {
  console.log('File loaded!', file);
});
```

## Loading Fonts

The font loader uses [Web Font Loader](https://github.com/typekit/webfontloader), which supports loading web fonts from all major providers. Simply provide their standard configuration object in your manifest.

## Loading Sprites/Atlases

All sprite/atlas files are loaded as JSON hashes (which can be output using [TexturePacker](https://www.codeandweb.com/texturepacker), [Shoebox](http://renderhjs.net/shoebox/) and others). All you have to specify in the manifest is the image filename, but you'll also need to include the JSON hash file alongside it, which will automatically get loaded and used.

## Directory Structure

Specify the base directory in your Webpack config:

```
resolve: {
  alias: {
    assets: path.join(__dirname, '../src/assets'),
  },
},
```

Then, place your assets in the following sub-directories:

```
assets/
├── images/
├── sprites/
├── audio/
└── fonts/
```

## ES6 Building

This plugin is not pre-compiled to ES5, so you'll want to make sure your Webpack config rules are setup to not exclude it:

```javascript
module: {
  rules: [
    {
      test: /\.js$/,
      loader: '...',
      exclude: /node_modules\/(?!phaser-webpack-loader)/,
    },
  ],
  ...
},
```

### License

Copyright (c) 2018 [James Simpson](https://twitter.com/GoldFireStudios) and [GoldFire Studios, Inc.](http://goldfirestudios.com)

Released under the [MIT License](https://github.com/goldfire/phaser-webpack-loader/blob/master/LICENSE.md).