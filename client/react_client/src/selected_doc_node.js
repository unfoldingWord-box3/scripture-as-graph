import React, {Component} from "react";
import StatsView from "./stats_view";
import VersificationView from "./versification_view";

class SelectedNode extends Component {

    constructor() {
        super();
        this.state = {
            nodeView: "versification"
        }
    }

    render() {
        switch (this.state.nodeView) {
            case "stats":
                return (
                    <StatsView
                        language={this.props.language}
                        translation={this.props.translation}
                        docId={this.props.docId}
                        docRecord={this.props.docRecord}
                    />
                )
            case "versification":
                return (
                    <VersificationView
                        language={this.props.language}
                        translation={this.props.translation}
                        docId={this.props.docId}
                        docRecord={this.props.docRecord}
                    />
                )
            default:
                return (<div>{this.state.nodeView}???</div>)
        }
    }
}

export default SelectedNode;