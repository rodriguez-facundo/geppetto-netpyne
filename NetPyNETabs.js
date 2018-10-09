import React from 'react';
import Tabs, { Tab } from 'material-ui/Tabs';
import NetPyNEPopulations from './components/definition/populations/NetPyNEPopulations';
import NetPyNECellRules from './components/definition/cellRules/NetPyNECellRules';
import NetPyNESynapses from './components/definition/synapses/NetPyNESynapses';
import NetPyNEConnectivityRules from './components/definition/connectivity/NetPyNEConnectivityRules';
import NetPyNEStimulationSources from './components/definition/stimulationSources/NetPyNEStimulationSources';
import NetPyNEStimulationTargets from './components/definition/stimulationTargets/NetPyNEStimulationTargets';
import NetPyNEPlots from './components/definition/plots/NetPyNEPlots';
import NetPyNESimConfig from './components/definition/configuration/NetPyNESimConfig';
import NetPyNEInstantiated from './components/instantiation/NetPyNEInstantiated';
import IconButton from 'material-ui/IconButton';
import SettingsDialog from './components/settings/Settings';
import TransitionDialog from './components/transition/Transition';
import FontIcon from 'material-ui/FontIcon';

var PythonControlledCapability = require('../../js/communication/geppettoJupyter/PythonControlledCapability');
var PythonControlledNetPyNEPopulations = PythonControlledCapability.createPythonControlledComponent(NetPyNEPopulations);
var PythonControlledNetPyNECellRules = PythonControlledCapability.createPythonControlledComponent(NetPyNECellRules);
var PythonControlledNetPyNESynapses = PythonControlledCapability.createPythonControlledComponent(NetPyNESynapses);
var PythonControlledNetPyNEConnectivity = PythonControlledCapability.createPythonControlledComponent(NetPyNEConnectivityRules);
var PythonControlledNetPyNEStimulationSources = PythonControlledCapability.createPythonControlledComponent(NetPyNEStimulationSources);
var PythonControlledNetPyNEStimulationTargets = PythonControlledCapability.createPythonControlledComponent(NetPyNEStimulationTargets);
var PythonControlledNetPyNEPlots = PythonControlledCapability.createPythonControlledComponent(NetPyNEPlots);

export default class NetPyNETabs extends React.Component {

  constructor(props) {
    super(props);

    this.widgets = {};
    this.state = {
      value: 'define',
      prevValue: 'define',
      model: null,
      settingsOpen: false
    };

    // GEPPETTO.on('OriginalModelLoaded', (model) => {
    //   var modelObject = JSON.parse(model);
    //   //FIXME: Abusing window object!
    //   window.metadata = modelObject.metadata;
    //   window.context = modelObject.context;
    //   window.currentFolder = modelObject.currentFolder;
    //   this.setState({ model: modelObject })
    // });

  }

  componentWillReceiveProps(nextProps) {
    // switch (nextProps.tab) {
    //TODO: we need to define the rules here
    if (this.props.data != nextProps.data) {
      console.log("Initialising NetPyNE Tabs")
      window.metadata = nextProps.data['metadata'];
      window.context = nextProps.data.context;
      window.currentFolder = nextProps.data.currentFolder;
      this.setState({ model: nextProps.data })
    }
  };

  hideWidgetsFor = (value) => {
    if (value != "define") {
      var page = this.refs[value];
      if (page) {
        var widgets = page.getOpenedWidgets();
        if (this.widgets[value]) {
          widgets = widgets.concat(this.widgets[value]);
        }
        for (var w in widgets) {
          if(!widgets[w].destroyed){
            widgets[w].hide();
          }
          else{
            delete widgets[w];
          }
        }
        this.widgets[value] = widgets;
      }
    }
  }

  restoreWidgetsFor = (value) => {
    if (value != "define") {
      var widgets = this.widgets[value];
      if (widgets) {
        for (var w in widgets) {
            widgets[w].show();
        }
      }
    }
  }

  handleChange = (value) => {
    this.hideWidgetsFor(this.state.value);
    this.restoreWidgetsFor(value);

    this.setState({
      prevValue: this.state.value,
      value: value,
      transitionDialog: true
    });
  };

  openSettings = () => {
    this.setState({ settingsOpen: true });
  }

  cancelTransition=()=>{
    this.hideWidgetsFor(this.state.value);
    this.restoreWidgetsFor(this.state.prevValue);

    this.setState({
      prevValue: this.state.value,
      value: this.state.prevValue,
      transitionDialog: false
    });
  }

  closeSettings = () => {
    this.setState({ settingsOpen: false });
  }

  render() {

    if (this.state.model == null) {
      return (<div></div>)
    }

    var defineContent = this.state.value == "define" ? (
      <div>
        <PythonControlledNetPyNEPopulations model={"netParams.popParams"} />
        <PythonControlledNetPyNECellRules model={"netParams.cellParams"} />
        <PythonControlledNetPyNESynapses model={"netParams.synMechParams"} />
        <PythonControlledNetPyNEConnectivity model={"netParams.connParams"} />
        <PythonControlledNetPyNEStimulationSources model={"netParams.stimSourceParams"} />
        <PythonControlledNetPyNEStimulationTargets model={"netParams.stimTargetParams"} />
        <NetPyNESimConfig model={this.state.model.simConfig} />
        <PythonControlledNetPyNEPlots model={"simConfig.analysis"} />
      </div>
    ) : (<div></div>);
    var exploreContent = this.state.value == "explore" ? (<NetPyNEInstantiated ref={"explore"} model={this.state.model} page={"explore"} />) : (<div></div>);
    var simulateContent = this.state.value == "simulate" ? (<NetPyNEInstantiated ref={"simulate"} model={this.state.model} page={"simulate"} />) : (<div></div>);
    var bottomValue = this.state.value == "define" ? 35 : 0;
    var transitionDialog = this.state.transitionDialog ? (<TransitionDialog tab={this.state.value} cancelTransition={this.cancelTransition}/>):(<div></div>);
    return (
      <div>
        <Tabs
          value={this.state.value}
          style={{ height: '100%', width: 'calc(100% - 48px)', float: 'left' }}
          tabTemplateStyle={{ height: '100%' }}
          contentContainerStyle={{ bottom: bottomValue, position: 'absolute', top: 48, left: 0, right: 0, overflow: 'auto' }}
          onChange={this.handleChange}
        >
          <Tab label="Define your network" value="define" id={"defineNetwork"}>
            {defineContent}
          </Tab>
          <Tab label="Explore your network" value="explore" id={"exploreNetwork"}>
            {exploreContent}
          </Tab>
          <Tab label="Simulate and analyse" value="simulate" id={"simulateNetwork"}>
            {simulateContent}
          </Tab>
        </Tabs>
        <div id="settingsIcon" style={{ float: 'left', width: '48px', backgroundColor: 'rgb(0, 188, 212)' }}>
          <IconButton id="setupNetwork"onClick={this.openSettings}>
            <FontIcon className={"fa fa-cog"} />
          </IconButton>
        </div>
        <SettingsDialog open={this.state.settingsOpen} onRequestClose={this.closeSettings} />
        {transitionDialog}
        
      </div>
    )
  }
}
