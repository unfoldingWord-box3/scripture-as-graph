const xre =require('xregexp');
const fse = require('fs-extra');

class USFM2Tokens {

    constructor(usfmPath) {
        this.tokens = [];
        try {
            this.usfm = fse.readFileSync(usfmPath, "utf-8");
            } catch (err) {
                throw new Error(`Could not load USFM: ${err}`);
            }   
        this.tokenDetails = [
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
                "bareSlash",
                "(\\\\)",
                "\\\\"
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
        this.mainRegex = xre(
            this.tokenDetails.map(x => x[1]).join("|")
        );
        this.usfmTags = {
            headers: ["id", "usfm", "ide", "sts", "rem", "h", "toc[1-9]", "toca[1-9]"],
            paras: [
                "mt[1-9]?", "mte[1-9]?", "ms[1-9]?", "mr", "s[1-9]?", "sr", "r", "d", "sp", "sd[1-9]?",
                "p", "m", "po", "pr", "cls", "pmo", "pm", "pmc", "pmr", "pi[1-9]?", "mi", "nb", "pc", "ph[1-9]?", "b",
                "q[1-9]?", "qr[1-9]?", "qc[1-9]?", "qa", "qm[1-9]?", "qd",
                "lh", "li[1-9]?", "lf", "lim[1-9]?"
            ]
        };
        this.headers = {};
        this.bodyTokens = [];
        this.newTokenContext = {
            lastParaId: null,
            lastTokenId: null,
            para: null,
            chapter: null,
            verses: null,
            chars: null
        };
        this.tokenContext = JSON.parse(JSON.stringify(this.newTokenContext));
        this.matchTokens();
        this.parseTokens();
    }

    matchToken(matched) {
        let tObject = null;
        for (const tokenRecord of this.tokenDetails) {
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

    matchTokens() {
        xre.forEach(this.usfm, this.mainRegex, match => this.tokens.push(this.matchToken(match[0])));
    }

    reconstitutedUSFM() {
        return this.tokens.map(t => t.matched).join('')
    }

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

    parseTokens() {
        for (const token of this.tokens) {
            if (token.type === "tag") {
                if (this.isHeaderTag(token.bits[0])) {
                    this.tokenContext.para = token.bits[0];
                    this.headers[token.bits[0]] = "";
                }
            } else if (token.type === "text") {
                if (this.isHeaderTag(this.tokenContext.para)) {
                    this.headers[this.tokenContext.para] += token.matched;
                }
            } else if (token.type === "eol") {
                this.tokenContext.para = null;
            }
        }
    }
}

export default USFM2Tokens;