import React, { Component } from 'react';
import Menu from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import Divider from 'material-ui/Divider';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Popover from 'material-ui/Popover/Popover';
import SelectField from 'material-ui/SelectField';
import DropDownMenu from 'material-ui/DropDownMenu';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import Utils from '../../../Utils';
import NetPyNEField from '../../general/NetPyNEField';

var PythonControlledCapability = require('../../../../../js/communication/geppettoJupyter/PythonControlledCapability');


export default class NetPyNEInclude extends Component {
 
  constructor(props) {
    super(props);
    this.state = {
      include: this.getDataTemplate(),
      mainPopoverOpen: false,
      label: ''
    };
  };
 
  componentDidMount() {
    this.collectInfo();
    // this.updateLayout();
  };
 
  XOR = (a, b) => {
    return ( a || b ) && !( a && b );
  }
  
  getDataTemplate = () => {
    return {
      gids: [],
      groups: [],
      popids: {},
      exclusive: false 
    }
  }
  checkEqual = (a, b) => {
    // compare if 2 shallow dicts are equal (no DOM, no 2nd lvl, no functions)
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
        return false;
    }
    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
  }
  
  whoIsIncluded = (include, data) => {
    var pops = 0
    var cells = 0
    var answer = ""
    if (include.exclusive) {
      return include.exclusive + ' -- ' + data.gids + ' cells -- all NetStims'
    }
    else if (include.groups.indexOf('allCells')>-1) {
      if (include.groups.indexOf('allNetStims')==-1) {
        return 'allCells -- ' + data.gids + ' cells' 
      }
      else {
        return 'all'+ ' -- ' + data.gids + ' cells -- all NetStims'
      }
    }
    else {
      include.groups.forEach(group => {
        if (group!='allNetStims') {
          pops += 1
          cells += data[group]
        }
      })
      cells += include.gids.length
      Object.keys(include.popids).forEach(key => {
        if (include.popids[key].length>0) {
          cells += include.popids[key].length
          pops +=1
        }
      })
    }
    if (pops>0) {
      answer += pops + " pops -- "
    }
    answer += cells + " cells "
    if (include.groups.indexOf('allNetStims')>-1) {
      answer += " -- all netStims"
    }
    return answer
  }
  
  sendToPython = () => {
    var data = []
    if (this.state.include.exclusive) {
      data.push(this.state.include.exclusive)
    }
    else {
      this.state.include.groups.forEach(group => data.push(group))
      this.state.include.gids.forEach(gid => data.push(gid))
      Object.keys(this.state.include.popids).forEach(key => data.push([key, this.state.include.popids[key]]))
    }
    Utils
      .execPythonCommand("netpyne_geppetto." + this.props.model + " = " + JSON.stringify(data))
  }
  
  convertFromPython(data) {
    var out = this.getDataTemplate()
    data.forEach((element) => {
      switch(element.constructor.name) {
          case 'Number':
            out['gids'].push(element)
            break;
          case 'String':
            element!='all'?out['groups'].push(element):out.exclusive='all'
            break;
          case 'Array':
            if (element[1].constructor.name=='Number') {
              out['popids'][element[0]] = [element[1]]
            }
            else {
            	out['popids'][element[0]] = element[1]
            }
            break;
          default:
            break
        }
    });
    return out
  }
  collectInfo = () =>{
    Utils
      .sendPythonMessage("netpyne_geppetto.getGIDs", [])
      .then((response) => {
        if (response) {
          Utils
            .sendPythonMessage(this.props.model)
            .then((response2) => {
              if (response2) {
                var included = this.convertFromPython(response2)
                var clone = Object.assign({}, response)
                Object.keys(clone).forEach((key) => clone[key]=false)
                this.setState({
                  data: response,
                  include: included,
                  secondPopoverOpen: clone,
                  label: this.whoIsIncluded(included, response)
                })
              }
          })
        }
    })
  }
    
  handleMainPopoverOpen = (open, preventDefault=false, target=false) => {
    // This prevents ghost click -> 
    if (preventDefault) {
      preventDefault
    }
    // close all secondary popovers
    var clone = Object.assign({}, this.state.secondPopoverOpen)
    Object.keys(clone).forEach((key) => {clone[key] = false})
    
    if (this.XOR(open, this.state.mainPopoverOpen)) {
      this.setState({
        mainPopoverOpen: open, 
        secondPopoverOpen: clone, 
        anchorEl: target?target:this.state.anchorEl})
    }
    if (!open) {
      this.sendToPython()
      this.setState({label: this.whoIsIncluded(this.state.include, this.state.data)})
    }
  }
  
  handleSecondPopoverOpen = (name, open, preventDefault=false, target=false) => {
    // This prevents ghost click -> 
    if (preventDefault) {
      preventDefault;
    }
    var clone = Object.assign({}, this.state.secondPopoverOpen)
    Object.keys(clone).forEach((key) => {clone[key] = (key==name)?open:false})
    
    if (!this.checkEqual(clone, this.state.secondPopoverOpen)) {
      this.setState({
        secondPopoverOpen: clone,
        anchorEl2: target?target:this.state.anchorEl,
      });
    }
    else{
    }
  };
  
  closeSecondPopover = () => {
    var clone = Object.assign({}, this.state.secondPopoverOpen)
    Object.keys(clone).forEach((key) => {clone[key] = false})
    if (!this.checkEqual(clone, this.state.secondPopoverOpen)) {
      this.setState({
        secondPopoverOpen: clone,
      });
    }
    this.setState
  }
  
  defaultMenues = () => {
    // [all, allCells,  allNetStims]
    var mainMenues = this.props.defaultOptions.map(name => {
      return <MenuItem  
        key={name}
        value={name} 
        primaryText={name}
        insetChildren={true}
        onClick={(e)=>this.handleItemClick(name, name=='all'?'exclusive':'groups')}
        checked={this.state.include.exclusive==name||this.state.include.groups.indexOf(name)>-1?true:false}
        onMouseEnter={(e) => this.closeSecondPopover()}
      />
    })
    return <Menu>
      {mainMenues}
    </Menu>
  }
  
  variableMenues = (name, size) => {
    // size: how many sub-menuItems does the menuItem has
    var menuItems = Array.from(Array(size).keys()).map(index => {
      return <MenuItem 
        key={name+index} 
        value={index}
        insetChildren={true}
        primaryText={"cell "+index}
        onClick={e => this.handleSubItemClick(name=='gids'?'gids':'popids', name, index)}
        checked={this.subMenuItemChecked(name=='gids'?'gids':'popids', name, index)}
      />
    })
    return <div key={name+"div"}>
      <MenuItem 
        key={name} 
        value={name}
        primaryText={name}
        insetChildren={true}
        checked={name!='gids'?this.state.include['groups'].indexOf(name)>-1?true:false:false}
        onClick={name!='gids'?(e) => this.handleItemClick(name, 'groups'):(e)=>{}}
        onMouseEnter={(e) => this.handleSecondPopoverOpen(name, true, e.preventDefault(), e.currentTarget)}
      />
      <Popover
        style={{height: size<6?48*size:240, width:170}}
        key={name+"Popover"}
        useLayerForClickAway={false}
        open={this.state.secondPopoverOpen?this.state.secondPopoverOpen[name]:false}
        anchorEl={this.state.anchorEl2}
        anchorOrigin={{"horizontal":"right", "vertical":"top"}}
        targetOrigin={{"horizontal":"left", "vertical":"top"}}
        >
        {menuItems}
      </Popover>
    </div>
  }
  
  handleItemClick = (name, group) => {
    var clone = this.getDataTemplate()
    if (name=='all'){ // remove everything else, when 'all' is selected
      clone.exclusive = 'all'
    }
    else if (name=='allCells') {
      clone['groups'] = ['allCells']
      if (this.state.include['groups'].indexOf('allNetStims')>-1) {
        clone['groups'].push('allNetStims')
      }
    }
    else {
      var clone = Object.assign({}, this.state.include)
      clone[group].indexOf(name)==-1?clone[group].push(name):clone[group].splice( clone[group].indexOf(name), 1 );
      clone['exclusive'] = false
      if (name in clone['popids']) { //when selecting a whole pop, remove individual selections
        delete clone['popids'][name]
      }
      if (this.state.include['groups'].indexOf('allCells')>-1 && name!='allNetStims') { //remove 'allCells' if selecting pops or individuals
        clone['groups'].splice( clone['groups'].indexOf('allCells'), 1 );
      } 
    }
    this.setState({include: clone})
  }
  
  handleSubItemClick = (group, name, item) => {
    var clone = Object.assign({}, this.state.include)
    if (group=='gids') {
      clone[group].indexOf(item)==-1?clone[group].push(item):clone[group].splice( clone[group].indexOf(item), 1 );
    }
    else if (group=='popids') {
      if (name in clone[group]) {
        clone[group][name].indexOf(item)==-1?clone[group][name].push(item):clone[group][name].splice( clone[group][name].indexOf(item), 1 );
      }
      else {
        clone[group][name] = [item]
      }
      if (clone['groups'].indexOf(name)>-1) { // when selecting individuals, remove population selection
        clone['groups'].splice( clone['groups'].indexOf(name), 1 )
      }
    }
    else {
    }
    clone['exclusive'] = false
    if (clone['groups'].indexOf('allCells')>-1 && name!='allNetStims') {
      clone['groups'].splice( clone['groups'].indexOf('allCells'), 1 );
    }
    this.setState({include: clone})
  }
  
  subMenuItemChecked = (group, name, index) => {
    if (group=='gids') {
      return this.state.include[group].indexOf(index)>-1?true:false
    }
    else if (group=='popids'){
      if (name in this.state.include[group]) {
        return this.state.include[group][name].indexOf(index)>-1?true:false
      }
      else {
        return false
      }
    }
  }
  
  otherMenues = () => {
    var menuItems = []
    for (var key in this.state.data) {
      if (key!='gids'){
        menuItems.push(this.variableMenues(key, this.state.data[key]))
      }
    }
    return menuItems
  }
  
  render() {
    return  <div>
      <NetPyNEField id={this.props.id}>
        <TextField
          floatingLabelText="Include in the plot"
          value={this.state.label}
          onClick={(e)=>this.handleMainPopoverOpen(true, e.preventDefault(), e.currentTarget)} 
        />
      </NetPyNEField >
      <Popover 
        open={this.state.mainPopoverOpen}
        anchorEl={this.state.anchorEl}
        onRequestClose={(e)=>this.handleMainPopoverOpen(false)}
        anchorOrigin={{"horizontal":"left","vertical":"bottom"}}
        targetOrigin={{"horizontal":"left","vertical":"top"}}
      >
        {this.defaultMenues()}
        <Divider/>
        {this.variableMenues('gids', this.state.data?this.state.data.gids:0, true)}
        <Divider/>
        {this.otherMenues()}
      </Popover>
    </div>
  };
};
