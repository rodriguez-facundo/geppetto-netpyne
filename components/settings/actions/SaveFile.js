import React from 'react';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import {List, ListItem} from 'material-ui/List';
import Utils from '../../../Utils';
import ActionDialog from './ActionDialog';

const saveOptions = [
  {label: 'High-level Network Parameters (netParams)', label2: 'Cell rules, connectivity rules, etc', state: 'loadNetParams'},
  {label: 'Simulation Configuration (simConfig)', label2: 'duration, recorded variables, etc', state: 'loadSimCfg'},
  {label: 'Instantiated Network', label2: 'All cells, connections, etc', state: 'loadNet'},
  {label: 'Simulation Data', label2: 'Spikes, traces, etc', state: 'loadSimData'}
]

export default class SaveFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fileName: 'output',
            netParams: true,
            simConfig: true,
            simData: true,
            netCells: true
        }
        
    }

    componentDidMount () {
        Utils.evalPythonMessage('netpyne_geppetto.doIhaveInstOrSimData', [])
            .then(response => {
                this.setState({disableNetCells: !response['haveInstance'], disableSimData: !response['haveSimData'], netCells:response['haveInstance'], simData: response['haveSimData']})
            }
        )
    }

    render() {
        return (
            <ActionDialog
                command ={'netpyne_geppetto.exportModel'}
                message = {GEPPETTO.Resources.EXPORTING_MODEL}
                buttonLabel={'Save'}
                title={'Save as JSON file'}
                args={this.state}
                {...this.props}
              >
                <TextField 
                  className="netpyneField" 
                  value={this.state.fileName} 
                  floatingLabelText="File name" 
                  onChange={(event) => this.setState({ fileName: event.target.value })} 
                />
                <List >
                  {saveOptions.map((saveOption, index) => {return<ListItem  style={{height: 50, width:'49%', float:index%2==0?'left':'right', marginTop: index > 1 ? "20px" : "-10px"}}
                    key={index}
                    leftCheckbox= {<Checkbox disabled={index==2?this.state.disableNetCells:index==3?this.state.disableNetCells:false} onCheck={() => this.setState(({[saveOption.state]: oldState, ...others}) => {return {[saveOption.state]: !oldState}})} checked={this.state[saveOption.state]}/>}
                    primaryText={saveOption.label}
                    secondaryText={saveOption.label2}
                  />})}
                </List>
            </ActionDialog>
        )
    }
}