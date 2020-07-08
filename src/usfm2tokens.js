const xre =require('xregexp');
const fse = require('fs-extra');
import { v4 as uuid4 } from 'uuid';

class USFM2Tokens {

    /* INIT */

    constructor(usfmPath) {

        try { // Load USFM
            this.usfm = fse.readFileSync(usfmPath, "utf-8");
            } catch (err) {
                throw new Error(`Could not load USFM: ${err}`);
            }
        this.setup();
        this.matchProtoTokens();
        this.parseProtoTokens();
    }

    setup () {
        this.setupLookups();
        this.setupProtoTokenRegexes();
        this.setupUsfmLookups();
    }

    setupLookups() {
        this.protoTokens = [];
        this.headers = {};
        this.tokens = {
            body: [],
            heading: [],
            note: []
        };
        this.paras = {};
        this.parasByTag = {};
        this.chars = {};
        this.charsByTag = {};
        this.chapterVerses = {};
        this.headings = {};
        this.notes = {};
        this.words = {};
        this.errors = [];
        this.newTokenContext = {
            tokenDestination: "body",
            lastParaId: null,
            lastTokenId: {
                body: null,
                heading: null,
                note: null,
            },
            chapter: null,
            verses: null,
            chars: null,
            para: null,
            paraCount: 0
        };
        this.tokenContext = JSON.parse(JSON.stringify(this.newTokenContext));
    }

    setupProtoTokenRegexes() {
        this.protoTokenDetails = [
            [
                "cv",
                "([\\r\\n]*\\\\[cv][ \\t]\\d+[ \\t\\r\\n]*)",
                "[\\r\\n]*\\\\([cv])[ \\t](\\d+)[ \\t\\r\\n]*"
            ],
            [
                "tag",
                "(\\\\[a-z1-9\\-]+[* \\t]?)",
                "\\\\([a-z1-9\\-]+)([* \\t]?)"
            ],
            [
                "bareSlash",
                "(\\\\)",
                "\\\\"
            ],
            [
                "eol",
                "([\\r\\n]+)",
                "([\\r\\n]+)"
            ],
            [
                "text",
                "([^\\r\\n\\\\]+)",
                "([^\\r\\n\\\\]+)"
            ]
        ];
        this.mainRegex = xre(
            this.protoTokenDetails.map(x => x[1]).join("|")
        );
    }

    setupUsfmLookups() {
        this.usfmTags = {
            headers: ["id", "usfm", "ide", "sts", "rem", "h", "toc[1-9]", "toca[1-9]"],
            paras: [
                "mt[1-9]?", "mte[1-9]?", "ms[1-9]?", "mr", "s[1-9]?", "sr", "r", "d", "sp", "sd[1-9]?",
                "p", "m", "po", "pr", "cls", "pmo", "pm", "pmc", "pmr", "pi[1-9]?", "mi", "nb", "pc", "ph[1-9]?", "b",
                "q[1-9]?", "qr[1-9]?", "qc[1-9]?", "qa", "qm[1-9]?", "qd",
                "lh", "li[1-9]?", "lf", "lim[1-9]?"
            ],
            canonicalParas: [
                "d",
                "p", "m", "po", "pr", "cls", "pmo", "pm", "pmc", "pmr", "pi[1-9]?", "mi", "pc", "ph[1-9]?",
                "q[1-9]?", "qr[1-9]?", "qc[1-9]?", "qa", "qm[1-9]?", "qd",
                "lh", "li[1-9]?", "lf", "lim[1-9]?"
            ]
        };
    }

    /* PROTOTOKENS */

    matchProtoToken(matched) {
        let tObject = null;
        for (const protoTokenRecord of this.protoTokenDetails) {
            let [tName, tMatch, tSplit] = protoTokenRecord;
            if (xre.match(matched, xre(tMatch))) {
                tObject = {
                    type: tName,
                    matched: matched,
                    bits: xre.exec(matched, xre(tSplit)).slice(1)
                };
                break;
            };
        }
        return tObject;
    }

    matchProtoTokens() {
        xre.forEach(this.usfm, this.mainRegex, match => this.protoTokens.push(this.matchProtoToken(match[0])));
    }

    /* TAG TESTS */

    tagMatchesInArray(arr, str) {
        if (!str) {
            return false;
        }
        const matchingItems = arr.filter(i => xre.match(str, xre("^" + i + "$")));
        return (matchingItems.length === 1);
    }

    isHeaderTag(str) {
        return this.tagMatchesInArray(this.usfmTags.headers, str);
    }

    isParaTag(str) {
        return this.tagMatchesInArray(this.usfmTags.headers, str) || this.tagMatchesInArray(this.usfmTags.paras, str);
    }

    isCanonicalParaTag(str) {
        return this.tagMatchesInArray(this.usfmTags.canonicalParas, str);
    }

    getTextFragment(str) {
        const alphanumericRegex = xre("^([\\p{Letter}\\p{Number}]+)");
        const whitespaceRegex = xre("^([\\s]+)");
        const punctuationRegex = xre("^([\\p{Punctuation}+]+)");
        if (str.length === 0) {
            return ["", "", null]
        } else {
            var strMatch = alphanumericRegex.exec(str);
            if (strMatch) {
                return [strMatch[1], str.substring(strMatch[1].length), "alphanumeric"]
            } else {
                var strMatch = whitespaceRegex.exec(str);
                if (strMatch) {
                    return [strMatch[1], str.substring(strMatch[1].length), "whitespace"]
                } else {
                    var strMatch = punctuationRegex.exec(str);
                    if (strMatch) {
                        return [strMatch[1], str.substring(strMatch[1].length), "punctuation"]
                    } else {
                        throw `Could not match against '${str}' at para ${this.tokenContext.paraCount}`;
                    }
                }
            }
        }
    }

    /* PARSE PROTOTOKENS */

    lastTokenIdFor(dest) {
        return this.tokenContext.lastTokenId[dest];
    }

    setLastTokenIdFor(dest, val) {
        this.tokenContext.lastTokenId[dest] = val;
    }

    currentLastTokenId() {
        return this.lastTokenIdFor(this.tokenContext.tokenDestination);
    }

    setCurrentLastTokenId(val) {
        this.setLastTokenIdFor(this.tokenContext.tokenDestination, val);
    }

    makeTextTokens(pt) {
        let ptText = pt.matched;
        let ret = [];
        while (ptText.length > 0) {
            const [match, rest, matchType] = this.getTextFragment(ptText);
            const lastTokenId = this.currentLastTokenId();
            const thisTokenId = uuid4();
            const tokenObject = {
                tokenId: thisTokenId,
                previous: lastTokenId,
                type: matchType,    
                text: match
            };
            if (this.isCanonicalParaTag(this.tokenContext.para)) {
                if (this.tokenContext.chapter) {
                    tokenObject.chapter = this.tokenContext.chapter;
                }
                if (this.tokenContext.verses) {
                    tokenObject.verses = this.tokenContext.verses;
                }
            }   
            ret.push(tokenObject);
            this.setCurrentLastTokenId(thisTokenId);
            ptText = rest;
        }
        return ret;
    }

    makeEolToken(pt) {
        const lastTokenId = this.currentLastTokenId();
        const thisTokenId = uuid4();
        const tokenObject = {
            tokenId: thisTokenId,
            previous: lastTokenId,
            type: "eol",    
            text: pt.matched
        };
        this.setCurrentLastTokenId(thisTokenId);
        return tokenObject;
    }

    parseProtoTokens() {
        for (const protoToken of this.protoTokens) {
            if (protoToken.type === "bareSlash") {
                this.errors.push("Bare backslash in para " + this.tokenContext.paraCount);
            } else if (protoToken.type === "tag") {
                if (this.isHeaderTag(protoToken.bits[0])) {
                    this.headers[protoToken.bits[0]] = "";
                }
                if (this.isParaTag(protoToken.bits[0])) {
                    this.tokenContext.para = protoToken.bits[0];
                    this.tokenContext.paraCount++;
                }
            } else if (protoToken.type == "cv") {
                if (protoToken.bits[0] === "c") {
                    this.tokenContext.chapter = protoToken.bits[1];
                } else {
                    this.tokenContext.verses = protoToken.bits[1];
                }
            } else if (protoToken.type === "text") {
                if (this.isHeaderTag(this.tokenContext.para)) {
                    this.headers[this.tokenContext.para] += protoToken.matched;
                } else {
                    this.tokens[this.tokenContext.tokenDestination] = this.tokens[this.tokenContext.tokenDestination].concat(this.makeTextTokens(protoToken));
                }
            } else if (protoToken.type === "eol") {
                this.tokenContext.para = null;
                this.tokenContext.chars = [];
                this.tokens[this.tokenContext.tokenDestination].push(this.makeEolToken(protoToken));
            }
        }
    }

    /* ACCESSORS */

    reconstitutedUSFM() {
        return this.protoTokens.map(t => t.matched).join('');
    }

    textFromTokens() {
        return this.tokens[this.tokenContext.tokenDestination].map(t => t.text).join('');
    }

}

export default USFM2Tokens;