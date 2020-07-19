import React, {Component} from "react";
import USFM2Tokens from "./usfm2tokens";

import RestClient from './rest_client';

class DocItem extends Component {

    constructor() {
        super();
        this.restClient = new RestClient("http://localhost:4000");
    }

    async docClick(lang, trans, doc) {
        const self = this;
        const url = `doc/${lang}/${trans}/${doc}`;
        self.props.setSelected(["fetching"]);
        await self.restClient.doGet(
            url,
            data => {
                self.props.setSelected(["processing"]);
                const docRecord = self.props.languages[lang][trans][doc];
                docRecord.usfm = data;
                docRecord.graph = new USFM2Tokens(data);
                self.props.setSelected(["document", lang, trans, doc]);
            }
        );
    }

    render() {
        return (
            <span
                className={"graph" in this.props.languages[this.props.language][this.props.translation][this.props.doc] ? "loadedDoc font-weight-bold" : "unloadedDoc"}
                onClick={() => this.docClick(this.props.language, this.props.translation, this.props.doc)}>
                <small>{this.props.doc}</small>
            </span>
        );
    }

}

export default DocItem;
