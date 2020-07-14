require = require('esm')(module /* , options */);
const gun = require('gun');
const http = require('http');
const U2T = require("../lib/usfm2tokens").default;

const httpServer = http.createServer().listen(2468);
const gunServer = gun({web: httpServer});
const collections = {};
const toLoad = {
    "oeb_jol": "../test/test_data/oeb_jol.usfm",
    "en_ult_psa": "../test/test_data/en_ult_psa.usfm",
    "en_ult_lam": "../test/test_data/en_ult_lam.usfm"
};

const gunUW = gunServer.get("unfoldingWord");
for (const [cName, cPath] of Object.entries(toLoad)) {
    collections[cName] = new U2T(cPath);
    const gunCollection = gunUW.get("collections").get(cName);
    const date = new Date();
    gunCollection.put({"created": date.toString()});
    const gunCollectionTokens = gunCollection.get("tokenIds");
    for (const tokenId of Object.keys(collections[cName].tokens)) {
        gunCollectionTokens.set({"id": tokenId});
    }
    console.log(cName, "added");
}