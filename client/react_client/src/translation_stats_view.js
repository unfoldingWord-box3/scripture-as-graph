import React, {Component} from "react";

class TranslationStatsView extends Component {

    render() {
        const now = new Date().getTime();
        return (
            <div className="row">
                <div className="col p-3 bg-light border border-primary">
                    <div className="row">
                        <div className="col h4 text-primary">Stats</div>
                    </div>
                    <div className="row">
                        <div className="col-3">USFM Size</div>
                        <div className="col-9">
                            {
                                Object.values(this.props.translationRecord)
                                    .filter(d => "usfm" in d)
                                    .map(d => d.usfm.length)
                                    .reduce((acc, c) => acc + c)
                            } bytes
                        </div>
                    </div>
                    <div className="row">
                        <div className="col text-secondary text-right"><small>Rendered
                            in {new Date().getTime() - now} msec</small></div>
                    </div>
                </div>
            </div>
        );
    }

}

export default TranslationStatsView;
