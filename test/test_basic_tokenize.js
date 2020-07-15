require = require('esm')(module /* , options */);
const assert = require('chai').assert;
const path = require('path');
const fse = require('fs-extra');

const usfmFromPath = require('../lib/usfmFromPath.js').default;

describe('Basic Tokenizing', function() {

    before(function () {
        this.testDataDir = path.join(__dirname, 'test_data');
    });

    it('PreTokenizes the text and returns it (On Psalms, slow)', function () {
        this.timeout(10000);
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_psa.usfm"));
        assert.equal(u2t.reconstitutedUSFM().length, u2t.usfm.length);
    });

    it('Extracts header info', function () {
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert.equal(u2t.reconstitutedUSFM().length, u2t.usfm.length);
        for (const tag of ["ide", "h", "toc1", "toc2", "toc3"]) {
            assert.property(u2t.standoff.header, tag);
            assert(u2t.standoff.header[tag].size > 0);
        }
        for (const paraId of Array.from(u2t.standoff.header["toc1"])) {
            const para = u2t.paras[paraId];
            assert.match(u2t.textFromPara(para), /The Book of Lamentations/);
        }
    });

    it('Reports bare backslashes', function () {
        const u2t = usfmFromPath(path.join(this.testDataDir, "bare_slash.usfm"));
        assert.equal(u2t.errors.length, 2);
    });

    it('Makes Text and EOL tokens', function () {
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert(Object.keys(u2t.tokens).length > 0);
        for (const tokenType of ["alphanumeric", "punctuation", "whitespace", "eol"]) {
            assert(Object.values(u2t.tokens).filter(t => t.type === tokenType).length > 0);
        }
    });

    it('Returns text from tokens', function() {
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert.match(u2t.bodyTextFromTokens(), /We get our bread only by risking our lives/);
    });

    it('Builds an index to paras', function() {
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert.equal(u2t.textFromParas().split("\n")[0].charAt(0), "[");
    });

    it('Builds an index to chapter/verse', function() {
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert.match(u2t.textForCV("1", "12"), /nothing to you, all you who pass by/);
    });

    it('Builds a word index', function() {
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_lam.usfm"));
        assert(u2t.cvForWord("yahweh").length > 0);
        assert(u2t.cvForWord("elders").length > 0);
        assert(u2t.cvForWord("banana").length === 0);
    });

    it('Finds word in verses', function() {
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_lam.usfm"));
        const eldersInVerses = u2t.wordInVerses("elders");
        assert.equal(eldersInVerses.length, u2t.cvForWord("elders").length);
        for(const v of eldersInVerses) {
            assert.match(v, /<elders>/);
        }
    });

    it('Finds word frequencies', function() {
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_lam.usfm"));
        const frequencies = u2t.wordFrequencies(17);
        for (const wc of frequencies) {
            const [word, count] = wc.split(": ");
            assert(parseInt(count) >= 17);
            assert(word.length > 0)
        }
    });

    it('Stores headings separately', function() {
        const u2t = usfmFromPath(path.join(this.testDataDir, "oeb_jol.usfm"));
        ["mt", "s"].forEach(h => {
            assert.property(u2t.standoff.heading, h)
        });
    });

    it('Stores rems separately', function() {
        const u2t = usfmFromPath(path.join(this.testDataDir, "oeb_jol.usfm"));
        let found = false;
        for (const paraId of Array.from(u2t.standoff.rem["rem"])) {
            const para = u2t.paras[paraId];
            if (u2t.textFromPara(para) === "NRSV and JPS versification") {
                found = true;
                break
            };
        }
        assert(found);
    });

    it('Indexes chars (On Psalms, slow)', function() {
        this.timeout(10000);
        const u2t = usfmFromPath(path.join(this.testDataDir, "en_ult_psa.usfm"));
        assert.property(u2t.standoff.chars, "qs");
        assert.equal(u2t.textFromPara(Array.from(u2t.standoff.chars.qs)[0]), "Selah");
    })

});