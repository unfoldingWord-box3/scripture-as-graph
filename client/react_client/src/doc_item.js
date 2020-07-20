import React, {Component} from "react";
import USFM2Tokens from "./usfm2tokens";

import RestClient from './rest_client';

class DocItem extends Component {

    constructor() {
        super();
        this.restClient = new RestClient("http://localhost:4000");
    }

    async docClick(lang, trans, doc) {
        const url = `doc/${lang}/${trans}/${doc}`;
        if ("graph" in this.props.docRecord) {
            this.props.setSelected(["document", lang, trans, doc]);
        } else {
            const self = this;
            self.props.setSelected(["fetching"]);
            await self.restClient.doGet(
                url,
                data => {
                    this.props.docRecord.usfm = data;
                    this.props.docRecord.graph = new USFM2Tokens(data);
                    self.props.setSelected(["document", lang, trans, doc]);
                }
            );
        }
    }

    render() {
        return (
            <span
                className={"graph" in this.props.docRecord ? "loadedDoc font-weight-bold" : "unloadedDoc"}
                onClick={() => this.docClick(this.props.language, this.props.translation, this.props.docId)}>
                <small>{this.props.docId}</small>
            </span>
        );
    }

}

export default DocItem;
