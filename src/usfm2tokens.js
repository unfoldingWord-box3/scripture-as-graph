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
        this.tokens = {};
        this.paras = {};
        this.parasByTag = {};
        this.chapterVerses = {};
        this.standoff = {
            header: {},
            heading: {},
            rem: {},
            note: {},
            chars: {}
        }
        this.words = {};
        this.errors = [];
        this.newTokenContext = {
            tokenDestination: "body",
            lastParaId: null,
            lastTokenId: {
                body: null,
                header: null,
                heading: null,
                rem: null,
                note: null,
            },
            chapter: null,
            verses: null,
            charsStack: [],
            charsIdStack: [],
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
            headers: ["id", "usfm", "ide", "sts", "h", "toc[1-3]", "toca[1-3]"],
            paras: [
                "mt[1-9]?", "mte[1-9]?", "ms[1-9]?", "mr", "s[1-9]?", "sr", "r", "d", "sp", "sd[1-9]?",
                "cp", "cd",
                "p", "m", "po", "pr", "cls", "pmo", "pm", "pmc", "pmr", "pi[1-9]?", "mi", "nb", "pc", "ph[1-9]?", "b",
                "q[1-9]?", "qr[1-9]?", "qc[1-9]?", "qa", "qm[1-9]?", "qd", "cl",
                "lh", "li[1-9]?", "lf", "lim[1-9]?",
                "rem"
            ],
            canonicalParas: [
                "d",
                "p", "m", "po", "pr", "cls", "pmo", "pm", "pmc", "pmr", "pi[1-9]?", "mi", "pc", "ph[1-9]?",
                "q[1-9]?", "qr[1-9]?", "qc[1-9]?", "qa", "qm[1-9]?", "qd",
                "lh", "li[1-9]?", "lf", "lim[1-9]?"
            ],
            chars: [
                "rq",
                "ca", "va", "vp",
                "qs", "qac",
                "litl", "lik", "liv[1-9]?",
                "f", "fe", "fv", "fdc", "fm",
                "x", "xop", "xot", "xnt", "xdc",
                "add", "bk", "dc", "k", "nd", "ord", "pn", "png", "qt", "sig", "sls", "tl", "wj",
                "em", "bd", "it", "bdit", "no", "sc", "sup"
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

    isCharsTag(str) {
        return this.tagMatchesInArray(this.usfmTags.chars, str);
    }

    /* PARSE PROTOTOKENS */

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
            }
            if (this.tokenContext.verses) {
                token.verses = this.tokenContext.verses;
            }
            if (this.tokenContext.chapter || this.tokenContext.verses) {
                this.addTokenToCVLookup(token);
            }
        }
    }

    maybeAddParaToToken(token) {
        if (this.tokenContext.lastParaId) {
            token.para = this.tokenContext.lastParaId;
            const paraRecord = this.paras[this.tokenContext.lastParaId];
            paraRecord.lastToken = token.tokenId;
            if (!paraRecord.firstToken) {
                paraRecord.firstToken = token.tokenId;
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

    maybeUpdateChars(token) {
        if (this.tokenContext.charsIdStack.length > 0) {
            const charsRecord = Array.from(this.standoff.chars[this.tokenContext.charsStack[0]]).filter(x => x.charsId === this.tokenContext.charsIdStack[0])[0];
            charsRecord.lastToken = token.tokenId;
            if (!charsRecord.firstToken) {
                charsRecord.firstToken = token.tokenId;
            }
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
            this.maybeUpdateChars(tokenObject);
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
        this.maybeAddParaToToken(tokenObject);
        const ret = {};
        ret[thisTokenId] = tokenObject;
        this.setCurrentLastTokenId(thisTokenId);
        return ret;
    }

    newStandoffPara(standoffType, tagName, paraId) {
        this.tokenContext.tokenDestination = standoffType;
        this.tokenContext.lastTokenId.header = null;
        if (!(tagName in this.standoff[standoffType])) {
            this.standoff[standoffType][tagName] = new Set();
        }
        this.standoff[standoffType][tagName].add(paraId);
    }

    parseProtoTokens() {
        for (const protoToken of this.protoTokens) {
            if (protoToken.type === "bareSlash") {
                this.errors.push(`Bare backslash in para ${this.tokenContext.paraCount}`);
            } else if (protoToken.type === "tag") {
                const tagName = protoToken.bits[0];
                const tagStar = protoToken.bits[1];
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
                    this.tokenContext.charsStack = [];
                    if (this.isHeaderTag(tagName)) {
                        this.newStandoffPara("header", tagName, thisParaId);
                    } else if (this.isHeadingTag(tagName)) {
                        this.newStandoffPara("heading", tagName, thisParaId);
                    } else if (tagName == "rem") {
                        this.newStandoffPara("rem", tagName, thisParaId);
                    } else {
                        this.tokenContext.tokenDestination = "body";
                    }
                } else if (this.isCharsTag(tagName)) {
                    if (tagStar === "*") {
                        if (this.tokenContext.charsStack.length > 0 && this.tokenContext.charsStack[0] === tagName) {
                            this.tokenContext.charsStack.shift();
                            this.tokenContext.charsIdStack.shift();
                        } else {
                            const errMsg = `Char mismatch (${this.tokenContext.charsStack.length > 0 ? this.tokenContext.charsStack[0] : "<none>"}/${tagName})`;
                            // console.log(errMsg);
                            this.errors.push(errMsg);
                        }
                    } else {
                        const charsId = uuid4();
                        if (!(tagName in this.standoff.chars)) {
                            this.standoff.chars[tagName] = new Set();
                        }
                        this.standoff.chars[tagName].add({
                            charsId: charsId,
                            paraId: this.tokenContext.lastParaId,
                            tag: tagName,
                            firstToken: null,
                            lastToken: null
                        });
                        this.tokenContext.charsStack.unshift(tagName);
                        this.tokenContext.charsIdStack.unshift(charsId);
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
                this.addTokens(
                    this.makeTextTokens(protoToken)
                )
            } else if (protoToken.type === "eol") {
                this.addTokens(
                    this.makeEolToken(protoToken)
                )
            }
        }
    }

    /* TOKEN LINKED LISTS */

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

    textForTokenRange(firstT, lastT, singleLine) {
        let textArray = this.tokenRange(firstT, lastT).map(t => this.normalizedText(t, singleLine));
        return textArray.join('');
    }

    textFromParas(lastParaId) {
        let texts = [];
        let paraId = lastParaId || this.tokenContext.lastParaId;
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

    describePara(para) {
        let tokens = this.tokenRange(para.firstToken, para.lastToken);
        console.log(`${para.paraId} (${para.tag}, ${tokens.length} token(s))`);
        for (const t of tokens) {
            console.log(`    ${t.tokenId} (${t.type}) ${this.normalizedText(t)}`);
        }
    }

    describeParas() {
        let paraId = this.tokenContext.lastParaId;
        while (paraId) {
            let para = this.paras[paraId];
            this.describePara(para);
            paraId = para.previous;
        }
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

    describeHeadings() {
        return this.describeStandoff("heading");
    }

    describeHeaders() {
        return this.describeStandoff("header");
    }

    describeStandoff(standoffType) {
        const ret = [];
        for (const [k, v] of Object.entries(this.standoff[standoffType])) {
            ret.push(`${k}:\n` +
                Array.from(v).map(
                    pi => {
                        const sectionText = this.textFromPara(this.paras[pi]);
                        return (sectionText.trim().length > 0 ? `   '${sectionText}'\n` : '   <empty>\n');
                    }
                ).join('')
            )
        }
        return ret.join("\n");
    }

    describeChars() {
        const ret = [];
        for (const [k, v] of Object.entries(this.standoff.chars)) {
            ret.push(`${k}:\n` +
                Array.from(v).map(
                    ch => {
                        const sectionText = this.textFromPara(ch);
                        return (sectionText.trim().length > 0 ? `   '${sectionText}'\n` : '   <empty>\n');
                    }
                ).join('')
            )
        }
        return ret.join("\n");
    }
}

export default USFM2Tokens;