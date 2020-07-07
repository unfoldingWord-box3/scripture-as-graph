require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');

const USFM2Tokens = require('../src/usfm2tokens.js').default;

describe('Basic Tokenizing', function() {

    before(function () {
        this.testDataDir = path.join(__dirname, 'test_data');
    });

    it('PreTokenizes the text and returns it', function () {
        this.timeout(10000);
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_psa.usfm"));
        assert.equal(u2t.reconstitutedUSFM().length, u2t.usfm.length);
    });

    it('Extracts header info', function () {
        this.timeout(10000);
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_psa.usfm"));
        assert.equal(u2t.reconstitutedUSFM().length, u2t.usfm.length);
        for (const tag of ["ide", "h", "toc1", "toc2", "toc3"]) {
            assert.property(u2t.headers, tag);
        }
    });

    it('Reports bare backslashes', function () {
        this.timeout(10000);
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "bare_slash.usfm"));
        assert.equal(u2t.errors.length, 2);
    });

    it('Makes Text and EOL tokens', function () {
        this.timeout(10000);
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "bare_slash.usfm"));
        assert(u2t.bodyTokens.length > 0);
        for (const tokenType of ["alphanumeric", "punctuation", "whitespace", "eol"]) {
            assert(u2t.bodyTokens.filter(t => t.type == tokenType).length > 0);
        }
    });

});