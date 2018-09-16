import React from 'react';
import Dialog from 'material-ui/Dialog';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import {pink400} from 'material-ui/styles/colors';
import {CSSTransition} from 'react-transition-group';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Utils from '../../Utils';

export default class NewTransition extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            openDialog: false,
            haveInstData: false,
            parallelSimulation: false,
            instantiateButtonHovered: false,
            simulateButtonHovered: false
        };
    }

    componentDidUpdate (prevProps, prevState) {
        if (this.props.clickOnTab!=prevProps.clickOnTab) {
            if (this.props.tab!=prevProps.tab && this.props.tab=='simulate') {
                if (!this.state.haveInstData) {
                    Utils.sendPythonMessage('netpyne_geppetto.doIhaveInstOrSimData', [])
                        .then(response => {if (response.constructor.name=='Array') this.instantiate({usePrevInst: this.props.fastForwardInstantiation?false:response[0]})}) 
                }
                else {
                    if (this.props.fastForwardSimulation) {
                        this.simulate({ffs: true})
                    }
                    else if (this.props.fastForwardInstantiation) {
                        this.instantiate({usePrevInst: false})    
                    }
                    else {
                        this.instantiate({usePrevInst: true})
                    }
                }
            }
        }
    }

    instantiate = (args) => {
        GEPPETTO.CommandController.log("The NetPyNE model is getting instantiated...");
        GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, GEPPETTO.Resources.INSTANTIATING_MODEL);
        Utils.sendPythonMessage('netpyne_geppetto.instantiateNetPyNEModelInGeppetto', [args])
            .then(response => {
                var parsedResponse = JSON.parse(response);
                if (!this.processError(parsedResponse)) {
                    if (!args.usePrevInst) this.props.handleDeactivateInstanceUpdate(true)
                    GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, GEPPETTO.Resources.PARSING_MODEL); //keep this sequence has it is
                    this.setState({haveInstData: true})
                    GEPPETTO.Manager.loadModel(parsedResponse);
                    GEPPETTO.CommandController.log("The NetPyNE model instantiation was completed");
                    GEPPETTO.trigger(GEPPETTO.Events.Hide_spinner);
                }
        });
    }

    simulate = (args) => {
        this.setState({openDialog: false})
        GEPPETTO.CommandController.log("The NetPyNE model is getting simulated...");
        GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, GEPPETTO.Resources.RUNNING_SIMULATION);
        Utils.sendPythonMessage('netpyne_geppetto.simulateNetPyNEModelInGeppetto ', [{usePrevInst: args.ffs?false:this.props.freezeInstance, parallelSimulation: this.state.parallelSimulation, cores:this.state.cores}])
            .then(response => {
                var parsedResponse = JSON.parse(response)
                if (!this.processError(parsedResponse)) {
                    this.props.handleDeactivateSimulationUpdate(true)
                    if (!this.props.freezeInstance) this.props.handleDeactivateInstanceUpdate(true)
                    GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, GEPPETTO.Resources.PARSING_MODEL);
                    GEPPETTO.Manager.loadModel(parsedResponse);
                    GEPPETTO.CommandController.log("The NetPyNE model simulation was completed");
                    GEPPETTO.trigger(GEPPETTO.Events.Hide_spinner);
            }
        });    
    }

    processError(parsedResponse) {
        if (parsedResponse.hasOwnProperty("type") && parsedResponse['type'] == 'ERROR') {
            GEPPETTO.trigger(GEPPETTO.Events.Hide_spinner);
            this.setState({ openDialog: true, errorMessage: parsedResponse['message'], errorDetails: parsedResponse['details'] })
            return true;
        }
        return false;
    }

    cancelTransition = () => {
        this.closeTransition();
        if (this.props.cancelTransition) {
            this.props.cancelTransition();
        }
    }
    
    closeTransition = () => {
        this.setState({ openDialog: false });
    }
    
    render () {
        var children = this.state.errorDetails
        var title = this.state.errorMessage?this.state.errorMessage:"NetPyNE";
        
        if (this.state.openDialog) {
            if (this.state.errorMessage==undefined) {
                children = (
                    <div>
                        <div>"We are about to instantiate and simulate your network, this could take some time."</div>
                        <Checkbox label="Run parallel simulation" checked={this.state.parallelSimulation} onCheck={() => this.setState((oldState) => {return {parallelSimulation: !oldState.parallelSimulation}})} style={{ marginTop: '35px' }} id="runParallelSimulation" />
                        <TextField floatingLabelText="Number of cores" onChange={(event) => this.setState({ cores: event.target.value })} className="netpyneRightField"  type="number"/>
                    </div>
                )
                var actions = [<FlatButton label="CANCEL" onClick={()=>{this.cancelTransition()}} primary={true} key={"cancelActionBtn"} />, <FlatButton label="Simulate" onClick={()=>this.simulate({ffs:false})} id={"okRunSimulation"} primary={true} keyboardFocused={true} key={"runSimulationButton"} />];
            }
            else var actions = <FlatButton label="CANCEL" onClick={()=>{this.cancelTransition()}} key={"cancelActionBtn"} primary={true} />
        }

        if (this.props.tab=='simulate' && this.state.haveInstData) {
            if (!this.props.freezeInstance) {
                var refreshInstanceButton = (
                    <div style={{position: 'absolute', right: 23, top: 52, width: 56}}>
                        <div style={{clear: 'both'}}>
                            <FloatingActionButton 
                                backgroundColor="#ffffff" 
                                iconStyle={{color:pink400}} 
                                iconClassName="fa fa-refresh" 
                                key={"refreshInstanceButton"} 
                                onClick={()=>this.instantiate({usePrevInst: false})} 
                                onMouseEnter={()=> this.setState({instantiateButtonHovered: true})} 
                                onMouseLeave={()=> this.setState({instantiateButtonHovered: false})} 
                            />
                            {this.state.instantiateButtonHovered?<div>
                                <CSSTransition in={this.state.instantiateButtonHovered} appear={this.state.instantiateButtonHovered} timeout={500} classNames="fade">
                                    <h6 style={{textAlign: 'center', marginTop: 4}}>Instantiate</h6>
                                </CSSTransition>
                            </div>:null}
                        </div>
                    </div>   
                )
            } else var refreshInstanceButton = <div></div>
            if (!this.props.freezeSimulation) {
                var refreshSimulationButton = (
                    <div style={{position: 'absolute', right: 23, top: this.props.freezeInstance?52:138}}>
                        <div style={{clear: 'both', verticalAlign: 'middle'}}>
                            <FloatingActionButton 
                                backgroundColor="#ffffff" 
                                iconStyle={{color:pink400}}
                                iconClassName="fa fa-refresh" 
                                key={"refreshSimulationButton"}
                                style={{verticalAlign: 'middle'}}
                                onClick={()=>this.setState({openDialog: true})} 
                                onMouseEnter={()=> this.setState({simulateButtonHovered: true})} 
                                onMouseLeave={()=> this.setState({simulateButtonHovered: false})} 
                            />
                            {this.state.simulateButtonHovered?<div style={{verticalAlign: 'middle'}}>
                                <CSSTransition in={this.state.simulateButtonHovered} appear={this.state.simulateButtonHovered} timeout={500} classNames="fade">
                                    <h6 style={{textAlign: 'center', marginTop: 4}}> Simulate</h6>
                                </CSSTransition>
                            </div>:null}
                        </div>
                    </div>    
                )
            } else var refreshSimulationButton = <div></div>    
        }
        
        return (
            <div>
                {refreshInstanceButton}
                {refreshSimulationButton}
                <Dialog
                    title={title}
                    actions={actions}
                    modal={true}
                    open={this.state.openDialog}
                    onRequestClose={this.closeTransition}
                    bodyStyle={{ overflow: 'auto' }}
                    style={{ whiteSpace: "pre-wrap" }}
                >
                    {children}
                </Dialog>
            </div>
        )
    }
}