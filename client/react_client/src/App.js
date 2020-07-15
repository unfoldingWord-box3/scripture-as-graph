import React, {Component} from 'react';
import Gun from 'gun';
import './App.css';
import USFM2Tokens from './usfm2tokens.js';

class App extends Component {

    constructor() {
        super();
        this.state = {
            collections: {}
        };
        this.gun = Gun('http://localhost:2468/gun');
        this.localData = {};
        const gunCollections = this.gun.get('unfoldingWord').get('collections');
        const self = this;
        gunCollections.map().on(
            function (node, nodeID) {
                const u2t = new USFM2Tokens(node.usfm);
                self.localData[nodeID] = {
                    usfm: node.usfm,
                    graph: u2t
                };
                self.localData[nodeID].title = u2t.textFromPara(
                    u2t.paras[
                        Array.from(u2t.standoff.header.id)[0]
                    ]
                )
            }
        )
    }

    render() {
        return (
            <div className="App">
                <h1>React Scripture-as-Graph Proof of Concept</h1>
                <div>
                    <h2>Documents</h2>
                    {Object.keys(this.localData).map(
                        (k) => {
                            return (
                                <div key={k}>
                                    <h3>{`${this.localData[k].title} (${k})`}</h3>
                                    <div>{`USFM is ${this.localData[k].usfm.length} bytes`}</div>
                                    <div>{`${Object.keys(this.localData[k].graph.chapterVerses).length} chapters`}</div>
                                    <div>{`${Object.keys(this.localData[k].graph.words).length} unique words`}</div>
                                </div>
                            )
                        }
                    )}
                </div>
            </div>
        );
    }
}

export default App;
