import React, {Component} from "react";

class DocViewSelector extends Component {
    render() {
        return (
            <div className="row">
                <div className="col p-2">
                    <div className="dropdown">
                        <button className="btn btn-sm btn-link dropdown-toggle" type="button" id="dropdownMenuButton"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Document View
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <button className="dropdown-item"
                               onClick={() => this.props.setNodeView("stats")}>Stats</button>
                            <button className="dropdown-item"
                               onClick={() => this.props.setNodeView("versification")}>Versification</button>
                            <button className="dropdown-item" onClick={() => this.props.setNodeView("findVerses")}>Find
                                Verses</button>
                            <button className="dropdown-item"
                               onClick={() => this.props.setNodeView("wordInVerses")}>Find Words</button>
                            <button className="dropdown-item"
                               onClick={() => this.props.setNodeView("wordFrequencies")}>Word Frequencies</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default DocViewSelector;
