import React, {Component} from "react";

class FindVersesView extends Component {

    constructor() {
        super();
        this.state = {
            fromChapter :"",
            fromVerse: "",
            toChapter: "",
            toVerse: ""
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
                <div className="col p-3 nodeView">
                    <div className="row">
                        <div className="col h4 text-primary">Find Verses</div>
                    </div>
                    <div className="form-row">
                        <div className="col">
                            <input name="fromChapter" type="text" className="form-control" placeholder="Start Chapter" onChange={ (e) => this.updateFormValues(e) }/>
                        </div>
                        <div className="col">
                            <input name="fromVerse" type="text" className="form-control" placeholder="Start Verse" onChange={ (e) => this.updateFormValues(e) }/>
                        </div>
                        <div className="col">
                            <input name="toChapter" type="text" className="form-control" placeholder="End Chapter" onChange={ (e) => this.updateFormValues(e) }/>
                        </div>
                        <div className="col">
                            <input name="toVerse" type="text" className="form-control" placeholder="End Verse" onChange={ (e) => this.updateFormValues(e) }/>
                        </div>
                    </div>
                    {
                        Object.values(this.state).filter(x => x !== "").length === 4 ?
                        <div className="row">
                            <div className="col">
                                {
                                    graph.textForCV(
                                        this.state.fromChapter,
                                        this.state.fromVerse,
                                        this.state.toChapter,
                                        this.state.toVerse
                                    )
                                }
                            </div>
                        </div>
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

export default FindVersesView;
