import React, {Component} from "react";

class VersificationView extends Component {

    render() {
        const now = new Date().getTime();
        const graph = this.props.docRecord.graph;
        return (
            <div className="row">
                <div className="col p-3 nodeView">
                    <div className="row">
                        <div className="col h4 text-primary">Versification</div>
                    </div>
                    {
                        Object.entries(graph.chapterVerses).map(
                            cv => <div className="row">
                                <div className="col-2">
                                    Ch {cv[0]}
                                </div>
                                <div className="col-10">
                                    Max verse {
                                        Object.keys(cv[1]).map(
                                            x => parseInt(x)).reduce((acc, c) =>  Math.max(acc, c)
                                        )
                                }
                                </div>
                            </div>
                        )
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

export default VersificationView;
