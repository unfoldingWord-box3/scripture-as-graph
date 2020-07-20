import React, {Component} from "react";

class WordInVersesView extends Component {

    constructor() {
        super();
        this.state = {
            word: ""
        }
    }

    updateFormValues(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        const now = new Date().getTime();
        const graph = this.props.docRecord.graph;
        return (
            <div className="row">
                <div className="col p-3 bg-light border border-primary">
                    <div className="row">
                        <div className="col h4 text-primary">Find Word in Verses</div>
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <input name="word" type="text" className="form-control" placeholder="word"
                                   onChange={(e) => this.updateFormValues(e)}/>
                        </div>
                    </div>
                    {
                        (this.state.word !== "") && (this.state.word in graph.words) ?
                            graph.wordInVerses(this.state.word).map(
                                wiv => <div className="row">
                                    <div className="col">
                                        {wiv}
                                    </div>
                                </div>
                            )
                            :
                            ""
                    }
                    <div className="row">
                        <div className="col text-secondary text-right"><small>Rendered
                            in {new Date().getTime() - now} msec</small></div>
                    </div>
                </div>
            </div>
        );
    }

}

export default WordInVersesView;
