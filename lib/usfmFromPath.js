import * as fse from 'fs-extra';
import USFM2Tokens from '../client/react_client/src/usfm2tokens';

const usfmFromPath = function(usfmPath) {
    let usfmString;
    try {
        usfmString = fse.readFileSync(usfmPath, "utf-8");
    } catch (err) {
        throw new Error(`Could not load USFM: ${err}`);
    }
    return new USFM2Tokens(usfmString);
}

export default usfmFromPath;
