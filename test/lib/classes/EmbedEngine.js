'use strict';

let assert = (require('chai')).assert;
let EmbedEngine = require('../../../lib/classes/EmbedEngine.js');
let URLEmbedProvider = require('../../../lib/classes/URLEmbedProvider.js');
let YoutubeProvider = require('../../../lib/classes/default_providers/youtube.js');
let CustomProvider = require('./support/custom_provider');
let engineOptions = {
  timeoutMs: 3000,
  referrer: 'www.example.com'
};
let nonMatchingEmbedURL = 'http://www.thiswillfail.com/fail';
let matchingEmbedURL = 'https://www.example.com/video/12345';
let embedURLs = [
  matchingEmbedURL,
  nonMatchingEmbedURL
];
let engine;

describe('EmbedEngine', function() {
  beforeEach(function () {
    engine = new EmbedEngine(engineOptions);
  });
  describe('EmbedEngine#constructor', function() {
    it('should have a valid engine.engineOptions object', function() {
      assert.equal(engine.engineOptions, engineOptions);
    });
  });

  describe('EmbedEngine#registerDefaultProviders', function() {
    it('should contain a populated providerRegistry of URLEmbedProvider instances', function() {
      engine.registerDefaultProviders();
      assert.isAbove(engine.providerRegistry.length, 0);
      for (let i = 0; i < engine.providerRegistry.length; i++) {
        assert.isTrue(engine.providerRegistry[i] instanceof URLEmbedProvider);
      }
    });
  });

  describe('EmbedEngine#registerProvider', function() {
    it('EmbedEngine.providerRegistry should contain the new provider', function() {
      let provider = new YoutubeProvider();
      engine.registerProvider(provider);
      assert.equal(engine.providerRegistry.length, 1);
      assert.equal(engine.providerRegistry[0], provider);
    });
  });

  describe('EmbedEngine#getEmbed', function() {
    it('should return markup for an embeddable url', function(done) {
      let engine = new EmbedEngine(engineOptions);
      engine.registerProvider(new CustomProvider());
      engine.getEmbed({embedURL : matchingEmbedURL}, function(embed) {
        assert.match(embed.data.html, /<iframe.*/);
        done();
      })
    });
  });

  describe('EmbedEngine#getEmbed', function() {
    it('should call EmbedEngine.errorMarkup for an url without a provider', function(done) {
      let engine = new EmbedEngine(engineOptions);
      engine.errorMarkup = function (embed, error, errorMessage) {
        return 'foo';
      }
      engine.getEmbed({embedURL: nonMatchingEmbedURL}, function(embed) {
        assert.equal(embed.data.html, 'foo');
        done();
      });
    });
  });

  describe('EmbedEngine#getMultipleEmbeds', function() {
    it('should return the same number of embeds as the original list', function(done) {
      this.timeout(5000);

      let engine = new EmbedEngine(engineOptions);
      engine.registerProvider(new CustomProvider());

      let optionArray = [];
      for (let i = 0; i < embedURLs.length; i++) {
        optionArray.push({embedURL : embedURLs[i]});
      }

      engine.getMultipleEmbeds(optionArray, function(error, results) {
        assert.equal(embedURLs.length, results.length);
        done();
      });

    });
  });
});