import React, {Component, Fragment} from "react";
import TranslationViewSelector from "./translation_view_selector";
import TranslationStatsView from "./translation_stats_view";

class SelectedTranslationNode extends Component {

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
                    <TranslationStatsView
                        language={this.props.language}
                        translation={this.props.translation}
                        docId={this.props.docId}
                        docRecord={this.props.docRecord}
                    />
                );
            default:
                return (<div>{this.state.nodeView}???</div>)
        }
    }

    render() {
        return (
            <Fragment>
                <TranslationViewSelector
                    nodeView={this.state.nodeView}
                    setNodeView={this.setNodeView}
                />
                {this.viewSwitch()}
            </Fragment>
        )
    }

}

export default SelectedTranslationNode;
