define(function (require) {
    return function (GEPPETTO) {
        var ReactDOM = require('react-dom');
        var React = require('react');
        var MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
        var NetPyNETabs = require('./NetPyNETabs').default;
        var injectTapEventPlugin = require('react-tap-event-plugin');

        var Utils = require('./Utils').default;
        var Console = require('../../js/components/interface/console/Console');
        var TabbedDrawer = require('../../js/components/interface/drawer/TabbedDrawer');
        var PythonConsole = require('../../js/components/interface/pythonConsole/PythonConsole');
        GEPPETTO.GeppettoJupyterModelSync = require('./../../js/communication/geppettoJupyter/GeppettoJupyterModelSync');
        GEPPETTO.GeppettoJupyterGUISync = require('./../../js/communication/geppettoJupyter/GeppettoJupyterGUISync');
        GEPPETTO.GeppettoJupyterWidgetSync = require('./../../js/communication/geppettoJupyter/GeppettoJupyterWidgetSync');
        require('./css/netpyne.less');
        require('./css/material.less');

        injectTapEventPlugin();

        function App() {
            return (
                <div>
                    <MuiThemeProvider>
                        <NetPyNETabs></NetPyNETabs>
                    </MuiThemeProvider>

                    <div id="footer">
                        <div id="footerHeader">
                            <TabbedDrawer labels={["Console", "Python"]} iconClass={["fa fa-terminal", "fa fa-flask"]} >
                                <Console />
                                <PythonConsole pythonNotebookPath={"http://" + window.location.hostname + ":" + window.location.port + "/notebooks/notebook.ipynb"} />
                            </TabbedDrawer>
                        </div>
                    </div>
                </div>
            );
        }
        ReactDOM.render(<App />, document.querySelector('#mainContainer'));

        GEPPETTO.G.setIdleTimeOut(-1);
        GEPPETTO.G.debug(true); //Change this to true to see messages on the Geppetto console while loading
        GEPPETTO.Resources.COLORS.DEFAULT = "#008ea0";
        GEPPETTO.trigger(GEPPETTO.Events.Show_spinner, "Initialising NetPyNE");

        window.customJupyterModelLoad = function (module, model) {
            window.IPython.notebook.restart_kernel({ confirm: false }).then(function () {
                //initialize the Geppetto Python connector
                Utils.execPythonCommand('from netpyne_ui import geppetto_init');
                //initialize NetPyNE-UI
                Utils.execPythonCommand('from netpyne_ui.netpyneui_init import netpyne_geppetto');
                //import the GUI sync to use the Python Controlled Capabilities
                Utils.execPythonCommand('from jupyter_geppetto.geppetto_comm import GeppettoJupyterGUISync');
            });
        }


    };
});
