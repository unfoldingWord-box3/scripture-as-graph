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
        if (this.props.selected.length < 4) {
            return ""
        }
        const [lang, trans, doc] = this.props.selected.slice(1);
        switch (this.state.nodeView) {
            case "stats":
                return (
                    <StatsView
                        language={lang}
                        translation={trans}
                        docId={doc}
                        docRecord={this.props.languages[lang][trans][doc]}
                    />
                )
            case "versification":
                return (
                    <VersificationView
                        language={lang}
                        translation={trans}
                        docId={doc}
                        docRecord={this.props.languages[lang][trans][doc]}
                    />
                )
            default:
                return (<div>{this.state.nodeView}???</div>)
        }
    }
}

export default SelectedNode;