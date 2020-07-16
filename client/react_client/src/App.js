import React, {Component} from 'react';
import Gun from 'gun';
import './App.css';

// import USFM2Tokens from './usfm2tokens.js';

class App extends Component {

    constructor() {
        super();
        this.state = {
            lastUpdate: 0
        };
        this.gun = Gun('http://localhost:2468/gun');
    }

    incLastUpdate = () => {
        this.setState({lastUpdate: this.state.lastUpdate + 1});
        console.log("Update", this.state.lastUpdate);
    }

    dataFromGun() {
        const ret = {};
        const gunLanguages = this.gun.get('unfoldingWord').get('languages');
        gunLanguages.map().once(
            function (lNode, lNodeID) {
                ret[lNodeID] = {};
                const gunTranslations = gunLanguages.get(lNodeID).get("translations");
                gunTranslations.map().once(
                    function (tNode, tNodeID) {
                        ret[lNodeID][tNodeID] = {};
                        const gunDocuments = gunTranslations.get(tNodeID).get("documents");
                        gunDocuments.map().once(
                            function (dNode, dNodeID) {
                                ret[lNodeID][tNodeID][dNodeID] = {
                                    src: dNode.src
                                };
                            }
                        )
                    }
                );
            }
        );
        console.log(ret, typeof (ret), ret["eng"], Object.keys(ret));
        return ret;
    }

    render() {
        console.log("render");
        const dataTree = this.dataFromGun();
        console.log("DT", Object.keys(dataTree));
        return (
            <div className="App">
                <h1 onClick={ this.incLastUpdate }>React Scripture-as-Graph Proof of Concept</h1>
                {Object.entries(dataTree).map(
                    (l) => {
                        const [k, v] = l;
                        return (
                            <div key={k}>
                                <h2>{`Language ${k}`}</h2>
                                {
                                    Object.entries(v).map(
                                        t => {
                                            const [k2, v2] = t;
                                            return (
                                                <div key={k2}>
                                                    <h3>{`Translation ${k2}`}</h3>
                                                    {
                                                        Object.entries(v2).map(
                                                            d => {
                                                                const [k3, v3] = d;
                                                                return (
                                                                    <div key={k3}>
                                                                        <h4>Doc {v3.src}</h4>
                                                                    </div>
                                                                )
                                                            }
                                                        )
                                                    }
                                                </div>
                                            )
                                        }
                                    )
                                }
                            </div>
                        )
                    }
                )}
            </div>
        );
    }
}

export default App;
