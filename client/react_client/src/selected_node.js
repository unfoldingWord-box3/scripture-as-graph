import React, {Component} from "react";

class SelectedNode extends Component {

    render() {
        return (
            <div>Selected Node = { this.props.selected.join(",") }</div>
        );
    }
}

export default SelectedNode;