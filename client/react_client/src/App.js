import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import LanguageList from './language_list';
import RestClient from './rest_client';
import SelectedNode from './selected_node';
import './App.css';

class App extends Component {

    constructor() {
        super();
        this.state = {
            languages: {},
            selected: null,
            lastUpdated: "Never"
        };
        this.restClient = new RestClient("http://localhost:4000");
    }

    async updateLanguages() {
        await this.restClient.doGet("", data => this.setState({languages: data}));
    }

    setSelected(newSelection) {
        this.setState({ "selected": newSelection });
    }

    resetResources() {
        this.setState({"selected": null, languages: {}});
    }

    rootClick() {
        this.setSelected(null);
    }

    selectedTitle(selection) {
        if (!selection) {
            return "Null Selection";
        }
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
                        <LanguageList
                            languages = { this.state.languages }
                            selected = { this.state.selected }
                            selectedTitle = { this.selectedTitle }
                            setSelected = { sv => this.setSelected(sv) }
                            resetResources = { () => this.resetResources() }
                        />
                    </div>
                    <div className="col-6">
                        <div className="h2 text-secondary text-center" onClick={() => this.rootClick()}>
                            {this.state.selected ? this.selectedTitle(this.state.selected) : "Nothing Selected"}
                        </div>
                        {
                            !this.state.selected ?
                                ""
                                :
                                <SelectedNode
                                    languages = { this.state.languages }
                                    selected = { this.state.selected }
                                />
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
