'use strict';
require = require('esm')(module /* , options */);
const path = require('path');

const U2T = require('../src/usfm2tokens.js').default;

var timestamp;

const elapsedTime = function () {
    const now = new Date().getTime();
    const ret = now - timestamp;
    timestamp = now;
    return ret;
}

const heapUsed = function() {
    return (Math.round(process.memoryUsage().heapUsed / 1024 / 1024)) + " Mb";
}

const usage = function() {
    const pathBase = path.parse(process.argv[1]).base;
    console.log("\n* USAGE *");
    console.log("node", pathBase, "<usfmPath>", "stats");
    console.log("node", pathBase, "<usfmPath>", "protoTokens");
    console.log("node", pathBase, "<usfmPath>", "usfm");
    console.log("node", pathBase, "<usfmPath>", "tokens");
    console.log("node", pathBase, "<usfmPath>", "tokensText");
    console.log("node", pathBase, "<usfmPath>", "paras");
    console.log("node", pathBase, "<usfmPath>", "parasText");
    console.log("node", pathBase, "<usfmPath>", "describeParas");
    console.log("node", pathBase, "<usfmPath>", "describeHeadings");
    console.log("node", pathBase, "<usfmPath>", "verse", "<chapter>", "<verse>");
    console.log("node", pathBase, "<usfmPath>", "verses", "<fromChapter>", "<fromVerse>", "<toChapter>", "<toVerse>");
    console.log("node", pathBase, "<usfmPath>", "wordSearch", "<lcWord>");
    console.log("node", pathBase, "<usfmPath>", "wordFrequencies", "<minCount>?");
}

if (process.argv.length < 3) {
    throw new Error(`Not enough arguments: '${process.argv[0]} ${process.argv[1]} help' might, err, help`);
}

if (process.argv[2] === "help") {
    usage();
} else {
    const scriptName = process.argv[1];
    const usfmSource = process.argv[2];
    const commandType = process.argv[3];
    const otherArgs = process.argv.slice(4);
    elapsedTime();
    const u2t = new U2T(usfmSource);
    console.log(`Init in ${elapsedTime()} msec`);
    if (commandType === "stats") {
        console.log("\nCOUNTS OF INTERNALS");
        console.log("  Tokens:", Object.keys(u2t.tokens).length);
        console.log("  Chapters", Object.keys(u2t.chapterVerses).length);
        console.log("  Verses:", Object.values(u2t.chapterVerses).map(
            c => Object.keys(c).length).reduce((acc, v) => acc + v)
        );
        console.log("  Unique Words:", Object.keys(u2t.words).length);
    } else if (commandType === "protoTokens") {
        console.log("\nPROTOTOKENS");
        console.log(JSON.stringify(u2t.protoTokens, null, 2));
    } else if (commandType === "usfm") {
        console.log("\nUSFM FROM PRE-TOKENS");
        console.log(u2t.reconstitutedUSFM());
    } else if (commandType === "tokens") {
        console.log("\nTOKENS");
        console.log(JSON.stringify(u2t.tokens, null, 2));
    } else if (commandType === "tokensText") {
        console.log("\nNORMALIZED TEXT FROM TOKENS");
        console.log(u2t.bodyTextFromTokens());
    } else if (commandType === "paras") {
        console.log("\nPARAS");
        console.log(JSON.stringify(u2t.paras, null, 2));
    } else if (commandType === "parasText") {
        console.log("\nTEXT FROM PARAS");
        console.log(u2t.textFromParas());
    } else if (commandType === "describeParas") {
        console.log("\nDESCRIBE PARAS");
        u2t.describeParas();
    } else if (commandType === "describeHeadings") {
        console.log("\nHEADINGS");
        console.log(u2t.describeHeadings());
    } else if (commandType === "verse") {
        console.log("\nTEXT FOR ONE VERSE");
        console.log(
            u2t.textForCV(
                otherArgs[0],
                otherArgs[1]
            )
        );
    } else if (commandType === "verses") {
        console.log("\nTEXT FOR VERSES");
        console.log(
            u2t.textForCV(
                otherArgs[0],
                otherArgs[1],
                otherArgs[2],
                otherArgs[3]
            )
        );
    } else if (commandType === "wordSearch") {
        console.log("\nWORD SEARCH");
        console.log(u2t.wordInVerses(otherArgs[0]).join("\n"));
    } else if (commandType === "wordFrequencies") {
        const minCount = parseInt(otherArgs[0] || "20");
        console.log(`\nWORD FREQUENCIES (>= ${minCount})`);
        console.log(u2t.wordFrequencies(minCount).join("\n"));
    } else {
        usage();
    }
    console.log("\nQuery in", elapsedTime(), "msec");
    console.log(heapUsed(), "used after query");
    }
