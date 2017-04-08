import Phaser from 'phaser';
import WebFont from 'webfontloader';

/**
 * Phaser Webpack Loader plugin for Phaser.
 */
export default class WebpackLoader extends Phaser.Plugin {
  /**
   * Initialize the load plugin.
   * @param  {Object} manifest Your asset manifest file contents.
   * @param  {String} postfix  (optional) Postfix to append to assets.
   */
  init(manifest, postfix = '') {
    // Pull the base directory out of the manifest.
    this.baseDir = manifest.baseDir || 'assets/';

    // Pull the font values out of the manifest.
    this.fonts = manifest.fonts || {};

    // Pull the asset values out of the manifest.
    this.assets = {
      images: manifest.images || [],
      sprites: manifest.sprites || [],
      audio: manifest.audio || [],
      bitmapFonts: manifest.bitmapFonts || [],
    };

    // Define the loaders for the different asset types.
    this.loaders = {
      images: this._loadImage,
      sprites: this._loadSprite,
      audio: this._loadAudio,
      bitmapFonts: this._loadBitmapFont,
    };

    // Define the postfix string to apply to image assets (ex: @2x).
    this.postfix = postfix;
  }

  /**
   * Begins loading of all assets.
   * @return {Promise} Returns when loading is complete.
   */
  load() {
    return Promise.all([
      this._loadAssets(),
      this._loadFonts(),
    ]);
  }

  /**
   * Load all assets in parallel.
   * @return {Promise} Returns when assets are loaded.
   */
  _loadAssets() {
    return new Promise((resolve) => {
      // Loop through all of the asset types and begin loading.
      Object.keys(this.assets).forEach((key) => {
        // Loop through each asset of this type.
        this.assets[key].forEach((asset) => {
          const assetData = asset.split('.');
          this.loaders[key](assetData[0], assetData[1]);
        });
      });

      // Once everything has loaded, resolve the promise.
      this.game.load.onLoadComplete.addOnce(() => {
        resolve();
      });

      // Start the loading of the assets.
      this.game.load.start();
    });
  }

  /**
   * Loads all defined web fonts using webfontloader.
   * @return {Promise} Returns when fonts are ready to use.
   */
  _loadFonts() {
    return new Promise((resolve) => {
      WebFont.load(Object.assign({}, this.fonts, {
        active: resolve,
      }));
    });
  }

  /**
   * Load an image.
   * @param  {String} name Name of the file.
   * @param  {String} ext  File extension.
   */
  _loadImage(name, ext) {
    const file = require(`${this.baseDir}images/${name}${this.postfix}.${ext}`);
    this.game.load.image(name, file);
  }

  /**
   * Load a spritesheet.
   * @param  {String} name Name of the file.
   * @param  {String} ext  File extension.
   */
  _loadSprite(name, ext) {
    const file = require(`${this.baseDir}sprites/${name}${this.postfix}.${ext}`);
    const data = require(`${this.baseDir}sprites/${name}${this.postfix}.json`);
    this.game.load.atlasJSONHash(name, file, null, data);
  }

  /**
   * Load an audio file.
   * @param  {String} name Name of the file.
   * @param  {String} ext  File extension.
   */
  _loadAudio(name, ext) {
    const file = require(`${this.baseDir}audio/${name}.${ext}`);
    this.game.load.audio(name, file);
  }

  /**
   * Load a bitmap font.
   * @param  {String} name Name of the file.
   * @param  {String} ext  File extension.
   */
  _loadBitmapFont(name, ext) {
    const file = require(`${this.baseDir}fonts/${name}${this.postfix}.${ext}`);
    const data = require(`${this.baseDir}fonts/${name}${this.postfix}.xml`);
    this.game.load.bitmapFont(name, file, data);
  }
}
