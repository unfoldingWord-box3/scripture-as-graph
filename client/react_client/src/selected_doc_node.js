import React, {Component} from "react";
import StatsView from "./stats_view";
import VersificationView from "./versification_view";
import FindVersesView from "./find_verses_view";

class SelectedNode extends Component {

    constructor() {
        super();
        this.state = {
            nodeView: "findVerses"
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
            case "findVerses":
                return (
                    <FindVersesView
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