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
        this.tokens = {};
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
            headers: ["id", "usfm", "ide", "sts", "rem", "h", "toc[1-3]", "toca[1-3]"],
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
            ],
            headings: [
                "mt[1-9]?", "mte[1-9]?", "ms[1-9]?", "mr", "s[1-9]?", "sr", "r", "sp", "sd[1-9]?"
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

    isHeadingTag(str) {
        return this.tagMatchesInArray(this.usfmTags.headings, str);
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
            let strMatch = alphanumericRegex.exec(str);
            if (strMatch) {
                return [strMatch[1], str.substring(strMatch[1].length), "alphanumeric"]
            } else {
                strMatch = whitespaceRegex.exec(str);
                if (strMatch) {
                    return [strMatch[1], str.substring(strMatch[1].length), "whitespace"]
                } else {
                    strMatch = punctuationRegex.exec(str);
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

    addTokens(tokens) {
        for (const [k, v] of Object.entries(tokens)) {
            this.tokens[k] = v;
        }
    }

    normalizedText(token, singleLine) {
        if (token.type == "whitespace") {
            return " ";
        } else if (token.type == "eol") {
            return singleLine ? " ": "\n";
        } else {
            return token.text;
        }
    }

    addTokenToCVLookup(token) {
        const cvTokensRecord = this.chapterVerses[this.tokenContext.chapter][this.tokenContext.verses];
        cvTokensRecord.lastToken = token.tokenId;
        if (!cvTokensRecord.firstToken) {
            cvTokensRecord.firstToken = token.tokenId;
        }
    }

    maybeAddCVToToken(token) {
        if (this.isCanonicalParaTag(this.tokenContext.para)) {
            if (this.tokenContext.chapter) {
                token.chapter = this.tokenContext.chapter;
                this.addTokenToCVLookup(token);
            }
            if (this.tokenContext.verses) {
                token.verses = this.tokenContext.verses;
                this.addTokenToCVLookup(token);
            }
        }
    }

    maybeAddParaToToken(token) {
        if (this.tokenContext.lastParaId) {
            token.para = this.tokenContextLastParaId;
            const paraRecord = this.paras[this.tokenContext.lastParaId];
            paraRecord.lastToken = this.currentLastTokenId();
            if (!paraRecord.firstToken) {
                paraRecord.firstToken = this.currentLastTokenId();
            }
        }
    }

    addWordLookup(token) {
        if (token.type === "alphanumeric") {
            token.word = token.text.toLowerCase();
            if (!(token.word in this.words)) {
                this.words[token.word] = new Set();
            }
            this.words[token.word].add(token.tokenId);
        }
    }

    makeTextTokens(pt) {
        let ptText = pt.matched;
        let ret = {};
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
            this.maybeAddParaToToken(tokenObject);
            this.maybeAddCVToToken(tokenObject);
            this.addWordLookup(tokenObject);
            ret[thisTokenId] = tokenObject;
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
        this.maybeAddParaToToken(tokenObject);
        const ret = {};
        ret[thisTokenId] = tokenObject;
        return ret;
    }

    parseProtoTokens() {
        for (const protoToken of this.protoTokens) {
            if (protoToken.type === "bareSlash") {
                this.errors.push(`Bare backslash in para ${this.tokenContext.paraCount}`);
            } else if (protoToken.type === "tag") {
                const tagName = protoToken.bits[0];
                if (this.isHeaderTag(tagName)) {
                    this.headers[protoToken.bits[0]] = [];
                }
                if (this.isParaTag(tagName)) {
                    const lastParaId = this.tokenContext.lastParaId;
                    const thisParaId = uuid4();
                    this.paras[thisParaId] = {
                        paraId: thisParaId,
                        previous: lastParaId,
                        count: this.tokenContext.paraCount++,
                        tag: tagName,
                        firstToken: null,
                        lastToken: null
                    };
                    this.tokenContext.lastParaId = thisParaId;
                    this.tokenContext.para = tagName;
                    this.tokenContext.chars = [];
                    if (this.isHeadingTag(tagName)) {
                        this.tokenContext.tokenDestination = "heading";
                        this.tokenContext.lastTokenId.heading = null;
                        if (!(tagName in this.headings)) {
                            this.headings[tagName] = new Set();
                        }
                        this.headings[tagName].add(thisParaId); 
                    } else {
                        this.tokenContext.tokenDestination = "body";
                    }
                }
            } else if (protoToken.type == "cv") {
                const [cvType, cvVal] = protoToken.bits;
                if (cvType === "c") {
                    this.tokenContext.chapter = cvVal;
                    this.tokenContext.verses = "0";
                    this.chapterVerses[cvVal] = {
                        "0": {
                            firstToken: null,
                            lastToken: null
                        }
                    }
                } else {
                    this.tokenContext.verses = cvVal;
                    this.chapterVerses[this.tokenContext.chapter][cvVal] = {
                        firstToken: null,
                        lastToken: null
                    }
                }
            } else if (protoToken.type === "text") {
                if (this.isHeaderTag(this.tokenContext.para)) {
                    this.headers[this.tokenContext.para].push(protoToken.matched);
                } else {
                    this.addTokens(
                        this.makeTextTokens(protoToken)
                    )
                }
            } else if (protoToken.type === "eol") {
                this.addTokens(
                    this.makeEolToken(protoToken)
                )
            }
        }
    }

    /* ACCESSORS (currently mainly for testing) */

    reconstitutedUSFM() {
        return this.protoTokens.map(t => t.matched).join('');
    }

    bodyTextFromTokens() {
        let texts = [];
        let tokenId = this.tokenContext.lastTokenId.body;
        while (tokenId) {
            let token = this.tokens[tokenId];
            texts.push(this.normalizedText(token, false));
            tokenId = token.previous;
        }
        return texts.reverse().join('');
    }

    textFromPara(para) {
        return this.textForTokenRange(para.firstToken, para.lastToken, true);
    }

    tokenRange(firstT, lastT) {
        let ret = [];
        let tokenId = lastT;
        while (tokenId) {
            let token = this.tokens[tokenId];
            ret.push(token);
            if (tokenId == firstT) {
                break;
            }
            tokenId = token.previous;
        };
        return ret.reverse();
    }

    textForTokenRange(firstT, lastT, singleLine) {
        let textArray = this.tokenRange(firstT, lastT).map(t => this.normalizedText(t, singleLine));
        return textArray.join('');
    }

    textFromParas() {
        let texts = [];
        let paraId = this.tokenContext.lastParaId;
        while (paraId) {
            let para = this.paras[paraId];
            if (!this.isHeaderTag(para.tag)) {
                const paraText = this.textFromPara(para);
                if (paraText !== '') {
                    texts.push(`[${para.tag}] ${paraText.trim()}`);
                }
            }
            paraId = para.previous;
        }
        return texts.reverse().join('\n');
    }

    textForCV(c, v, c2, v2) {
        const cvTokensRecord = this.chapterVerses[c][v];
        if (v2) {
            const cv2TokensRecord = this.chapterVerses[c2][v2];
            return this.textForTokenRange(
                cvTokensRecord.firstToken,
                cv2TokensRecord.lastToken,
                true
            );
        } else {
            return this.textForTokenRange(
                cvTokensRecord.firstToken,
                cvTokensRecord.lastToken,
                true
            );
        }
    }

    cvForWord(w) {
        const cvs = new Set();
        const wordSet = this.words[w];
        if (wordSet) {
            wordSet.forEach(
                ti => {
                    const token = this.tokens[ti];
                    if (token.chapter && token.verses) {
                        cvs.add([token.chapter, token.verses].join(":"));
                    }
                }
            );
        }
        return Array.from(cvs);
    }

    wordInVerses(w) {
        return this.cvForWord(w).map(
            cv => {
                const [c, v] = cv.split(":");
                const cvTokensRecord = this.chapterVerses[c][v];
                const tRange = this.tokenRange(
                    cvTokensRecord.firstToken,
                    cvTokensRecord.lastToken
                );
                const highlightedText = tRange.map(
                    t => t.word === w ? `<${t.text}>` : this.normalizedText(t, true)
                    ).join("");
                return `[${cv}] ${highlightedText}`;
            }
        );
    }

    wordFrequencies(minCount) {
        return Object.entries(this.words).filter(
            kv => kv[1].size >= minCount
            ).sort(
                (a, b) => b[1].size - a[1].size
                ).map(
                    kv => `${kv[0]}: ${kv[1].size}`
                );

    }

    reportHeadings() {
        const ret = [];
        for (const [k, v] of Object.entries(this.headings)) {
            ret.push(`${k}: ` +
                Array.from(v).map(
                    pi => `\n  ${this.textFromPara(this.paras[pi])}`
                ).join('')
            )
        }
        return ret.join("\n");
    }

}

export default USFM2Tokens;