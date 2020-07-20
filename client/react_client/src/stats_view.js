import React, {Component} from "react";

class StatsView extends Component {

    render() {
        const now = new Date().getTime();
        const graph = this.props.docRecord.graph;
        return (
            <div className="row">
                <div className="col p-3 nodeView">
                    <div className="row">
                        <div className="col h4 text-primary">Stats</div>
                    </div>
                    <div className="row">
                        <div className="col-3">USFM Size</div>
                        <div className="col-9">{this.props.docRecord.usfm.length} bytes</div>
                    </div>
                    <div className="row">
                        <div className="col-3">Tokens</div>
                        <div className="col-9">{Object.keys(graph.tokens).length}</div>
                    </div>
                    <div className="row">
                        <div className="col-3">Unique 'Words'</div>
                        <div className="col-9">{Object.keys(graph.words).length}</div>
                    </div>
                    <div className="row">
                        <div className="col-3">Chapters</div>
                        <div className="col-9">{Object.keys(graph.chapterVerses).length}</div>
                    </div>
                    <div className="row">
                        <div className="col-3">Verses</div>
                        <div className="col-9">{
                            Object.values(graph.chapterVerses).map(
                                c => Object.keys(c).length).reduce((acc, v) => acc + v)
                        }</div>
                    </div>
                    <div className="row">
                        <div className="col-3">Headers</div>
                    </div>
                    {
                        graph.getStandoff('header').map(
                            hs =>
                                <div className="row">
                                    <div className="col-3"></div>
                                    <div className="col-1"><small>{hs.split(":")[0]}</small></div>
                                    <div className="col-8"><small>{hs.split(":")[1]}</small></div>
                                </div>
                        )
                    }
                    <div className="row">
                        <div className="col text-secondary text-right"><small>Rendered in {new Date().getTime() - now} msec</small></div>
                    </div>
                </div>
            </div>
        );
    }

}

export default StatsView;
