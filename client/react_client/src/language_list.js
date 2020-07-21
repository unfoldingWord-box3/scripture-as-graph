import React, {Component, Fragment} from 'react';
import DocItem from './doc_item';
import USFM2Tokens from "./usfm2tokens";
import RestClient from "./rest_client";

class LanguageList extends Component {

    constructor() {
        super();
        this.restClient = new RestClient("http://localhost:4000");
    }

    languageClick(lang) {
        this.props.setSelected(["language", lang]);
    }

    async loadDocuments(toLoad) {
        if (toLoad && toLoad[0]) {
            const [lang, trans, doc] = toLoad[0];
            const url = `doc/${lang}/${trans}/${doc}`;
            await this.restClient.doGet(
                url,
                async data => {
                    const docRecord = this.props.languages[lang][trans][doc];
                    docRecord.usfm = data;
                    docRecord.graph = new USFM2Tokens(data);
                    this.props.refreshLastUpdated();
                    if (toLoad.length > 1) {
                        await this.loadDocuments(toLoad.slice(1));
                    }
                }
            );
        }
    }

    async translationClick(lang, trans) {
        const unloadedDocs = Object.entries(
            this.props.languages[lang][trans])
            .filter(kv => !("graph" in kv[1]))
            .map(kv => [lang, trans, kv[0]]
        );
        if (unloadedDocs) {
            this.props.setSelected(["fetching"]);
            await this.loadDocuments(unloadedDocs);
        }
        this.props.setSelected(["translation", lang, trans]);
    }

    render() {
        return (
            <Fragment>
                <div className="h2 text-secondary text-center" onClick={() => this.props.resetResources()}>
                    {Object.keys(this.props.languages).length > 0 ? "Resources" : "Nothing Loaded"}
                </div>
                {
                    Object.entries(this.props.languages).map(
                        (l) => {
                            const [k, v] = l;
                            return (
                                <div className="row" key={k}>
                                    <div className="col m-3">
                                        <div className="h4 text-secondary"
                                             onClick={() => this.languageClick(k)}>Language <b>{k}</b>
                                        </div>
                                        {
                                            Object.entries(v).map(
                                                t => {
                                                    const [k2, v2] = t;
                                                    return (
                                                        <div className="row" key={k2}>
                                                            <div className="col m-3">
                                                                <div className="h5 text-secondary"
                                                                     onClick={() => this.translationClick(k, k2)}>Translation <strong>{k2}</strong>
                                                                </div>
                                                                {
                                                                    Object.entries(v2).map(
                                                                        d => {
                                                                            const [k3, v3] = d;
                                                                            return (
                                                                                <Fragment key={k3}>
                                                                                    <DocItem
                                                                                        languages = { this.props.languages }
                                                                                        language = { k }
                                                                                        translation = { k2 }
                                                                                        docId = { k3 }
                                                                                        docRecord = { v3 }
                                                                                        setSelected = { this.props.setSelected }
                                                                                    />
                                                                                    <span> </span>
                                                                                </Fragment>
                                                                            )
                                                                        }
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }
                    )
                }
            </Fragment>
        )
    }
}

export default LanguageList;