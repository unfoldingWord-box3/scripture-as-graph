import React, {Component} from "react";
import SelectedDocNode from "./selected_doc_node";
import SelectedTranslationNode from "./selected_translation_node";

class SelectedNode extends Component {

    render() {
        const [lang, trans, doc] = this.props.selected.slice(1);
        switch (this.props.selected.length) {
            case 4:
                return (<SelectedDocNode
                    language={lang}
                    translation={trans}
                    docId={doc}
                    docRecord={this.props.languages[lang][trans][doc]}
                />);
            case 3:
                return (<SelectedTranslationNode
                    language={lang}
                    translation={trans}
                    translationRecord={this.props.languages[lang][trans]}
                />);
            default:
                return "";
        }
    }
}

export default SelectedNode;