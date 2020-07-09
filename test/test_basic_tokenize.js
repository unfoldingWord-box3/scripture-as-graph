require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');

const USFM2Tokens = require('../src/usfm2tokens.js').default;

describe('Basic Tokenizing', function() {

    before(function () {
        this.testDataDir = path.join(__dirname, 'test_data');
    });

    it('PreTokenizes the text and returns it (On Psalms, slow)', function () {
        this.timeout(10000);
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_psa.usfm"));
        assert.equal(u2t.reconstitutedUSFM().length, u2t.usfm.length);
    });

    it('Extracts header info', function () {
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert.equal(u2t.reconstitutedUSFM().length, u2t.usfm.length);
        for (const tag of ["ide", "h", "toc1", "toc2", "toc3"]) {
            assert.property(u2t.headers, tag);
            assert(u2t.headers[tag].length > 0);
        }
    });

    it('Reports bare backslashes', function () {
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "bare_slash.usfm"));
        assert.equal(u2t.errors.length, 2);
    });

    it('Makes Text and EOL tokens', function () {
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert(Object.keys(u2t.tokens.body).length > 0);
        for (const tokenType of ["alphanumeric", "punctuation", "whitespace", "eol"]) {
            assert(Object.values(u2t.tokens.body).filter(t => t.type == tokenType).length > 0);
        }
    });

    it('Returns text from tokens', function() {
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert.match(u2t.textFromBodyTokens(), /We get our bread only by risking our lives/);
    });

    it('Builds an index to paras', function() {
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert.equal(u2t.textFromParas().split("\n")[0].charAt(0), "[");
    });

    it('Builds an index to chapter/verse', function() {
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert.match(u2t.textForCV("1", "12"), /nothing to you, all you who pass by/);
    });

    it('Builds a word index', function() {
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert(u2t.cvForWord("yahweh").length > 0);
        assert(u2t.cvForWord("elders").length > 0);
        assert(u2t.cvForWord("banana").length == 0);
    });


});