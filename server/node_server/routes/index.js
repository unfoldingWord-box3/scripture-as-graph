const express = require('express');
const router = express.Router();

require = require('esm')(module /* , options */);
const fse = require('fs-extra');
const config = require("../../../client/react_client/src/config").default;

const indexTranslations = function (lDir) {
    const ret = {};
    fse.readdirSync(lDir).forEach(
        function (tDir) {
            if (tDir.substring(0, 1) === ".") {
                return;
            }
            ret[tDir] = {};
            fse.readdirSync(`${lDir}/${tDir}`).forEach(
                function (dDir) {
                    ret[tDir][dDir] = {};
                    fse.readdirSync(`${lDir}/${tDir}/${dDir}`).forEach(
                        function (doc) {
                            const docId = doc.split(".")[0].toUpperCase();
                            ret[tDir][dDir][docId] = {
                                docId: docId
                            };
                        }
                    )
                }
            )
        }
    )
    return ret;
}

router.get('/', function (req, res, next) {
    res.json(indexTranslations(config.usfmRoot));
});

module.exports = router;
