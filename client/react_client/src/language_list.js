import React, {Component, Fragment} from 'react';
import DocItem from './doc_item';

class LanguageList extends Component {

    rootClick() {
        this.props.setSelected(null);
    }

    languageClick(lang) {
        this.props.setSelected(["language", lang]);
    }

    translationClick(lang, trans) {
        this.props.setSelected(["translation", lang, trans]);
    }

    render() {
        return (
            <Fragment>
                <div className="h2 text-secondary text-center" onClick={() => this.props.resetResources()}>
                    {Object.keys(this.props.languages).length > 0 ? "Resources" : "Nothing Loaded"}
                </div>
                {
                    Object.entries(this.props.languages).map(
                        (l) => {
                            const [k, v] = l;
                            return (
                                <div className="row" key={k}>
                                    <div className="col m-3">
                                        <div className="h4 text-secondary"
                                             onClick={() => this.languageClick(k)}>Language <b>{k}</b>
                                        </div>
                                        {
                                            Object.entries(v).map(
                                                t => {
                                                    const [k2, v2] = t;
                                                    return (
                                                        <div className="row" key={k2}>
                                                            <div className="col m-3">
                                                                <div className="h5 text-secondary"
                                                                     onClick={() => this.translationClick(k, k2)}>Translation <strong>{k2}</strong>
                                                                </div>
                                                                {
                                                                    Object.entries(v2).map(
                                                                        d => {
                                                                            const [k3, _] = d;
                                                                            return (
                                                                                <Fragment key={k3}>
                                                                                    <DocItem
                                                                                        languages = { this.props.languages }
                                                                                        language = { k }
                                                                                        translation = { k2 }
                                                                                        doc = { k3 }
                                                                                        setSelected = { this.props.setSelected }
                                                                                    />
                                                                                    <span> </span>
                                                                                </Fragment>
                                                                            )
                                                                        }
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        }
                    )
                }
            </Fragment>
        )
    }
}

export default LanguageList;