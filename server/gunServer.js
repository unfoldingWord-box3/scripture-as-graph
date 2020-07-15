require = require('esm')(module /* , options */);
const fse = require('fs-extra');
const gun = require('gun');
const http = require('http');

class TokenServer {
    constructor () {
        const httpServer = http.createServer().listen(2468);
        this.gunServer = gun({web: httpServer});
        this.collections = {};
        this.toLoad = {
            "oeb_jol": "../test/test_data/oeb_jol.usfm",
            "en_ult_lam": "../test/test_data/en_ult_lam.usfm",
            "en_ult_psa": "../test/test_data/en_ult_psa.usfm",
        };
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

    async populateCollections() {
        const gunUW = this.gunServer.get("unfoldingWord");
        let count = 0;
        for (const [cName, cPath] of Object.entries(this.toLoad)) {
            this.collections[cName] = this.readUSFM(cPath);
            const gunCollection = gunUW.get("collections").get(cName);
            const date = new Date();
            gunCollection.put({
                "created": date.toString(),
                "usfm": this.collections[cName]
            });
            console.log(cName, "added");
        }
    }
}

const server = new TokenServer();
server.populateCollections().then();
