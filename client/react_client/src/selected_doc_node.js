import React, {Component, Fragment} from "react";
import DocViewSelector from "./doc_view_selector";
import StatsView from "./stats_view";
import VersificationView from "./versification_view";
import FindVersesView from "./find_verses_view";
import WordInVersesView from "./word_in_verses_view";
import FrequenciesView from "./frequencies_view";

class SelectedNode extends Component {

    constructor() {
        super();
        this.state = {
            nodeView: "stats"
        }
    }

    setNodeView = (v) =>
        this.setState({nodeView: v});

    viewSwitch() {
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
            case "wordInVerses":
                return (
                    <WordInVersesView
                        language={this.props.language}
                        translation={this.props.translation}
                        docId={this.props.docId}
                        docRecord={this.props.docRecord}
                    />
                )
            case "wordFrequencies":
                return (
                    <FrequenciesView
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

    render() {
        return (
            <Fragment>
                <DocViewSelector
                    nodeView={this.state.nodeView}
                    setNodeView={this.setNodeView}
                />
                {this.viewSwitch()}
            </Fragment>
        )
    }
}

export default SelectedNode;