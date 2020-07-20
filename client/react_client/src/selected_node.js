import React, {Component} from "react";
import StatsView from "./stats_view";

class SelectedNode extends Component {

    constructor() {
        super();
        this.state = {
            nodeView: "stats"
        }
    }

    render() {
        if (this.props.selected.length < 4) {
            return ""
        }
        switch (this.state.nodeView) {
            case "stats":
                const [lang, trans, doc] = this.props.selected.slice(1);
                return (
                    <StatsView
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