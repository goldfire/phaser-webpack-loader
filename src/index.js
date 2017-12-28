import Phaser from 'phaser';
import WebFont from 'webfontloader';

/**
 * Phaser Webpack Loader plugin for Phaser.
 */
export default class WebpackLoader extends Phaser.Plugin {
  /**
   * Initialize the load plugin.
   * @param  {Object} manifest          Your asset manifest file contents.
   * @param  {String} postfix           (optional) Postfix to append to assets.
   * @param  {Function} assetLoadCallback Callback to fire when each file has loaded.
   */
  init(manifest, postfix = '', assetLoadCallback) {
    // Define the asset load callback.
    this._assetLoadCallback = assetLoadCallback || (() => {});

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
    ]).then(this._addSprites.bind(this));
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
          this.loaders[key].call(this, assetData[0], assetData[1]);
        });
      });

      // Setup listener for each asset loading.
      this.game.load.onFileComplete.add(this._assetLoadCallback);

      // Once everything has loaded, resolve the promise.
      this.game.load.onLoadComplete.addOnce(() => {
        this.game.load.onFileComplete.remove(this._assetLoadCallback);
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
    if (Object.keys(this.fonts).length === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      WebFont.load(Object.assign({}, this.fonts, {
        active: () => {
          this._assetLoadCallback();
          resolve();
        },
      }));
    });
  }

  /**
   * Create the texture atlases once the image data has loaded.
   * This is required in order to load compressed textures as an atlas.
   */
  _addSprites() {
    this.assets.sprites.forEach((asset) => {
      // Get the image/data for the sprite atlas.
      const dir = 'sprites/';
      const name = asset.split('.')[0];
      const image = this.game.cache.getItem(name, Phaser.Cache.IMAGE);

      if (image) {
        const compression = image.data.compressionAlgorithm;
        const format = compression ? `.${compression.toLowerCase()}` : '';
        const data = require(`assets/${dir}${name}${this.postfix}${format}.json`);

        // Add the sprite atlas to the cache.
        this.game.cache.addTextureAtlas(name, null, image.data, data, Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
      }
    });
  }

  /**
   * Load an image.
   * @param  {String} name Name of the file.
   * @param  {String} ext  File extension.
   */
  _loadImage(name, ext) {
    const dir = 'images/';
    const file = require(`assets/${dir}${name}${this.postfix}.${ext}`);
    this.game.load.image(name, file);
  }

  /**
   * Load a spritesheet.
   * @param  {String} name Name of the file.
   * @param  {String} ext  File extension.
   */
  _loadSprite(name, ext) {
    const dir = 'sprites/';

    // Determine which formats are available.
    const formats = {};

    try {
      formats.truecolor = require(`assets/${dir}${name}${this.postfix}.${ext}`);
    } catch (e) {}

    try {
      formats.pvrtc = require(`assets/${dir}${name}${this.postfix}.pvrtc.pvr`);
    } catch (e) {}

    try {
      formats.s3tc = require(`assets/${dir}${name}${this.postfix}.s3tc.pvr`);
    } catch (e) {}

    try {
      formats.etc1 = require(`assets/${dir}${name}${this.postfix}.etc1.pkm`);
    } catch (e) {}

    // Load the format that works on this platform.
    this.game.load.image(name, formats);
  }

  /**
   * Load an audio file.
   * @param  {String} name Name of the file.
   * @param  {String} ext  File extension.
   */
  _loadAudio(name, ext) {
    const dir = 'audio/';
    const file = require(`assets/${dir}${name}.${ext}`);
    this.game.load.audio(name, file);
  }

  /**
   * Load a bitmap font.
   * @param  {String} name Name of the file.
   * @param  {String} ext  File extension.
   */
  _loadBitmapFont(name, ext) {
    const dir = 'fonts/';
    const file = require(`assets/${dir}${name}${this.postfix}.${ext}`);
    const data = require(`assets/${dir}${name}${this.postfix}.xml`);
    this.game.load.bitmapFont(name, file, data);
  }
}
