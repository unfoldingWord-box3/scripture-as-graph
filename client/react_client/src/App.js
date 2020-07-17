import React, {Component, Fragment} from 'react';
import Axios from "axios";
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';

// import USFM2Tokens from './usfm2tokens.js';

class RestClient {

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.state = {
            selected: null
        }
    }

    doGet(callback) {
        this.sendRequest("get", this.baseUrl, callback);
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

    updateLanguages() {
        this.restClient.doGet(data => this.setState({languages: data}));
    }

    docClick(lang, trans, doc) {
        this.setState({"selected": ["document", lang, trans, doc]});
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
                                                                                         onClick={() => this.translationClick(k, k2)}>Translation <b>{k2}</b>
                                                                                    </div>
                                                                                    {
                                                                                        v2.map(
                                                                                            d => {
                                                                                                return (
                                                                                                    <Fragment
                                                                                                        key={d.docId}>
                                                                            <span className="translationDoc"
                                                                                  onClick={() => this.docClick(k, k2, d.docId)}>
                                                                                <small>{d.docId}</small>
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
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
