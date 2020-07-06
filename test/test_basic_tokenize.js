require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');

const USFM2Tokens = require('../src/usfm2tokens.js').default;

describe('Basic Tokenizing', function() {

    before(function () {
        this.testDataDir = path.join(__dirname, 'test_data');
    });

    it('Tokenizes the text and returns it', function () {
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_psa.usfm"));
        assert.equal(u2t.reconstitutedUSFM().length, u2t.usfm.length);
    });

    it('Extracts header info', function () {
        const u2t = new USFM2Tokens(path.join(this.testDataDir, "en_ult_psa.usfm"));
        assert.equal(u2t.reconstitutedUSFM().length, u2t.usfm.length);
        for (const tag of ["ide", "h", "toc1", "toc2", "toc3"]) {
            assert.property(u2t.headers, tag);
        }
    });

});