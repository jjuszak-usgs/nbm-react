import React from "react";
import "./LeftPanel.css";
import { Button, Collapse, CardBody, Card, ButtonGroup, Tooltip } from "reactstrap";
import { Glyphicon } from "react-bootstrap";

import Legend from "../Legend/Legend";
import { RadioGroup } from "../CustomRadio/CustomRadio";
import PDFReport from "../PDF/PdfReport";
import { BarLoader } from "react-spinners"
import * as turf from '@turf/turf'
import Biogeography from "../Bioscapes/Biogeography";
import TerrestrialEcosystems2011 from "../Bioscapes/TerrestrialEcosystems2011";

const numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

class LeftPanel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            results: props.results,
            textSearchHandler: props.textSearchHandler,
            basemapChanged: props.basemapChanged,
            submitHandler: props.submitHandler,
            layersDropdownOpen: false,
            bioscape: props.bioscape,
            updateAnalysisLayers: props.updateAnalysisLayers,
            loading: false,
            enabledLayers: [],
            basemapTooltipOpen: false

        }

        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.toggleSfrDropdown = this.toggleSfrDropdown.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
        this.submit = this.submit.bind(this)
        this.toggleBasemapDropdown = this.toggleBasemapDropdown.bind(this)
        this.basemapChanged = this.basemapChanged.bind(this);
        this.share = this.share.bind(this);
        this.report = this.report.bind(this);
        this.updateAnalysisLayers = this.updateAnalysisLayers.bind(this)
        this.loaderRef = React.createRef();
    }

    componentWillReceiveProps(props) {
        if (props.feature && props.feature.properties) {

            let approxArea = 'Unknown'
            try {
                if (props.feature.properties.source_data && props.feature.properties.source_data.value && JSON.parse(props.feature.properties.source_data.value)[0].areasqkm) {
                    let areaSqMeters = JSON.parse(props.feature.properties.source_data.value)[0].areasqkm
                    approxArea = numberWithCommas(parseInt(turf.convertArea(areaSqMeters, 'kilometres', 'acres')))
                }
                else {
                    let area = 0
                    if (props.feature.geometry.type === 'MultiPolygon') {
                        for (let poly of props.feature.geometry.coordinates) {
                            area += turf.area(turf.polygon(poly))
                        }
                    }
                    else {
                        area = turf.area(turf.polygon(props.feature.geometry.coordinates))
                    }
                    approxArea = numberWithCommas(parseInt(turf.convertArea(area)))
                }
            }
            catch (e) {

            }

            this.setState({
                feature: props.feature,
                feature_id: props.feature.properties.feature_id,
                feature_name: props.feature.properties.feature_name,
                feature_class: props.feature.properties.feature_class,
                feature_area: approxArea

            })
        }

        if (props.mapClicked) {
            this.textInput.focus();
            this.setState({
                focused: true
            })
        }
    }

    basemapChanged(e) {
        this.state.basemapChanged(e)
    }

    toggleBasemapDropdown() {
        this.setState({ layersDropdownOpen: !this.state.layersDropdownOpen });
    }

    handleKeyUp(e) {
        this.state.textSearchHandler(e.target.value)
    }

    toggleSfrDropdown() {
    }

    onFocus() {
        this.setState({
            focused: true
        })
    }

    onBlur() {
        setTimeout(() => {
            this.setState({
                focused: false
            });
            this.textInput.value = ""
        }, 150)
    }

    submit(e) {
        this.state.submitHandler(e)
    }

    share() {
        this.props.shareState()
    }

    report() {
        this.setState({
            loading: true
        })

        let charts = []
        charts.push(this.FirstLeafAnalysis.print())
        charts.push(this.FirstBloomAnalysis.print())
        charts.push(this.FirstLeafBloomComparisonAnalysis.print())
        charts.push(this.NFHPAnalysis.print())
        charts.push(this.EcosystemProtectionAnalysis.print())
        charts.push(this.SpeciesProtectionAnalysis.print())
        charts.push(this.PhenologyAnalysis.print())
        charts.push(this.OBISAnalysis.print())
        this.PDFReport.generateReport(this.state.feature_name, this.state.feature_class, this.props.map, charts)
            .then(() => {
                setTimeout(() => {
                    this.setState({
                        loading: false
                    })
                }, 3000);
            })
    }

    updateAnalysisLayers(enabledLayers, bapId) {
        this.setState({
            enabledLayers: enabledLayers
        })

        this.state.updateAnalysisLayers(enabledLayers, bapId)
    }

    toggleSettingsTooltip = () => this.setState({
        basemapTooltipOpen: !this.state.basemapTooltipOpen
    });

    render() {
        let that = this;

        const featureText = () => {
            if (this.state.feature_name) {
                return (
                    <div className="panel-header">
                        <div className="panel-title">
                            <span >{this.state.feature_name}</span>
                        </div>
                        <div className="panel-subtitle">
                            <div className="category-text">Category: <span className="feature-text">  {this.state.feature_class}</span></div>
                            <div className="category-text">Approximate Area: <span className="feature-text">  {this.state.feature_area} acres</span></div>
                        </div>
                        <div className="panel-buttons">
                            <button className="submit-analysis-btn" onClick={this.share}>Share</button>
                            <input className="share-url-input" type="text"></input>
                            <button className="submit-analysis-btn" onClick={this.report}>
                                <PDFReport onRef={ref => (this.PDFReport = ref)}></PDFReport>
                            </button>
                        </div>
                        <BarLoader ref={this.loaderRef} width={100} widthUnit={"%"} color={"white"} loading={this.state.loading} />
                    </div>
                )
            }
        }
        return (
            <div className="left-panel">
                <div id='left-panel-header' className="left-panel-header">
                    <div className="nbm-flex-row">
                        <div className="nbm-flex-column">
                            <Button id={"SettingsTooltip"} onClick={this.toggleBasemapDropdown} className='placeholder-button' >
                                <Glyphicon className="inner-glyph" glyph="menu-hamburger" />
                            </Button>
                            <Tooltip
                                style={{ fontSize: "14px" }} isOpen={this.state.basemapTooltipOpen && !this.state.layersDropdownOpen}
                                target="SettingsTooltip" toggle={this.toggleSettingsTooltip} delay={0}>
                                Settings
                            </Tooltip>
                        </div>
                        <div className="nbm-flex-column">
                            <Legend
                                enabledLayers={this.state.enabledLayers}
                            />
                        </div>
                        <div className="nbm-flex-column-big">
                            {
                                !this.state.bioscape.overlays &&
                                <input ref={(input) => { this.textInput = input; }} onClick={this.onFocus} onBlur={this.onBlur} onKeyUp={this.handleKeyUp}
                                       className="input-box" type={"text"} />
                            }
                        </div>
                    </div>
                    <div className="nbm-flex-row" >
                        <div className="button-group">
                            {(this.props.results.length > 0 && this.state.focused) ? <ButtonGroup vertical>
                                {this.props.results.map(function (d, idx) {
                                    return (
                                        <Button className="sfr-button" style={{ whiteSpace: 'normal' }}
                                                onClick={function () { that.submit(this) }}
                                                id={d.feature_id}
                                                key={d.feature_id}>
                                            {d.feature_name} ({d.feature_class})
                                        </Button>)
                                })}
                            </ButtonGroup> : null}
                        </div>
                    </div>
                    <div className="nbm-flex-row-no-padding">
                        <Collapse className="settings-dropdown" isOpen={this.state.layersDropdownOpen}>
                            <Card>
                                <span className="header">Basemaps</span>
                                <CardBody>
                                    <RadioGroup style={{ width: "100%" }}
                                                options={this.state.bioscape.basemaps}
                                                onChange={this.basemapChanged}
                                                canDeselect={true}
                                    />
                                </CardBody>
                            </Card>
                            {this.state.bioscape.overlays &&
                            <Card>
                                <span className="header">Overlays</span>
                                <CardBody>
                                    <RadioGroup style={{ width: "100%" }}
                                                options={this.state.bioscape.overlays}
                                                onChange={this.props.overlayChanged}
                                                canDeselect={true}
                                    />
                                </CardBody>
                            </Card>
                            }
                        </Collapse>
                    </div>
                    {featureText()}
                </div>
                <div id='analysis-package-container' className="analysis-package-container" >
                    {
                        this.props.bioscapeName === "terrestrial-ecosystems-2011" ?
                            <TerrestrialEcosystems2011
                                {...this.props}
                                {...this.state}
                                updateAnalysisLayers={this.updateAnalysisLayers}
                            />
                            :
                            <Biogeography
                                {...this.props}
                                {...this.state}
                                updateAnalysisLayers={this.updateAnalysisLayers}
                            />
                    }
                </div>

            </div>
        );
    }
}
export default LeftPanel;
