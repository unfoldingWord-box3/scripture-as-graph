'use strict';
const usfmjs = require('usfm-js');
const fse = require('fs-extra');

// node import.js <usfmPath>

// Read USFM using USFM-JS

const usfm = fse.readFileSync(process.argv[2], "utf-8");
const usfmJSON = usfmjs.toJSON(usfm);
// console.log(JSON.stringify(usfmJSON, null, 2));

// Set up tokenizer

const tokenized = {
    headers: usfmJSON.headers,
    chapterVerses: {},
    paras: [],
    tokens: []
};

var nextTokenId = 0;
var nextPara = 0;
var currentChapter = null;
var currentVerse = null;

// Process chapters

const getToken = function(str) {
    const alphanumericRegex = /^([A-Za-z0-9]+)/;
    const whitespaceRegex = /^(\s+)/;
    const punctuationRegex = /^([^A-Za-z0-9\s]+)/;
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
                return [strMatch[1], str.substring(strMatch[1].length), "punctuation"]
            }
        }
    }
}

for (var [chapter, chapterV] of Object.entries(usfmJSON.chapters)) {
    currentVerse = null;
    tokenized.chapterVerses[chapter] = {
        verses: {}  
    };
    for (var [verse, verseV] of Object.entries(chapterV)) {
        currentChapter = (verse === "front") ? null : chapter;
        currentVerse = (verse === "front") ? null : verse;
        if (currentVerse) {
            tokenized.chapterVerses[chapter].verses[verse] = {
                text: ""
            }
            var verseText = "";
            for (var verseOb of verseV.verseObjects) {
                if (verseOb.type === "text") {
                    verseText += verseOb.text;
                }
            }
            tokenized.chapterVerses[chapter].verses[verse].text += verseText;
            while (verseText.length > 0) {
                var [match, rest, matchType] = getToken(verseText);
                // console.log(currentChapter, match, rest)
                if (match.length > 0) {
                    tokenized.tokens.push({
                        tokenId: nextTokenId++,
                        type: matchType,
                        text: match,
                        chapter: currentChapter,
                        verse: currentVerse
                    });
                }
                verseText = rest;
            }
        }
    }

}

console.log(JSON.stringify(tokenized, null, 2))