import React, {Component, Fragment} from 'react';
import Axios from "axios";
import 'bootstrap/dist/css/bootstrap.css';

import USFM2Tokens from './usfm2tokens';
import './App.css';


class RestClient {

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.toFetch = new Set();
        this.state = {
            selected: null
        }
    }

    async doGet(url, callback) {
        await this.sendRequest("get", `${this.baseUrl}/${url}`, callback);
    }

    async sendRequest(method, url, callback) {
        callback((await Axios.request({
            method: method,
            url: url
        })).data);
    }
}

class App extends Component {

    constructor() {
        super();
        this.state = {
            languages: {},
            lastUpdated: "Never"
        };
        this.restClient = new RestClient("http://localhost:4000");
    }

    async updateLanguages() {
        await this.restClient.doGet("", data => this.setState({languages: data}));
    }

    async docClick(lang, trans, doc) {
        const self = this;
        const url = `doc/${lang}/${trans}/${doc}`;
        self.setState({"selected": ["fetching"]});
        await self.restClient.doGet(
            url,
            data => {
                self.setState({"selected": ["processing"]});
                const docRecord = self.state.languages[lang][trans][doc];
                docRecord.usfm = data;
                docRecord.graph = new USFM2Tokens(data);
                self.setState({"selected": ["document", lang, trans, doc]});
            }
        );
    }

    translationClick(lang, trans) {
        this.setState({"selected": ["translation", lang, trans]});
    }

    languageClick(lang) {
        this.setState({"selected": ["language", lang]});
    }

    rootClick() {
        this.setState({"selected": null});
    }

    resetResources() {
        this.setState({"selected": null, languages: {}});
    }

    selectedTitle(selection) {
        switch (selection[0]) {
            case "fetching":
                return "Fetching data from server"
            case "processing":
                return "Building graph"
            case "language":
                return `Language ${selection[1]}`
            case "translation":
                return `Translation ${selection[2]} (${selection[1]})`
            case "document":
                return `Document ${selection[3]} (${selection[1]}, ${selection[2]})`
            default:
                return "?"
        }
    }

    render() {
        return (
            <div className="App container">
                <h1 className="h1 text-primary text-center" onClick={() => this.updateLanguages()}>
                    Scripture-as-Graph Proof of
                    Concept
                </h1>
                <div className="row">
                    <div className="col-6">
                        {
                            Object.keys(this.state.languages).length === 0 ?
                                <div className="h2 text-secondary text-center">
                                    Nothing Loaded
                                </div>
                                :
                                <Fragment>
                                    <div className="h2 text-secondary text-center"
                                         onClick={() => this.resetResources()}>
                                        Resources
                                    </div>
                                    {
                                        Object.entries(this.state.languages).map(
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
                                                                                                const [k3, _] = d;
                                                                                                return (
                                                                                                    <Fragment
                                                                                                        key={k3}>
                                                                                                        <span className={"graph" in this.state.languages[k][k2][k3] ? "loadedDoc font-weight-bold" : "unloadedDoc" }
                                                                                                              onClick={() => this.docClick(k, k2, k3)}>
                                                                                                            <small>{k3}</small>
                                                                                                        </span>
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
                                    }</Fragment>
                        }
                    </div>
                    <div className="col-6">
                        <div className="h2 text-secondary text-center" onClick={() => this.rootClick()}>
                            {this.state.selected ? this.selectedTitle(this.state.selected) : "Nothing Selected"}
                        </div>
                        {
                            !this.state.selected ?
                                ""
                                :
                                <div>Node stuff</div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
