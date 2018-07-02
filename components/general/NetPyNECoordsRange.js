import React, { Component } from 'react';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import Utils from '../../Utils';
import NetPyNEField from './NetPyNEField';
import AdapterComponent from './AdapterComponent';

var PythonControlledCapability = require('../../../../js/communication/geppettoJupyter/PythonControlledCapability');
var PythonControlledAdapterComponent = PythonControlledCapability.createPythonControlledControl(AdapterComponent);
 
export default class NetPyNECoordsRange extends Component {
 
  constructor(props) {
    super(props);
    this.state = {
      currentName: props.name,
      rangeType: undefined,
    };
  };
 
  componentDidUpdate(prevProps, prevState) {
    if (this.state.currentName != prevState.currentName || this.props.conds!=prevProps.conds) {
      this.updateLayout();
    };
  };
 
  componentDidMount() {
    this.updateLayout();
  };
 
  componentWillReceiveProps(nextProps) {
    if (this.state.currentName != nextProps.name) {
      this.setState({ currentName: nextProps.name});
    };
  };

  updateLayout() {
    var message = this.props.model + "['" + this.state.currentName + "']";
    if (this.props.conds!=undefined) {
      message = message + "['" + this.props.conds + "']";
    };
    this.setState({rangeType: undefined});
    this.props.items.forEach((item) => {
      Utils
        .sendPythonMessage("'" + item.value + "' in " + message)
        .then((response) => {
          if (response) {
            this.setState({rangeType: item.value});
          }
        });
    });
  };
  
  createMenuItems = () => {
    return this.props.items.map((obj) => (
      <MenuItem
        key={obj.value}
        value={obj.value}
        primaryText={obj.label}
      />
    ));
  };
   
  render() {
    if (this.props.conds!=undefined) {
      var meta = this.props.model + "." + this.props.conds + "." + this.props.items[0].value;
      var path = this.props.model + "['" + this.state.currentName + "']['" + this.props.conds + "']['" + this.state.rangeType + "']";
    } else {
      var meta = this.props.model + '.' + this.props.items[0].value;
      var path = this.props.model + "['" + this.state.currentName + "']['" + this.state.rangeType + "']";
    };
    
    return (
      <div>
        <NetPyNEField id={meta} >
          <SelectField
            floatingLabelText={"Range type"}
            value={this.state.rangeType}
            onChange={(event, index, value) => this.setState({ rangeType: value })}
          >
            {this.createMenuItems()}
          </SelectField>
        </NetPyNEField>
        {(this.state.rangeType != undefined) ?
          <div className={"netpyneRightField"}>
            <PythonControlledAdapterComponent
              model={path}
              convertToPython={(state) => {
                if (!state[state.lastUpdated].toString().endsWith(".") && 
                ((!isNaN(parseFloat(state.min))) && (!isNaN(parseFloat(state.max))))) {
                  return [parseFloat(state.min), parseFloat(state.max)];
                }}
              }
              convertFromPython={(prevProps, prevState, value) => {
                if (value != undefined && prevProps.value != value && value != '') {
                  return { min: value[0], max: value[1] };
                }}
              }
            >
              <TextField floatingLabelText="Minimum" id="min" style={{marginLeft: 10}}/>
              <TextField floatingLabelText="Maximum" id="max" style={{marginLeft: 10}}/>
            </PythonControlledAdapterComponent>
          </div>
        : null}
        <br />
      </div>
    );
  };
};