import React, {Component} from "react";

class TranslationWordInVersesView extends Component {

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
        const graphs = Object.entries(this.props.translationRecord).map(kv => [kv[0], kv[1].graph]);
        let keyVal = 0;
        return (
            <div className="row">
                <div className="col p-3 bg-light border border-primary">
                    <div className="row" key={keyVal++}>
                        <div className="col h4 text-primary">Find Word in Verses</div>
                    </div>
                    <div className="form-row" key={keyVal++}>
                        <div className="col">
                            <input name="word" type="text" className="form-control" placeholder="word"
                                   onChange={(e) => this.updateFormValues(e)}/>
                        </div>
                    </div>
                    {
                        (this.state.word !== "") && (this.state.word) ?
                            graphs.map(
                                dg => dg[1].wordInVerses(this.state.word).map(
                                    wiv => <div className="row" key={keyVal++}>
                                        <div className="col">
                                            {dg[0]}: {wiv}
                                        </div>
                                    </div>
                                )
                            )
                            :
                            ""
                    }
                    <div className="row" key={keyVal++}>
                        <div className="col text-secondary text-right"><small>Rendered
                            in {new Date().getTime() - now} msec</small></div>
                    </div>
                </div>
            </div>
        );
    }

}

export default TranslationWordInVersesView;
