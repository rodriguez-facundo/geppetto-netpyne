import React from 'react';
import SvgIcon from 'material-ui/SvgIcon';
import FontIcon from 'material-ui/FontIcon';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import Divider from 'material-ui/Divider';
import NetPyNElogo from '../../components/general/NetPyNe_logo.png'
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import LoadFile from './actions/LoadFile';
import SaveFile from './actions/SaveFile';
import DeleteWork from './actions/DeleteWork';
import ImportExportHLS from './actions/ImportExportHLS';
import ImportExportSonata from './actions/ImportExportSonata';
import ImportExportNeuroML from './actions/ImportExportNeuroML';


const ExportIcon = (props) => (<SvgIcon {...props}><svg viewBox='0 0 750 750'><path d='M384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1zM192 336v-32c0-8.84 7.16-16 16-16h176V160H248c-13.2 0-24-10.8-24-24V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V352H208c-8.84 0-16-7.16-16-16zm379.05-28.02l-95.7-96.43c-10.06-10.14-27.36-3.01-27.36 11.27V288H384v64h63.99v65.18c0 14.28 17.29 21.41 27.36 11.27l95.7-96.42c6.6-6.66 6.6-17.4 0-24.05z'></path></svg></SvgIcon>);
const ImportIcon = (props) => (<SvgIcon {...props}><svg viewBox='0 0 750 750'><path d='M16 288c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h112v-64H16zm336-152V0H152c-13.3 0-24 10.7-24 24v264h127.99v-65.18c0-14.28 17.29-21.41 27.36-11.27l95.7 96.43c6.6 6.65 6.6 17.39 0 24.04l-95.7 96.42c-10.06 10.14-27.36 3.01-27.36-11.27V352H128v136c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H376c-13.2 0-24-10.8-24-24zm153-31L407.1 7c-4.5-4.5-10.6-7-17-7H384v128h128v-6.1c0-6.3-2.5-12.4-7-16.9z'></path></svg></SvgIcon>);


export default class NetPyNEToolBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openDialogBox: false,
            open: false,
            action: null
        }
    }

    handleMenuItemClick = (action) => {
        this.setState({action:action, openDialogBox:true, open: false})   
    }

    render() {

        if (this.state.openDialogBox){
            switch(this.state.action){
                case 'Load':
                    var content = <LoadFile
                        open={this.state.openDialogBox}
                        onRequestClose={() => this.setState({ openDialogBox: false })}
                        changeTab={this.props.changeTab}
                    />
                    break;
                case 'Save':
                    var content = <SaveFile
                        open={this.state.openDialogBox}    
                        onRequestClose={() => this.setState({ openDialogBox: false })}
                        changeTab={this.props.changeTab}
                        />
                    break;
                case 'ImportHLS':
                    var content = <ImportExportHLS 
                        open={this.state.openDialogBox}
                        onRequestClose={() => this.setState({ openDialogBox: false })}
                        changeTab={this.props.changeTab}
                        mode ={"IMPORT"}/>
                    break;
                case 'ImportHLSNML':
                    var content = <ImportExportNeuroML 
                        open={this.state.openDialogBox}
                        onRequestClose={() => this.setState({ openDialogBox: false })}
                        changeTab={this.props.changeTab}
                        mode ={"IMPORT"}/>
                    break;
                case 'ImportHLSSonata':
                    var content = <ImportExportSonata 
                        open={this.state.openDialogBox}
                        onRequestClose={() => this.setState({ openDialogBox: false })}
                        changeTab={this.props.changeTab}
                        mode ={"IMPORT"}/>
                    break;
                case 'ExportHLS':
                    var content = <ImportExportHLS 
                        open={this.state.openDialogBox}
                        onRequestClose={() => this.setState({ openDialogBox: false })}
                        changeTab={this.props.changeTab}
                        mode ={"EXPORT"}/>
                    break;
                case 'ExportHLSNML':
                    var content = <ImportExportNeuroML
                        open={this.state.openDialogBox}
                        onRequestClose={() => this.setState({ openDialogBox: false })}
                        changeTab={this.props.changeTab}
                        mode ={"EXPORT"}/>
                    break;
                case 'ExportSonata':
                    var content = <ImportExportSonata
                        open={this.state.openDialogBox}
                        onRequestClose={() => this.setState({ openDialogBox: false })}
                        changeTab={this.props.changeTab}
                        mode ={"EXPORT"}/>
                    break;
                case 'Remove':
                    var content = <DeleteWork
                        open={this.state.openDialogBox}
                        onRequestClose={() => this.setState({ openDialogBox: false })}
                        changeTab={this.props.changeTab}
                    />
                    break;
            }
            
        }
        
      
        return <div>
            <IconButton
                tooltip={'File options'}
                style={{ width: 40, height: 40, borderRadius: 25, overflow: 'hidden' }}
                iconStyle={{ color: '#ffffff', marginTop: -4, marginLeft: -4 }}
                hoveredStyle={{ backgroundColor: '#26C6DA' }}
                onClick={() => this.setState({ open: !this.state.open })}
            >
                <NavigationMenu />
            </IconButton>
            <Drawer
                docked={false}
                width={265}
                open={this.state.open}
                onRequestChange={(open) => this.setState({ open })}
            >
                <img style={{ marginLeft: 25, marginTop: 5, marginBottom: 8, width: 205 }} src={NetPyNElogo} />
                <Divider />
                <MenuItem primaryText="Open..." onClick={() => this.handleMenuItemClick('Load')} leftIcon={<FontIcon className='fa fa-folder-open-o' />} />
                <MenuItem primaryText="Save..." onClick={() => this.handleMenuItemClick('Save')} leftIcon={<FontIcon className='fa fa-download' />} />
                <MenuItem
                    primaryText="Import Model"
                    rightIcon={<ArrowDropRight />}
                    leftIcon={<ImportIcon />}
                    menuItems={[
                        <MenuItem onClick={() => this.handleMenuItemClick('ImportHLS')} primaryText="High Level Specifications" />,
                        <MenuItem onClick={() => this.handleMenuItemClick('ImportHLSNML')} primaryText="from NeuroML" />,
                        <MenuItem onClick={() => this.handleMenuItemClick('ImportHLSSonata')} primaryText="from Sonata" />,
                    ]}
                />
                <MenuItem
                    primaryText="Export Model"
                    rightIcon={<ArrowDropRight />}
                    leftIcon={<ExportIcon />}
                    menuItems={[
                        <MenuItem onClick={() => this.handleMenuItemClick('ExportHLS')} primaryText="High Level Specifications" />,
                        <MenuItem onClick={() => this.handleMenuItemClick('ExportHLSNML')} primaryText="to NeuroML" />,
                        <MenuItem onClick={() => this.handleMenuItemClick('ExportSonata')} primaryText="to Sonata" />,
                    ]}
                />
                <MenuItem onClick={() => this.handleMenuItemClick('Remove')} leftIcon={<FontIcon className='fa fa-trash-o' />} primaryText="Remove current project" />
            </Drawer>
            
            {content}
                
        </div>
    }
}