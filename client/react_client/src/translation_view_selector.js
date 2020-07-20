import React, {Component} from "react";

class TranslationViewSelector extends Component {
    render() {
        return (
            <div className="row">
                <div className="col p-2">
                    <div className="dropdown">
                        <button className="btn btn-sm btn-link dropdown-toggle" type="button" id="dropdownMenuButton"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Translation View
                        </button>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <button className="dropdown-item"
                               onClick={() => this.props.setNodeView("stats")}>Stats</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default TranslationViewSelector;
