import React, {Component, Fragment} from "react";
import TranslationViewSelector from "./translation_view_selector";
import TranslationStatsView from "./translation_stats_view";
import TranslationWordInVersesView from "./translation_word_in_verses_view";

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
                        translationRecord={
                            Object.fromEntries(
                                Object.entries(this.props.translationRecord)
                                    .filter(kv => "graph" in kv[1])
                            )
                        }
                    />
                );
            case "wordInVerses":
                return (
                    <TranslationWordInVersesView
                        language={this.props.language}
                        translation={this.props.translation}
                        docId={this.props.docId}
                        translationRecord={
                            Object.fromEntries(
                                Object.entries(this.props.translationRecord)
                                    .filter(kv => "graph" in kv[1])
                            )
                        }
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
