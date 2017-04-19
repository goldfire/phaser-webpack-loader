<p align="center">
  <img src="https://s3.amazonaws.com/howler.js/phaser-webpack-loader.png" alt="Phaser Webpack Loader">
</p>

# Phaser Webpack Loader
Instead of manually calling `game.load.image`, `game.load.audio`, etc for every asset in your game (and then dealing with caching issues), phaser-webpack-loader lets you define all assets in a simple manifest file and handles the rest for you.

View sample usage in this [Phaser ES6 Boilerplate](https://github.com/goldfire/phaser-boilerplate).

## Features

* Load all game assets in parallel.
* Load images, spritesheets, atlases, audio, bitmap fonts and web fonts.
* Integrated with Webpack for automatic cache-busting.
* Supports all filetypes.
* Supports asset postfix for retina support ('@2x', '@3x', etc).
* Supports automatic loading of compressed textures (PVRTC, S3TC, ETC1).

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

export default class Preload extends Phaser.State {
  create() {
    this.game.plugins.add(WebpackLoader, AssetManifest)
      .load()
      .then(() => {
        this.game.state.start('Main');
      });
  }
}
```

If you want to load high DPI assets, you can pass an optional postfix string:

```javascript
this.game.plugins.add(WebpackLoader, AssetManifest, '@2x')
  .load()
  .then(() => {
    this.game.state.start('Main');
  });
```

## Loading Fonts

The font loader uses [Web Font Loader](https://github.com/typekit/webfontloader), which supports loading web fonts from all major providers. Simply provide their standard configuration object in your manifest.

## Loading Sprites/Atlases

All sprite/atlas files are loaded as JSON hashes (which can be output using [TexturePacker](https://www.codeandweb.com/texturepacker), [Shoebox](http://renderhjs.net/shoebox/) and others). All you have to specify in the manifest is the image filename, but you'll also need to include the JSON hash file alongside it, which will automatically get loaded and used.

## Loading Compressed Textures (Phaser-CE 2.7.7+)

[Compressed textures](https://phaser.io/tutorials/advanced-rendering-tutorial/part6) can be great to lower memory usage, especially on mobile devices; however, it isn't necessarily straight-forward how to load these (especially for atlas files). This loader makes it as simple as putting the files in your directory, so long as they match the naming conventions:

#### PVRTC `texture.pvrtc.pvr` & `texture.pvrtc.json`
#### S3TC `texture.s3tc.pvr` & `texture.s3tc.json`
#### ETC1 `texture.etc1.pkm` & `texture.etc1.json`

Simply include any or all of these files alongside the `PNG` equivalent and if one of them is compatible with the current browser/hardware it will be loaded and used (falling back to the `PNG` file).

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

Copyright (c) 2017 [James Simpson](https://twitter.com/GoldFireStudios) and [GoldFire Studios, Inc.](http://goldfirestudios.com)

Released under the [MIT License](https://github.com/goldfire/phaser-webpack-loader/blob/master/LICENSE.md).