import React, {Component} from "react";
import SelectedDocNode from "./selected_doc_node";

class SelectedNode extends Component {

    render() {
        const [lang, trans, doc] = this.props.selected.slice(1);
        if (this.props.selected.length === 4) {
            return (<SelectedDocNode
                language={lang}
                translation={trans}
                docId={doc}
                docRecord={this.props.languages[lang][trans][doc]}
            />);
        } else {
            return "";
        }
    }
}

export default SelectedNode;