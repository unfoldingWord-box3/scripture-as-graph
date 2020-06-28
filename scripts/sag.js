'use strict';
const usfmjs = require('usfm-js');
const fse = require('fs-extra');
const xre = require('xregexp');
const path = require('path');

// node import.js <usfmPath>

class SAG {

    constructor(usfm) {
        this.usfmJSON = usfmjs.toJSON(usfm);
        this.headers = this.usfmJSON.headers;
        this.chapterVerses = {};
        this.words = {};
        this.tokens = {};
        this.currentChapter = null;
        this.currentVerse = null;
        this.processChapters();
    }

    getToken(str) {
        const alphanumericRegex = xre("^([\\p{Letter}\\p{Number}]+)");
        const whitespaceRegex = xre("^([\\s]+)");
        const punctuationRegex = xre("^(\\p{Punctuation}+)");
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
                        throw `Could not match against '${str}' at Ch ${this.currentChapter}:${this.currentVerse}`;
                    }
                }
            }
        }
    }

    processChapters() {
        var nextTokenId = 0;
        for (var [chapter, chapterV] of Object.entries(this.usfmJSON.chapters)) {
            this.currentVerse = null;
            this.chapterVerses[chapter] = {
                verses: {}  
            };
            const cNode = this.chapterVerses[chapter]; 
            for (var [verse, verseV] of Object.entries(chapterV)) {
                this.currentChapter = (verse === "front") ? null : chapter;
                this.currentVerse = (verse === "front") ? null : verse;
                if (this.currentVerse) {
                    cNode.verses[verse] = {
                        tokens: {}
                    }
                    const vNode = cNode.verses[verse];
                    var verseText = "";
                    for (var verseOb of verseV.verseObjects) {
                        if ("text" in verseOb) {
                            verseText += verseOb.text;
                        }
                    }
                    while (verseText.length > 0) {
                        const [match, rest, matchType] = this.getToken(verseText);
                        const tokenId = ("000000" + nextTokenId++).slice(-6);
                        this.tokens[tokenId] = {
                            tokenId: tokenId,
                            type: matchType,    
                            text: match,
                            chapter: this.currentChapter,
                            verse: this.currentVerse
                        };
                        if (matchType === "alphanumeric") {
                            const normalized = this.normalizeWord(match);
                            this.tokens[tokenId].normalizedWord = normalized;
                            if (normalized in this.words) {
                                this.words[normalized].tokens.add(tokenId);
                            } else {
                                this.words[normalized] = {tokens: new Set([tokenId])};
                            }
                        }
                        vNode.tokens[tokenId] = true;
                        verseText = rest;
                    }
                }
            }
        
        }    
    }

    compareByKey(a, b, k) {
        if (a[k] > b[k]) {
            return 1;
        } else if (a[k] < b[k]) {
            return -1;
        } else {
            return 0;
        }
    }

    resolveAndSortTokens(tokenIds) {
        return tokenIds.map(
            t => this.tokens[t]
        ).sort(
            (a, b) => this.compareByKey(a, b, "tokenId")
        );
    }

    tokensForVerses(ch, vrs) {
        return this.resolveAndSortTokens(
            vrs.reduce(
                (acc, v) => acc.concat( 
                    Object.keys(
                        this.chapterVerses[ch].verses[v].tokens
                    )
                ),
                []
            )
        );
    }

    tokenText(token) {
        return token.text;
    }

    normalizedText(token) {
        return token.normalizedWord;
    }

    wordTokens(tokens) {
        return tokens.filter(t => t.type === "alphanumeric");
    }

    normalizeSpace(str) {
        return xre("^\\s+").exec(str) ? " " : str;
    }

    normalizeWord(str) {
        return str.toLowerCase();
    }

    wordsByFrequency() {
        const wordArray = Array.from(Object.entries(this.words));
        wordArray.sort(
            (a, b) => {
                if (a[1].tokens.size > b[1].tokens.size) {
                    return 1;
                } else if (a[1].tokens.size < b[1].tokens.size) {
                    return -1;
                } else {
                    return 0;
                }
            }
        );
        return wordArray;
    }

    formatWordCountEntry(kv) {
        const [word, data] = kv;
        const tokens = data.tokens;
        return word + " - " + this.wordCV(tokens).join(", ");
    }

    wordCV(tokenSet) {
        const cv = new Set();
        for (const tokenId of Array.from(tokenSet)) {
            const token = this.tokens[tokenId];
            cv.add(token.chapter + ":" + token.verse)
        }
        return Array.from(cv);
    }

}

const usage = function() {
    const pathBase = path.parse(process.argv[1]).base;
    console.log("\n* USAGE *");
    console.log("node", pathBase, "<usfmPath>", "stats");
    console.log("node", pathBase, "<usfmPath>", "originalText", "23", "1,2,3");
    console.log("node", pathBase, "<usfmPath>", "alphanumericOnlyText", "23", "1,2,3");
    console.log("node", pathBase, "<usfmPath>", "wordRoots", "23", "1,2,3");
    console.log("node", pathBase, "<usfmPath>", "normalizedText", "23", "1,2,3");
    console.log("node", pathBase, "<usfmPath>", "wordSearch", "faithfulness");
    console.log("node", pathBase, "<usfmPath>", "frequency", "200");
}

var usfm;
try {
    usfm = fse.readFileSync(process.argv[2], "utf-8");
} catch (err) {
    console.log("Could not load USFM:", err);
    usage();
    return;
}

const sag = new SAG(usfm);

if (process.argv[3] === "stats") {
    console.log("Tokens:", Object.keys(sag.tokens).length);
    console.log("Chapters", Object.keys(sag.chapterVerses).length);
    console.log("Verses:", Object.values(sag.chapterVerses).map(c => Object.keys(c.verses).length).reduce((acc, v) => acc + v));
    console.log("Unique Words:", Object.keys(sag.words).length);
} else if (process.argv[3] === "usfmjs") {
    console.log(JSON.stringify(sag.usfmJSON, null, 2));
} else if (process.argv[3] === "originalText") {
    console.log(sag.tokensForVerses(process.argv[4], process.argv[5].split(",")).map(t => sag.tokenText(t)).join(""));
} else if (process.argv[3] === "alphanumericOnlyText") {
    console.log(sag.wordTokens(sag.tokensForVerses(process.argv[4], process.argv[5].split(","))).map(t => sag.tokenText(t)).join(" "));
} else if (process.argv[3] === "wordRoots") {
    console.log(sag.wordTokens(sag.tokensForVerses(process.argv[4], process.argv[5].split(","))).map(t => sag.normalizedText(t)).join(" "));
} else if (process.argv[3] === "normalizedText") {
    console.log(sag.tokensForVerses(process.argv[4], process.argv[5].split(",")).map(t => sag.normalizeSpace(sag.tokenText(t))).join(""));
} else if (process.argv[3] === "wordSearch") {
    console.log(process.argv[4] + " - " + sag.wordCV(sag.words[process.argv[4]].tokens).join(", "));
} else if (process.argv[3] === "frequency") {
    console.log(sag.wordsByFrequency().reverse().filter(kv => kv[1].tokens.size > process.argv[4]).map(kv => kv[0] + ": " + kv[1].tokens.size));
} else {
    usage();
}
