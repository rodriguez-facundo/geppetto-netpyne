import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Utils from '../../../Utils';
import FontIcon from 'material-ui/FontIcon';
import CardText from 'material-ui/Card';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import NetPyNEField from '../../general/NetPyNEField';
import ListComponent from '../../general/List';
import NetPyNECoordsRange from '../../general/NetPyNECoordsRange';
import Dialog from 'material-ui/Dialog/Dialog';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';

var PythonControlledCapability = require('../../../../../js/communication/geppettoJupyter/PythonControlledCapability');
var PythonControlledTextField = PythonControlledCapability.createPythonControlledControl(TextField);
var PythonMethodControlledSelectField = PythonControlledCapability.createPythonControlledControlWithPythonDataFetch(SelectField);
var PythonControlledListComponent = PythonControlledCapability.createPythonControlledControl(ListComponent);

export default class NetPyNEConnectivityRule extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      currentName: props.name,
      selectedIndex: 0,
      sectionId: "General",
      errorMessage: undefined,
      errorDetails: undefined
    };
  }

  componentDidMount(){
    GEPPETTO.on('populations_change', () => {
      this.forceUpdate();
    })
    GEPPETTO.on('cellType_change', () => {
      this.forceUpdate();
    })
    GEPPETTO.on('cellModel_change', () => {
      this.forceUpdate();
    })
  }

  componentWillUnmount(){
    GEPPETTO.off('populations_change')
    GEPPETTO.off('cellType_change')
    GEPPETTO.off('cellModel_change')
  }  

  handleRenameChange = (event) => {
    var storedValue = this.props.name;
    var newValue = Utils.nameValidation(event.target.value);
    var updateCondition = this.props.renameHandler(newValue);
    var triggerCondition = Utils.handleUpdate(updateCondition, newValue, event.target.value, this, "ConnectionRule");

    if(triggerCondition) {
      this.triggerUpdate(() => {
        // Rename the population in Python
        Utils.renameKey('netParams.connParams', storedValue, newValue, (response, newValue) => { this.renaming = false; });
        this.renaming = true;
      });
    }
  }

  triggerUpdate(updateMethod) {
    //common strategy when triggering processing of a value change, delay it, every time there is a change we reset
    if (this.updateTimer != undefined) {
      clearTimeout(this.updateTimer);
    }
    this.updateTimer = setTimeout(updateMethod, 1000);
  }

  select = (index, sectionId) => this.setState({ selectedIndex: index, sectionId: sectionId });

  getBottomNavigationItem(index, sectionId, label, icon, id) {
    return <BottomNavigationItem
      id={id}
      key={sectionId}
      label={label}
      icon={(<FontIcon className={"fa " + icon}></FontIcon>)}
      onClick={() => this.select(index, sectionId)}
    />
  }


  postProcessMenuItems(pythonData, selected) {
    return pythonData.map((name) => (
      <MenuItem
        id={name+"MenuItem"}
        key={name}
        insetChildren={true}
        checked={selected.indexOf(name) > -1}
        value={name}
        primaryText={name}
      />
    ));
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ currentName: nextProps.name });
  }

  render() {
    var actions = [
      <RaisedButton
        primary
        label={"BACK"}
        onTouchTap={() => this.setState({ errorMessage: undefined, errorDetails: undefined })}
      />
    ];
    var title = this.state.errorMessage;
    var children = this.state.errorDetails;
    var dialogPop = (this.state.errorMessage != undefined)? <Dialog
                                                              title={title}
                                                              open={true}
                                                              actions={actions}
                                                              bodyStyle={{ overflow: 'auto' }}
                                                              style={{ whiteSpace: "pre-wrap" }}>
                                                              {children}
                                                            </Dialog> : undefined;

    if (this.state.sectionId == "General") {
      var content =
        <div>
          <TextField
            id={"ConnectivityName"}
            onChange={this.handleRenameChange}
            value={this.state.currentName}
            disabled={this.renaming}
            floatingLabelText="The name of the connectivity rule"
            className={"netpyneField"}
          />

          <NetPyNEField id="netParams.connParams.sec" className="listStyle">
            <PythonControlledListComponent
              model={"netParams.connParams['" + this.props.name + "']['sec']"}
            />
          </NetPyNEField>

          <NetPyNEField id="netParams.connParams.loc" className="listStyle">
            <PythonControlledListComponent
              model={"netParams.connParams['" + this.props.name + "']['loc']"}
            />
          </NetPyNEField>

          <NetPyNEField id={"netParams.connParams.synMech"} >
            <PythonMethodControlledSelectField
              model={"netParams.connParams['" + this.props.name + "']['synMech']"}
              method={"netpyne_geppetto.getAvailableSynMech"}
              postProcessItems={(pythonData, selected) => {
                return pythonData.map((name) => (<MenuItem id={name+"MenuItem"}key={name} value={name} primaryText={name} />));
              }}
            />
          </NetPyNEField>

          <NetPyNEField id="netParams.connParams.convergence" >
            <PythonControlledTextField
              model={"netParams.connParams['" + this.props.name + "']['convergence']"}
            />
          </NetPyNEField>

          <NetPyNEField id="netParams.connParams.divergence" >
            <PythonControlledTextField
              model={"netParams.connParams['" + this.props.name + "']['divergence']"}
            />
          </NetPyNEField>

          <NetPyNEField id="netParams.connParams.probability" >
            <PythonControlledTextField
              model={"netParams.connParams['" + this.props.name + "']['probability']"}
            />
          </NetPyNEField>

          <NetPyNEField id="netParams.connParams.synsPerConn" >
            <PythonControlledTextField
              model={"netParams.connParams['" + this.props.name + "']['synsPerConn']"}
            />
          </NetPyNEField>

          <NetPyNEField id="netParams.connParams.weight" >
            <PythonControlledTextField
              model={"netParams.connParams['" + this.props.name + "']['weight']"}
            />
          </NetPyNEField>

          <NetPyNEField id="netParams.connParams.delay" className="listStyle" noStyle>
            <PythonControlledTextField
              model={"netParams.connParams['" + this.props.name + "']['delay']"}
            />
          </NetPyNEField>

          <NetPyNEField id="netParams.connParams.plasticity" >
            <PythonControlledTextField
              model={"netParams.connParams['" + this.props.name + "']['plasticity']"}
            />
          </NetPyNEField>
          {dialogPop}
        </div>
    }
    else if (this.state.sectionId == "Pre Conditions") {
      var content = <div>
        <NetPyNEField id={"netParams.connParams.preConds.pop"} >
          <PythonMethodControlledSelectField
            model={"netParams.connParams['" + this.props.name + "']['preConds']['pop']"}
            method={"netpyne_geppetto.getAvailablePops"}
            postProcessItems={this.postProcessMenuItems}
            multiple={true}
          />
        </NetPyNEField>
        <NetPyNEField id={"netParams.connParams.preConds.cellModel"} >
          <PythonMethodControlledSelectField
            model={"netParams.connParams['" + this.props.name + "']['preConds']['cellModel']"}
            method={"netpyne_geppetto.getAvailableCellModels"}
            postProcessItems={this.postProcessMenuItems}
            multiple={true}
          />
        </NetPyNEField>
        <NetPyNEField id={"netParams.connParams.preConds.cellType"} >
          <PythonMethodControlledSelectField
            model={"netParams.connParams['" + this.props.name + "']['preConds']['cellType']"}
            method={"netpyne_geppetto.getAvailableCellTypes"}
            postProcessItems={this.postProcessMenuItems}
            multiple={true}
          />
        </NetPyNEField>

        <NetPyNECoordsRange
          id="xRangePreConn"
          name={this.props.name}
          model={'netParams.connParams'}
          conds={'preConds'}
          items={[
            { value: 'x', label: 'Absolute' },
            { value: 'xnorm', label: 'Normalized' }
          ]}
        />

        <NetPyNECoordsRange
          id="yRangePreConn"
          name={this.props.name}
          model={'netParams.connParams'}
          conds={'preConds'}
          items={[
            { value: 'y', label: 'Absolute' },
            { value: 'ynorm', label: 'Normalized' }
          ]}
        />

        <NetPyNECoordsRange
          id="zRangePreConn"
          name={this.props.name}
          model={'netParams.connParams'}
          conds={'preConds'}
          items={[
            { value: 'z', label: 'Absolute' },
            { value: 'znorm', label: 'Normalized' }
          ]}
        />

      </div>
    }
    else if (this.state.sectionId == "Post Conditions") {
      var content = <div>
        <NetPyNEField id={"netParams.connParams.postConds.pop"} >
          <PythonMethodControlledSelectField
            model={"netParams.connParams['" + this.props.name + "']['postConds']['pop']"}
            method={"netpyne_geppetto.getAvailablePops"}
            postProcessItems={this.postProcessMenuItems}
            multiple={true}
          />
        </NetPyNEField>
        <NetPyNEField id={"netParams.connParams.postConds.cellModel"} >
          <PythonMethodControlledSelectField
            model={"netParams.connParams['" + this.props.name + "']['postConds']['cellModel']"}
            method={"netpyne_geppetto.getAvailableCellModels"}
            postProcessItems={this.postProcessMenuItems}
            multiple={true}
          />
        </NetPyNEField>
        <NetPyNEField id={"netParams.connParams.postConds.cellType"} >
          <PythonMethodControlledSelectField
            model={"netParams.connParams['" + this.props.name + "']['postConds']['cellType']"}
            method={"netpyne_geppetto.getAvailableCellTypes"}
            postProcessItems={this.postProcessMenuItems}
            multiple={true}
          />
        </NetPyNEField>

        <NetPyNECoordsRange
          id="xRangePostConn"
          name={this.props.name}
          model={'netParams.connParams'}
          conds={'postConds'}
          items={[
            { value: 'x', label: 'Absolute' },
            { value: 'xnorm', label: 'Normalized' }
          ]}
        />

        <NetPyNECoordsRange
          id="yRangePostConn"
          name={this.props.name}
          model={'netParams.connParams'}
          conds={'postConds'}
          items={[
            { value: 'y', label: 'Absolute' },
            { value: 'ynorm', label: 'Normalized' }
          ]}
        />

        <NetPyNECoordsRange
          id="zRangePostConn"
          name={this.props.name}
          model={'netParams.connParams'}
          conds={'postConds'}
          items={[
            { value: 'z', label: 'Absolute' },
            { value: 'znorm', label: 'Normalized' }
          ]}
        />

      </div>
    }


    // Generate Menu
    var index = 0;
    var bottomNavigationItems = [];
    bottomNavigationItems.push(this.getBottomNavigationItem(index++, 'General', 'General', 'fa-bars', 'generalConnTab'));
    bottomNavigationItems.push(this.getBottomNavigationItem(index++, 'Pre Conditions', 'Pre-synaptic cells conditions', 'fa-caret-square-o-left', "preCondsConnTab"));
    bottomNavigationItems.push(this.getBottomNavigationItem(index++, 'Post Conditions', 'Post-synaptic cells conditions', 'fa-caret-square-o-right', 'postCondsConnTab'));

    return (
      <div>
        <CardText>
          <BottomNavigation selectedIndex={this.state.selectedIndex}>
            {bottomNavigationItems}
          </BottomNavigation>
        </CardText>
        <br />
        {content}
      </div>
    );

  }

  handleChange = (event, index, values) => this.setState({ values });

}
