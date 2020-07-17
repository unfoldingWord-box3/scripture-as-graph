require = require('esm')(module /* , options */);
const fse = require('fs-extra');
const gun = require('gun');
const http = require('http');

class TokenServer {
    constructor (translationDir) {
        const httpServer = http.createServer().listen(2468);
        this.gunServer = gun({web: httpServer});
        this.translationDir = translationDir;
        this.translations = this.indexTranslations(translationDir);
    }

    documentPath(lDir, tDir, doc) {
        return [this.translationDir, lDir, tDir, doc].join("/");
    }

    indexTranslations(lDir) {
        const ret = {};
        fse.readdirSync(lDir).forEach(
            function(tDir) {
                ret[tDir] = {};
                fse.readdirSync(`${lDir}/${tDir}`).forEach(
                    function(dDir) {
                        ret[tDir][dDir] = [];
                        fse.readdirSync(`${lDir}/${tDir}/${dDir}`).forEach(
                            function(doc) {
                                ret[tDir][dDir].push(doc);
                            }
                        )
                    }
                )
            }
        )
        return ret;
    }

    readUSFM(uPath) {
        let usfmString;
        try {
            usfmString = fse.readFileSync(uPath, "utf-8");
        } catch (err) {
            throw new Error(`Could not load USFM: ${err}`);
        }
        return usfmString;
    }

    async populate() {
        const gunLanguages = this.gunServer.get("unfoldingWord").get("languages");
        let count = 0;
        for (const [lName, lTranslations] of Object.entries(this.translations)) {
            const gunTranslations = gunLanguages.get(lName);
            console.log(" ", "Added Language", lName);
            for (const [tName, tDocuments] of Object.entries(lTranslations)) {
                const gunDocuments = gunTranslations.get('translations').get(tName).get("documents");
                console.log(" ", "Added Translation", tName);
                for (const tDocument of tDocuments) {
                    const date = new Date();
                    const usfm = this.readUSFM(this.documentPath(lName, tName, tDocument));
                    await gunDocuments.get(tDocument).put({
                        "src": this.documentPath(lName, tName, tDocument),
                        "added": date,
                        "usfm": "usfm"
                    });
                    console.log("   ", "Added Document", tDocument);
                }
            }
        }
    }
}

const server = new TokenServer(process.argv[2]);
server.populate().then();
