require = require('esm')(module /* , options */);
const gun = require('gun');
const http = require('http');
const U2T = require("../lib/usfm2tokens").default;

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

    async populateCollections() {
        const gunUW = this.gunServer.get("unfoldingWord");
        let count = 0;
        for (const [cName, cPath] of Object.entries(this.toLoad)) {
            this.collections[cName] = new U2T(cPath);
            const gunCollection = gunUW.get("collections").get(cName);
            const date = new Date();
            gunCollection.put({"created": date.toString()});
            const gunCollectionTokens = gunCollection.get("tokenIds");
            for (const tokenId of Object.keys(this.collections[cName].tokens)) {
                await gunCollectionTokens.put({"id": tokenId});
                console.log(count++);
            }
            console.log(cName, "added");
        }
    }
}

const server = new TokenServer();
server.populateCollections().then();
