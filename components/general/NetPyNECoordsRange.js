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
      rangeType: undefined,
    };

    this._isMounted = false;
  };

  triggerUpdate(updateMethod) {
    //common strategy when triggering processing of a value change, delay it, every time there is a change we reset
    if (this.updateTimer != undefined) {
      clearTimeout(this.updateTimer);
    }
    this.updateTimer = setTimeout(updateMethod, 1000);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.name != prevProps.name)  {
      this.triggerUpdate(() => {
        var message = 'netpyne_geppetto.' + this.props.model + "['" + this.props.name + "']" + ((this.props.conds!=undefined)?"['" + this.props.conds + "']" : "");
        Utils
          .evalPythonMessage("[key in "+message+" for key in ['"+this.props.items[0].value+"', '"+this.props.items[1].value+"']]")
          .then((response) => {
            if (response[0] && this._isMounted === true) {
              this.setState({rangeType: this.props.items[0].value});
            }
            else if (response[1] && this._isMounted === true){
              this.setState({rangeType: this.props.items[1].value});
            }
            else if (this._isMounted === true) {
              this.setState({rangeType: undefined});
            }
        });
      });
    } else if (this.props.conds!=prevProps.conds) {
      this.updateLayout();
    };
  };

  componentDidMount() {
    this._isMounted = true;
    this.updateLayout();
  };

  updateLayout() {
    var message = 'netpyne_geppetto.' + this.props.model + "['" + this.props.name + "']" + ((this.props.conds!=undefined)?"['" + this.props.conds + "']":"");
    Utils
      .evalPythonMessage("[key in "+message+" for key in ['"+this.props.items[0].value+"', '"+this.props.items[1].value+"']]")
      .then((response) => {
        if (response[0] && this._isMounted === true) {
          this.setState({rangeType: this.props.items[0].value});
        }
        else if (response[1] && this._isMounted === true){
          this.setState({rangeType: this.props.items[1].value});
        }
        else if (this._isMounted === true) {
          this.setState({rangeType: undefined});
        }
    });
  };

  createMenuItems = () => {
    return this.props.items.map((obj) => (
      <MenuItem
        id={this.props.id+obj.label+'MenuItem'}
        key={obj.value}
        value={obj.value}
        primaryText={obj.label}
      />
    ));
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (this.props.conds!=undefined) {
      var meta = this.props.model + "." + this.props.conds + "." + this.props.items[0].value;
      var path = this.props.model + "['" + this.props.name + "']['" + this.props.conds + "']['" + this.state.rangeType + "']";
    } else {
      var meta = this.props.model + '.' + this.props.items[0].value;
      var path = this.props.model + "['" + this.props.name + "']['" + this.state.rangeType + "']";
    };
    var min = this.props.id+"MinRange";
    var max = this.props.id+"MaxRange";
    return (
      <div >
        <NetPyNEField id={meta} >
          <SelectField
            id={this.props.id+'Select'}
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
                ((!isNaN(parseFloat(state[min]))) && (!isNaN(parseFloat(state[max]))))) {
                  return [parseFloat(state[min]), parseFloat(state[max])];
                }}
              }
              convertFromPython={(prevProps, prevState, value) => {
                if (value != undefined && prevProps.value != value && value != '') {
                  var output = {}
                  output[min] = value[0];
                  output[max] = value[1];
                  return output;
                }}
              }
            >
              <TextField floatingLabelText="Minimum" id={min} style={{marginLeft: 10}}/>
              <TextField floatingLabelText="Maximum" id={max} style={{marginLeft: 10}}/>
            </PythonControlledAdapterComponent>
          </div>
        : null}
        <br />
      </div>
    );
  };
};
