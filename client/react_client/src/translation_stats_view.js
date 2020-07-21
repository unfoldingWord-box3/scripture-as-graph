import React, {Component} from "react";

class TranslationStatsView extends Component {

    render() {
        const now = new Date().getTime();
        const translationWords = new Set();
        for (const d of Object.values(this.props.translationRecord)) {
            for (const w of Object.keys(d.graph.words)) {
                translationWords.add(w);
            }
        }
        let keyVal = 0;
        return (
            <div className="row">
                <div className="col p-3 bg-light border border-primary">
                    <div className="row" key={keyVal++}>
                        <div className="col h4 text-primary">Stats</div>
                    </div>
                    <div className="row" key={keyVal++}>
                        <div className="col-3">Documents</div>
                        <div className="col-9">{Object.keys(this.props.translationRecord).length}</div>
                    </div>
                    <div className="row" key={keyVal++}>
                        <div className="col-3">USFM Size</div>
                        <div className="col-9">
                            {
                                Object.values(this.props.translationRecord)
                                    .map(d => d.usfm.length)
                                    .reduce((acc, c) => acc + c)
                            } bytes
                        </div>
                    </div>
                    <div className="row" key={keyVal++}>
                        <div className="col-3">Tokens</div>
                        <div className="col-9">
                            {
                                Object.values(this.props.translationRecord)
                                    .map(d => Object.keys(d.graph.tokens).length)
                                    .reduce((acc, c) => acc + c)
                            }
                        </div>
                    </div>
                    <div className="row" key={keyVal++}>
                        <div className="col-3">Unique 'Words'</div>
                        <div className="col-9">
                            {translationWords.size}
                        </div>
                    </div>
                    <div className="row" key={keyVal++}>
                        <div className="col-3">Chapters</div>
                        <div className="col-9">
                            {
                                Object.values(this.props.translationRecord)
                                    .map(d => Object.keys(d.graph.chapterVerses).length)
                                    .reduce((acc, c) => acc + c)
                            }
                        </div>
                    </div>
                    <div className="row" key={keyVal++}>
                        <div className="col-3">Verses</div>
                        <div className="col-9">
                            {
                                Object.values(this.props.translationRecord)
                                    .map(d => Object.values(d.graph.chapterVerses)
                                        .map(c => Object.keys(c).length)
                                        .reduce((acc, v) => acc + v)
                                    ).reduce((acc, c) => acc + c)
                            }
                        </div>
                    </div>
                    <div className="row" key={keyVal++}>
                        <div className="col text-secondary text-right"><small>Rendered
                            in {new Date().getTime() - now} msec</small></div>
                    </div>
                </div>
            </div>
        );
    }

}

export default TranslationStatsView;
