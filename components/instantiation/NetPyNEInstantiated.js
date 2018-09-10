import React from 'react';
import Dialog from 'material-ui/Dialog';
import Popover from 'material-ui/Popover';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Menu, {MenuItem} from 'material-ui/Menu';
import {pink400} from 'material-ui/styles/colors';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Canvas from '../../../../js/components/interface/3dCanvas/Canvas';
import IconButton from '../../../../js/components/controls/iconButton/IconButton';
import ControlPanel from '../../../../js/components/interface/controlPanel/controlpanel';
import Utils from '../../Utils';

const styles = {
    modal: {
        position: 'absolute !important',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: '999',
        height: '100%',
        width: '100%',
        top: 0
    },

    menuItemDiv: {
        fontSize: '12px',
        lineHeight: '28px'
    },

    menuItem: {
        lineHeight: '28px',
        minHeight: '28px'
    }
};

export default class NetPyNEInstantiated extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            key:"outdatedCanvas",
            model: props.model,
            controlPanelHidden: true,
            plotButtonOpen: false,
            openDialog: false,
            simDialog: false,
            simulateFromHLS: true,
            simulateFromInstance: false,
            parallelSimulation: false,
            previousTab: 'define',
            networkAlreadySimulated: !props.usePrevData.usePrevSim,
            networkAlreadyInstantiated: !props.usePrevData.usePrevInst
        };
        
        this.widgets = [];
        this.simulate = this.simulate.bind(this);
        this.simDialogOpen = this.simDialogOpen.bind(this);
        this.plotFigure = this.plotFigure.bind(this);
        this.newPlotWidget = this.newPlotWidget.bind(this);
        this.getOpenedWidgets = this.getOpenedWidgets.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
    }

    componentDidMount() {
        console.log(100)
        this.refs.canvas.engine.setLinesThreshold(10000);
        this.refs.canvas.displayAllInstances();
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.usePrevData.usePrevSim!=prevProps.usePrevData.usePrevSim || this.props.usePrevData.usePrevInst!=prevProps.usePrevData.usePrevInst) {
            this.setState({networkAlreadySimulated: !this.props.usePrevData.usePrevSim, networkAlreadyInstantiated: !this.props.usePrevData.usePrevInst})
        }
    }

    instantiate = () => {
        this.setState({openDialog: false})
        if (!this.state.networkAlreadyInstantiated) {
            GEPPETTO.CommandController.log("The NetPyNE model is getting instantiated...");
            GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, GEPPETTO.Resources.INSTANTIATING_MODEL);
            Utils.sendPythonMessage('netpyne_geppetto.instantiateNetPyNEModelInGeppetto', [{}])
                .then(response => {
                    var parsedResponse = JSON.parse(response);
                    if (!this.processSimError(parsedResponse)) {
                        GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, GEPPETTO.Resources.PARSING_MODEL); //keep this sequence has it is
                        this.setState({key: "refreshedCanvas", networkAlreadyInstantiated: true})
                        this.refs.canvas.displayAllInstances();
                        GEPPETTO.Manager.loadModel(parsedResponse);
                        GEPPETTO.CommandController.log("The NetPyNE model instantiation was completed");
                        GEPPETTO.trigger(GEPPETTO.Events.Hide_spinner);
                    }
                });
        }
    }

    simDialogOpen() {        
        this.setState({
            dialogTitle: "Run Simulation",
            openDialog: true,
            simDialog: true,
        });
    }

    simulate = () => {
        this.setState({openDialog: false, simDialog: false})
        if (!this.state.networkAlreadySimulated) {
            GEPPETTO.CommandController.log("The NetPyNE model is getting simulated...");
            GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, GEPPETTO.Resources.RUNNING_SIMULATION);
            Utils.sendPythonMessage('netpyne_geppetto.simulateNetPyNEModelInGeppetto ', [{parallelSimulation: this.state.parallelSimulation, previousTab: this.state.previousTab}])
                .then(response => {
                    var parsedResponse = JSON.parse(response)
                    if (!this.processSimError(parsedResponse)) {
                        GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, GEPPETTO.Resources.PARSING_MODEL);
                        this.setState({key: "refreshedCanvas", networkAlreadySimulated: true})
                        this.refs.canvas.displayAllInstances();
                        GEPPETTO.Manager.loadModel(parsedResponse);
                        GEPPETTO.CommandController.log("The NetPyNE model simulation was completed");
                        GEPPETTO.trigger(GEPPETTO.Events.Hide_spinner);
                    }
                });    
        }
    }

    handleCloseDialog = () => {
        this.setState({ openDialog: false });
    };

    newPlotWidget(name, svgResponse, data, i, total) {
        var s = svgResponse;
        var that = this;
        G.addWidget(1).then(w => {
            if (total == 0) {
                w.setName(name);
            }
            else {
                w.setName(name + " " + i);
            }
            w.$el.append(s);
            var svg = $(w.$el).find("svg")[0];
            svg.removeAttribute('width');
            svg.removeAttribute('height');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '98%');
            that.widgets.push(w);
            if (i < total) {
                that.newPlotWidget(name, data[i++], data, i++, total)
            }
            w.showHistoryIcon(false);
            w.showHelpIcon(false);
        });
    }

    processError(response, plotName) {
        var parsedResponse = JSON.parse(response);
        if (parsedResponse.hasOwnProperty("type") && parsedResponse['type'] == 'ERROR') {
            this.setState({
                dialogTitle: "NetPyNE returned an error plotting " + plotName,
                errorDialogMessage: parsedResponse['message'] + "\n " + parsedResponse['details'],
                openDialog: true,
            });
            return true;
        }
        return false;
    }

    processSimError(parsedResponse) {
        if (parsedResponse.hasOwnProperty("type") && parsedResponse['type'] == 'ERROR') {
            GEPPETTO.trigger(GEPPETTO.Events.Hide_spinner);
            this.setState({ openDialog: true, errorDialogMessage: parsedResponse['message'] + "\n" + parsedResponse['details'], dialogTitle: "NetPyNE returned an error: " })
            return true;
        }
        return false;
    }

    plotFigure(plotName, plotMethod, plotType=false) {
        Utils.sendPythonMessage('netpyne_geppetto.getPlot', [plotMethod, plotType])
            .then(response => {
                //TODO Fix this, use just JSON
                if(typeof response === 'string'){
                    if (response.startsWith("{") && response.endsWith("}")) {
                        if (this.processError(response, plotName)){
                            return;
                        }
                    }
                    if (response.startsWith("[") && response.endsWith("]")) {
                        response = eval(response);
                    }
                }
                if ($.isArray(response)) {
                    this.newPlotWidget(plotName, response[0], response, 0, response.length - 1);
                }
                else if (response == -1) {
                    this.processError(response, plotName)
                }
                else {
                    this.newPlotWidget(plotName, response, response, 0, 0);
                }
            });
    }

    getOpenedWidgets() {
        return this.widgets
    }

    handleClick(event) {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            plotButtonOpen: true,
            anchorEl: event.currentTarget,
        });
    }

    handleRequestClose() {
        this.setState({
            plotButtonOpen: false,
        });
    }

    render() {
        var controls;
        var refreshButton = null;
        var simDialogMessage = null;
        if (this.props.page == 'explore') {
            if (!this.state.networkAlreadyInstantiated){
                refreshButton = <FloatingActionButton key={"refreshInstanceButton"} iconStyle={{color:pink400}} backgroundColor="#ffffff" iconClassName="fa fa-refresh" onClick={()=>this.instantiate()} style={{position: 'absolute', right: 34, top: 50}}/>
            }
            controls = (
                <Menu>
                    <MenuItem id={"connectionPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="Connectivity" onClick={() => { this.plotFigure('Connections Plot', 'plotConn') }} />
                    <MenuItem id={"2dNetPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="2D network" onClick={() => { this.plotFigure('2D Net Plot', 'plot2Dnet') }} />
                    <MenuItem id={"shapePlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="Cell shape" onClick={() => { this.plotFigure('Shape Plot', 'plotShape') }} />
                </Menu>
            );
        }
        else if (this.props.page == 'simulate') {
            if (!this.state.networkAlreadySimulated) {
                refreshButton = <FloatingActionButton key={"refreshSimulationButton"} iconStyle={{color:pink400}} backgroundColor="#ffffff" iconClassName="fa fa-refresh" onClick={()=>this.simDialogOpen()} style={{position: 'absolute', right: 34, top: 50}}/>
                var simDialogMessage = (
                    <div>
                        <div >We are about to simulate your network, this could take some time.</div>
                        <div style={{ marginTop: '35px' }}>
                            <Checkbox
                                id="runParallelSimulationFromHLS"
                                label="Use High Level Specification "
                                checked={this.state.simulateFromHLS}
                                onCheck={() => this.setState((oldState) => {return {simulateFromHLS: !oldState.simulateFromHLS, simulateFromInstance: oldState.simulateFromHLS, previousTab: 'define'}})}
                            />
                            <Checkbox
                                id="runParallelSimulationFromInstance"
                                label="Use Instanciated Network"
                                checked={this.state.simulateFromInstance}
                                onCheck={() => this.setState((oldState) => {return {simulateFromInstance: !oldState.simulateFromInstance, simulateFromHLS: oldState.simulateFromInstance, previousTab: 'explore'}})}
                            />
                            <Checkbox
                                id="runParallelSimulation"
                                label="Run parallel simulation"
                                checked={this.state.parallelSimulation}
                                onCheck={() => this.setState((oldState) => {return {parallelSimulation: !oldState.parallelSimulation};})}
                            />
                        </div>
                        <div className="netpyneRightField">
                            <TextField
                                floatingLabelText="Number of cores"
                                type="number"
                                onChange={(event) => this.setState({ cores: event.target.value })}
                            />
                        </div>
                    </div>
                )
            }
            controls = (
                <Menu>
                    <MenuItem id={"tracesPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="Cell traces" onClick={() => { this.plotFigure('Traces Plot', 'plotTraces') }} />
                    <MenuItem id={"rasterPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="Raster plot" onClick={() => { this.plotFigure('Raster Plot', 'plotRaster') }} />
                    <MenuItem id={"spikePlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="Spike histogram" onClick={() => { this.plotFigure('Spike Hist Plot', 'plotSpikeHist') }} />
                    <MenuItem id={"spikeStatsPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="Spike stats" onClick={() => { this.plotFigure('Spike Stats Plot', 'plotSpikeStats') }} />
                    <MenuItem id={"ratePSDPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="Rate PSD" onClick={() => { this.plotFigure('Rate PSD Plot', 'plotRatePSD') }} />
                    <MenuItem id={"LFPTimeSeriesPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="LFP time-series" onClick={() => { this.plotFigure('LFP Time Series Plot', 'plotLFP', 'timeSeries') }} />
                    <MenuItem id={"LFPPSDPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="LFP PSD" onClick={() => { this.plotFigure('LFP PSD Plot', 'plotLFP', 'PSD') }} />
                    <MenuItem id={"LFPSpectrogramPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="LFP spectrogram" onClick={() => { this.plotFigure('LFP Spectrogram Plot', 'plotLFP', 'spectrogram') }} />
                    <MenuItem id={"LFPLocationsPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="LFP locations" onClick={() => { this.plotFigure('LFP Locations Plot', 'plotLFP', 'locations') }} />
                    <MenuItem id={"grangerPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="Granger causality plot" onClick={() => { this.plotFigure('Granger Plot', 'granger') }} />
                    <MenuItem id={"rxdConcentrationPlot"} style={styles.menuItem} innerDivStyle={styles.menuItemDiv} primaryText="RxD concentration plot" onClick={() => { this.plotFigure('RxD concentration plot', 'plotRxDConcentration') }} />
                </Menu>
            );
        }

        return (
            <div id="instantiatedContainer" style={{ height: '100%', width: '100%' }}>
                <Canvas
                    key={this.state.key}
                    id="CanvasContainer"
                    name={"Canvas"}
                    componentType={'Canvas'}
                    ref={"canvas"}
                    style={{ height: '100%', width: '100%' }}
                />
                {refreshButton}
                <div id="controlpanel" style={{ top: 0 }}>
                    <ControlPanel
                        icon={"styles.Modal"}
                        useBuiltInFilters={false}
                    >
                    </ControlPanel>
                </div>
                <IconButton style={{ position: 'absolute', left: 34, top: 55 }}
                    onClick={() => { $('#controlpanel').show(); }}
                    icon={"fa-list"}
                    id={"ControlPanelButton"} />
                <div>
                    <IconButton
                        onClick={this.handleClick}
                        style={{ position: 'absolute', left: 34, top: 358 }}
                        label="Plot"
                        icon={"fa-bar-chart"}
                        id="PlotButton"
                    />
                    <Popover
                        open={this.state.plotButtonOpen}
                        anchorEl={this.state.anchorEl}
                        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                        targetOrigin={{ horizontal: 'left', vertical: 'top' }}
                        onRequestClose={this.handleRequestClose}
                    >
                        {controls}
                    </Popover>
                </div>
                <Dialog
                    title={this.state.dialogTitle}
                    modal={true}
                    actions={[<FlatButton label="CANCEL" primary={true} onClick={this.handleCloseDialog}/>, 
                        <FlatButton id="netPyneDialog" label={this.state.simDialog?"Run":"Ok"} primary={true} keyboardFocused={true} onClick={this.state.simDialog?()=>{this.simulate()}:this.handleCloseDialog}/>
                    ]}
                    bodyStyle={{ overflow: 'auto' }}
                    style={{ whiteSpace: "pre-wrap" }}
                    open={this.state.openDialog}
                    onRequestClose={this.handleCloseDialog}
                >
                    {this.state.simDialog?simDialogMessage:this.state.errorDialogMessage}
                </Dialog>
            </div>

        );
    }
}
