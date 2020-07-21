import React, {Component} from "react";

class FrequenciesView extends Component {

    render() {
        const now = new Date().getTime();
        const graph = this.props.docRecord.graph;
        let keyVal = 0;
        return (
            <div className="row">
                <div className="col p-3 bg-light border border-primary">
                    <div className="row" key={keyVal++}>
                        <div className="col h4 text-primary">Word Frequencies</div>
                    </div>
                    {
                        graph.wordFrequencies(1).map(
                            wf => <div className="row" key={keyVal++}>
                                <div className="col-3 font-weight-bold">
                                    {wf.split(":")[0]}
                                </div>
                                <div className="col-9">
                                    {wf.split(":")[1]}
                                </div>
                            </div>
                        )
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

export default FrequenciesView;
