import React, { Component } from 'react';
import IconMenu from 'material-ui/IconMenu';
import Card, { CardHeader, CardText } from 'material-ui/Card';
import Utils from '../../../Utils';
import NetPyNEStimulationSource from './NetPyNEStimulationSource';
import NetPyNENewStimulationSource from './NetPyNENewStimulationSource';
import NetPyNEStimulationThumbnail from './NetPyNEStimulationThumbnail';

export default class NetPyNEStimulationSources extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedStimulationSource: undefined,
    };
    this.selectStimulationSource = this.selectStimulationSource.bind(this);
    this.handleNewStimulationSource = this.handleNewStimulationSource.bind(this);
  };

  selectStimulationSource(StimulationSource) {
    this.setState({ selectedStimulationSource: StimulationSource });
  };

  handleNewStimulationSource(defaultStimulationSources) {
    var key = Object.keys(defaultStimulationSources)[0];
    var value = defaultStimulationSources[key];
    var model = this.state.value;
    var StimulationSourceId = Utils.getAvailableKey(model, key);
    Utils.execPythonCommand('netpyne_geppetto.netParams.stimSourceParams["' + StimulationSourceId + '"] = ' + JSON.stringify(value));
    this.setState({
      value: model,
      selectedStimulationSource: StimulationSourceId
    });
  };

  hasSelectedStimulationSourceBeenRenamed(prevState, currentState) {
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
            if (prevState.selectedStimulationSource != undefined) {
              if (oldP[i] == prevState.selectedStimulationSource) {
                return newP[i];
              };
            };
          };
        };
      };
    };
    return false;
  };

  componentDidUpdate(prevProps, prevState) {
    var newStimulationSourceName = this.hasSelectedStimulationSourceBeenRenamed(prevState, this.state);
    if (newStimulationSourceName) {
      this.setState({ selectedStimulationSource: newStimulationSourceName });
    };
  };

  shouldComponentUpdate(nextProps, nextState) {
    var itemRenamed = this.hasSelectedStimulationSourceBeenRenamed(this.state, nextState) != false;
    var newItemCreated = false;
    var selectionChanged = this.state.selectedStimulationSource != nextState.selectedStimulationSource;
    if (this.state.value!=undefined) {
      newItemCreated = Object.keys(this.state.value).length != Object.keys(nextState.value).length;
    };
    return newItemCreated || itemRenamed || selectionChanged;
  };

  render() {
    var model = this.state.value;
    var StimulationSources = [];
    for (var c in model) {
      StimulationSources.push(<NetPyNEStimulationThumbnail name={c} key={c} selected={c == this.state.selectedStimulationSource} handleClick={this.selectStimulationSource} />);
    };
    
    var selectedStimulationSource = undefined;
    if (this.state.selectedStimulationSource && Object.keys(model).indexOf(this.state.selectedStimulationSource)>-1) {
      selectedStimulationSource = <NetPyNEStimulationSource name={this.state.selectedStimulationSource} />;
    };
    
    var content = (
      <CardText className={"tabContainer"} expandable={true}>
        <div className={"details"}>
          {selectedStimulationSource}
        </div>
        <div className={"thumbnails"}>
          <div className="breadcrumb">
            <IconMenu style={{ float: 'left', marginTop: "12px", marginLeft: "18px" }}
              iconButtonElement={
                <NetPyNENewStimulationSource handleClick={this.handleNewStimulationSource} />
              }
              anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
              targetOrigin={{ horizontal: 'left', vertical: 'top' }}
            >
            </IconMenu>
          </div>
          <div style={{ clear: "both" }}></div>
          {StimulationSources}
        </div>
      </CardText>
    );

    return (
      <Card style={{ clear: 'both' }}>
        <CardHeader
          title="Stimulation sources"
          subtitle="Define here the rules to generate the stimulation sources in your network"
          actAsExpander={true}
          showExpandableButton={true}
          id={"SimulationSources"}
        />
        {content}
      </Card>
    );
  };
};