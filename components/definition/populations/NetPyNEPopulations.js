import React, { Component } from 'react';
import IconMenu from 'material-ui/IconMenu';
import Card, { CardHeader, CardText } from 'material-ui/Card';
import Utils from '../../../Utils';
import NetPyNEPopulation from './NetPyNEPopulation';
import NetPyNEAddNew from '../../general/NetPyNEAddNew';
import NetPyNEThumbnail from '../../general/NetPyNEThumbnail';
import DialogBox from '../../../../../js/components/controls/dialogBox/DialogBox';

export default class NetPyNEPopulations extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      drawerOpen: false,
      selectedPopulation: undefined,
      subComponentExists: true,
      deleteButton: false
    };

    this.handleNewPopulation = this.handleNewPopulation.bind(this);
    this.selectPopulation = this.selectPopulation.bind(this);
    this.handleDialogBox = this.handleDialogBox.bind(this);
  }

  handleToggle = () => this.setState({ drawerOpen: !this.state.drawerOpen });


  hasSelectedPopulationBeenRenamed(prevState, currentState) {
    var currentModel = prevState.value;
    var model = currentState.value;
    //deal with rename
    if (currentModel != undefined && model != undefined) {
      var oldP = Object.keys(currentModel);
      var newP = Object.keys(model);
      if (oldP.length == newP.length) {
        //if it's the same lenght there could be a rename
        for (var i = 0; i < oldP.length; i++) {
          if (oldP[i] != newP[i]) {
            if (prevState.selectedPopulation != undefined) {
              if (oldP[i] == prevState.selectedPopulation) {
                return newP[i];
              }
            }
          }
        }
      }
    }
    return false;
  }

  componentDidUpdate(prevProps, prevState) {
    //we need to check if any of the three entities have been renamed and if that's the case change the state for the selection variable
    var newPopulationName = this.hasSelectedPopulationBeenRenamed(prevState, this.state);
    if (newPopulationName) {
      this.setState({ selectedPopulation: newPopulationName });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    var itemRenamed = this.hasSelectedPopulationBeenRenamed(this.state, nextState) != false;
    var newItemCreated = false;
    var selectionChanged = this.state.selectedPopulation != nextState.selectedPopulation;
    var newModel = this.state.value == undefined;
    if (this.state.deleteButton != nextState.deleteButton)
      return true;
    if (this.state.subComponentExists != nextState.subComponentExists)
      return true;
    if (!newModel) {
      newItemCreated = Object.keys(this.state.value).length != Object.keys(nextState.value).length;
    }
    return newModel || newItemCreated || itemRenamed || selectionChanged;
  }

  handleNewPopulation() {
    var defaultPopulationValues = { 'Population': { 'cellModel': '', 'cellType': '' } }
    // Get Key and Value
    var key = Object.keys(defaultPopulationValues)[0];
    var value = defaultPopulationValues[key];
    var model = this.state.value;

    // Get New Available ID
    var populationId = Utils.getAvailableKey(model, key);

    // Create Population Object
    var newPopulation = Object.assign({ name: populationId }, value);

    // Create Population Client side
    Utils.execPythonCommand('netpyne_geppetto.netParams.popParams["' + populationId + '"] = ' + JSON.stringify(value))

    // Update state
    model[populationId] = newPopulation;
    this.setState({
      value: model,
      selectedPopulation: populationId,
      subComponentExists: true
    });

  }

  /* Method that handles button click */
  selectPopulation(populationName, buttonExists) {
    this.setState({ 
      selectedPopulation: populationName, 
      subComponentExists: buttonExists,
      deleteButton: false
    });
  }

  handleDialogBox(childResponse) {
    this.setState({
      deleteButton: childResponse,
      subComponentExists: !childResponse
    });
  }

  render() {

    var deleteDialogBox = "";
    if (this.state.value != undefined && this.state.value != "") {
      var model = this.state.value;
      for (var m in model) {
        model[m].name = m;
      }
      var populations = [];
      for (var key in model) {
        if(model[key].name == this.state.selectedPopulation && !this.state.subComponentExists && this.state.deleteButton) {
          var action = 'netpyne_geppetto.deleteParam';
          var paramToDel = "popParams['" + this.state.selectedPopulation + "']";
          Utils.sendPythonMessage(action, [paramToDel]);
          delete model[key];
          continue;
        }
        if((model[key].name == this.state.selectedPopulation && !this.state.subComponentExists) && (this.state.deleteButton == false)) {
          deleteDialogBox = <DialogBox onDialogResponse={this.handleDialogBox} textForDialog={this.state.selectedPopulation}/>;
        }
        populations.push(<NetPyNEThumbnail name={key} key={key} selected={key == this.state.selectedPopulation} handleClick={this.selectPopulation} />);
      }
      var selectedPopulation = undefined;
      if ((this.state.selectedPopulation && this.state.subComponentExists) && Object.keys(model).indexOf(this.state.selectedPopulation)>-1) {
        selectedPopulation = <NetPyNEPopulation name={this.state.selectedPopulation} model={this.state.value[this.state.selectedPopulation]} />;
      }
    }
    
    return (
      <Card style={{ clear: 'both' }}>
        <CardHeader
          title="Populations"
          subtitle="Define here the populations of your network"
          actAsExpander={true}
          showExpandableButton={true}
          id={"Populations"}
        />
        <CardText className={"tabContainer"} expandable={true}>
          <div className={"details"}>
            {selectedPopulation}
          </div>
          <div className={"thumbnails"}>
            <div className="breadcrumb">
              <IconMenu style={{ float: 'left', marginTop: "12px", marginLeft: "18px" }}
                iconButtonElement={
                  <NetPyNEAddNew id={"newPopulationButton"} handleClick={this.handleNewPopulation} />
                }
                anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                targetOrigin={{ horizontal: 'left', vertical: 'top' }}
              >
              </IconMenu>
            </div>
            <div style={{ clear: "both" }}></div>
            {populations}
            {deleteDialogBox}
          </div>
        </CardText>
      </Card>

    );
  }
}
