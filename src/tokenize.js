'use strict';

const xre =require('xregexp');
const fse = require('fs-extra');

var tokens = [];
var usfm;

try {
    usfm = fse.readFileSync(process.argv[2], "utf-8");
} catch (err) {
    console.log("Could not load USFM:", err);
    return;
}

/*
    "([^\\r\\n\\\\]+)"
*/

const tokenDetails = [
    [
        "cv",
        "(\\\\[cv][ \\t]\\d+[ \\t]?)",
        "\\\\([cv])[ \\t](\\d+)[ \\t]?"
    ],
    [
        "tag",
        "(\\\\[a-z1-9\\\\-]+[\\\\* \\t]?)",
        "\\\\([a-z1-9\\\\-]+)([\\\\* \\t]?)"
    ],
    [
        "eol",
        "(\\r\\n)",
        "(\\r\\n)"
    ],
    [
        "eol",
        "(\\r)",
        "(\\r)"
    ],
    [
        "eol",
        "(\\n)",
        "(\\n)"
    ],
    [
        "text",
        "([^\\r\\n\\\\]+)",
        "([^\\r\\n\\\\]+)"
    ]
];

const regex = xre(
    tokenDetails.map(x => x[1]).join("|")
);

const matchToken = matched => {
    let tObject = null;
    for (const tokenRecord of tokenDetails) {
        const [tName, tMatch, tSplit] = tokenRecord;
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

xre.forEach(usfm, regex, match => tokens.push(matchToken(match[0])));

console.log(JSON.stringify(tokens, null, 2));
