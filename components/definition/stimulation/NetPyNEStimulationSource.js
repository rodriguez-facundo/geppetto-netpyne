import React, { Component } from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Tooltip from 'material-ui/internal/Tooltip';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import IconMenu from 'material-ui/IconMenu';
import RaisedButton from 'material-ui/RaisedButton';
import clone from 'lodash.clone';
import Utils from '../../../Utils';
import NetPyNEField from '../../general/NetPyNEField';
import ListComponent from '../../general/List';

var PythonControlledCapability = require('../../../../../js/communication/geppettoJupyter/PythonControlledCapability');
var PythonControlledTextField = PythonControlledCapability.createPythonControlledControl(TextField);
var PythonControlledListComponent = PythonControlledCapability.createPythonControlledControl(ListComponent);

export default class NetPyNEStimulationSource extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentName: props.name,
      sourceType: null
    };
    
    this.stimSourceTypeOptions = [
      { type: 'IClamp' }, 
      { type: 'VClamp' }, 
      { type: 'SEClamp'},
      { type: 'NetStim'},
      { type: 'AlphaSynapse'}
    ];
    this.handleStimSourceTypeChange = this.handleStimSourceTypeChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.currentName!=nextProps.name) {
      this.setState({ currentName: nextProps.name, sourceType: null});
    };
  };
  
  handleRenameChange = (event) => {
    var that = this;
    var storedValue = this.props.name;
    var newValue = event.target.value;
    this.setState({ currentName: newValue });
    this.triggerUpdate(function () {
      // Rename the population in Python
      Utils.renameKey('netParams.stimSourceParams', storedValue, newValue, (response, newValue) => { that.renaming = false });
      that.renaming = true;
    });
  };
  
  triggerUpdate(updateMethod) {
    //common strategy when triggering processing of a value change, delay it, every time there is a change we reset
    if (this.updateTimer != undefined) {
      clearTimeout(this.updateTimer);
    }
    this.updateTimer = setTimeout(updateMethod, 1000);
  };
  
  componentDidMount() {
    this.updateLayout();
  };

  componentDidUpdate(prevProps, prevState) {
      if (this.state.currentName != prevState.currentName) {
          this.updateLayout();
      };
  };

  updateLayout() {
    const getType = (value) => {
      Utils
        .sendPythonMessage("'" + value + "' in netParams.stimSourceParams['" + this.state.currentName + "']['type']")
        .then((response) => { if (response) {this.setState({sourceType: value})}});
    };
    this.stimSourceTypeOptions.forEach((option) => { getType(option.type) });
  };
  
  handleStimSourceTypeChange(event, index, value) {
    Utils.execPythonCommand("netpyne_geppetto.netParams.stimSourceParams['" + this.state.currentName + "']['type'] = '" + value + "'");
    this.setState({ sourceType: value });
  };
  
  render() {
    var content = (
      <div>
        <TextField
          onChange={this.handleRenameChange}
          value = {this.state.currentName}
          disabled={this.renaming}
          className={"netpyneField"}
          id={"sourceName"}
        />
        <br/>
        <NetPyNEField id="netParams.stimSourceParams.type" className={"netpyneFieldNoWidth"} noStyle>
          <SelectField 
            floatingLabelText="Stim type"
            value={this.state.sourceType}
            onChange={this.handleStimSourceTypeChange}
          >
            {(this.stimSourceTypeOptions != undefined) ?
                this.stimSourceTypeOptions.map(function (stimSourceTypeOption) {
                  return (<MenuItem key={stimSourceTypeOption.type} value={stimSourceTypeOption.type} primaryText={stimSourceTypeOption.type} />)
                }) : null
            }
          </SelectField>
        </NetPyNEField>  
      </div>);
    if (this.state.sourceType=='IClamp'){
      var variableContent = 
        <div>
          <NetPyNEField id="netParams.stimSourceParams.IClamp.del">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['del']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.IClamp.dur" className="listStyle">
            <PythonControlledListComponent
              model={"netParams.stimSourceParams['" + this.props.name + "']['dur']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.IClamp.amp" className="listStyle">
            <PythonControlledListComponent
              model={"netParams.stimSourceParams['" + this.props.name + "']['amp']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.IClamp.i">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['i']"}
            />
          </NetPyNEField>
        </div>
    } else if (this.state.sourceType=='VClamp'){
      var variableContent = 
        <div>
          <NetPyNEField id="netParams.stimSourceParams.VClamp.tau1">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['tau1']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.VClamp.tau2">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['tau2']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.VClamp.dur" className="listStyle">
            <PythonControlledListComponent
              model={"netParams.stimSourceParams['" + this.props.name + "']['dur']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.VClamp.amp" className="listStyle">
            <PythonControlledListComponent
              model={"netParams.stimSourceParams['" + this.props.name + "']['amp']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.VClamp.gain">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['gain']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.VClamp.rstim">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['rstim']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.VClamp.i">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['i']"}
            />
          </NetPyNEField>
        </div>
    } else if (this.state.sourceType=='AlphaSynapse'){
      var variableContent = 
        <div>
          <NetPyNEField id="netParams.stimSourceParams.AlphaSynapse.onset">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['onset']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.AlphaSynapse.tau">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['tau']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.AlphaSynapse.gmax">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['gmax']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.AlphaSynapse.e">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['e']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.AlphaSynapse.i">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['i']"}
            />
          </NetPyNEField>
        </div>
    }else if (this.state.sourceType=='NetStim'){
      var variableContent = 
        <div>
          <NetPyNEField id="netParams.stimSourceParams.NetStim.interval">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['interval']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.NetStim.number">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['number']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.NetStim.start">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['start']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.NetStim.noise">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['noise']"}
            />
          </NetPyNEField>
        </div>
    } else if (this.state.sourceType=='SEClamp'){
      var variableContent = 
        <div>
          <NetPyNEField id="netParams.stimSourceParams.SEClamp.rs">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['rs']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.SEClamp.dur" className="listStyle">
            <PythonControlledListComponent
              model={"netParams.stimSourceParams['" + this.props.name + "']['dur']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.SEClamp.dur" className="listStyle">
            <PythonControlledListComponent
              model={"netParams.stimSourceParams['" + this.props.name + "']['amp']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.SEClamp.i">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['i']"}
            />
          </NetPyNEField>
          <NetPyNEField id="netParams.stimSourceParams.SEClamp.vc">
            <PythonControlledTextField
              model={"netParams.stimSourceParams['" + this.props.name + "']['vc']"}
            />
          </NetPyNEField>
        </div>
    } 
    return (
      <div>
        {content}
        {variableContent}
      </div>
    );
  }
}
