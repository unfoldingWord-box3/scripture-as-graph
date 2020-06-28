'use strict';
const usfmjs = require('usfm-js');
const fse = require('fs-extra');
const xre = require('xregexp');

// node import.js <usfmPath>

// Read USFM using USFM-JS

const usfm = fse.readFileSync(process.argv[2], "utf-8");

class SAG {

    constructor(usfm) {
        this.usfmJSON = usfmjs.toJSON(usfm);
        this.headers = this.usfmJSON.headers;
        this.chapterVerses = {};
        this.paras = [];
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

    wordTokens(tokens) {
        return tokens.filter(t => t.type === "alphanumeric");
    }

    normalizeSpace(str) {
        return xre("^\\s+").exec(str) ? " " : str;
    }

}

const sag = new SAG(usfm);

console.log("* The original text *");
console.log(sag.tokensForVerses("1", ["1"]).map(t => sag.tokenText(t)).join(""));

console.log("\n* Words only *");
console.log(sag.wordTokens(sag.tokensForVerses("1", ["1"])).map(t => sag.tokenText(t)).join(" "));

console.log("\n* Words and punctuation with normalized whitespace *");
console.log(sag.tokensForVerses("1", ["1"]).map(t => sag.normalizeSpace(sag.tokenText(t))).join(""));

console.log("\n* Several verses *");
console.log(sag.tokensForVerses("119", ["9", "10", "11", "12", "13", "14", "15", "16"]).map(t => sag.normalizeSpace(sag.tokenText(t))).join(""));
