'use strict';
const usfmjs = require('usfm-js');
const fse = require('fs-extra');
const xre = require('xregexp');

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

// Function to extract tokens from text

const getToken = function(str) {
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
                    throw `Could not match against '${str}' at Ch ${currentChapter}:${currentVerse}`;
                }
            }
        }
    }
}

// Process chapters

for (var [chapter, chapterV] of Object.entries(usfmJSON.chapters)) {
    currentVerse = null;
    tokenized.chapterVerses[chapter] = {
        verses: {}  
    };
    const cNode = tokenized.chapterVerses[chapter]; 
    for (var [verse, verseV] of Object.entries(chapterV)) {
        currentChapter = (verse === "front") ? null : chapter;
        currentVerse = (verse === "front") ? null : verse;
        if (currentVerse) {
            cNode.verses[verse] = {
                text: "",
                tokens: {}
            }
            const vNode = cNode.verses[verse];
            var verseText = "";
            for (var verseOb of verseV.verseObjects) {
                if ("text" in verseOb) {
                    verseText += verseOb.text;
                }
            }
            vNode.text += verseText;
            while (verseText.length > 0) {
                const [match, rest, matchType] = getToken(verseText);
                const tokenId = nextTokenId++;
                tokenized.tokens.push({
                    tokenId: tokenId,
                    type: matchType,    
                    text: match,
                    chapter: currentChapter,
                    verse: currentVerse
                });
                vNode.tokens[tokenId] = true;
                verseText = rest;
            }
        }
    }

}

console.log(JSON.stringify(tokenized.chapterVerses, null, 2))