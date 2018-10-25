define(function (require) {
    return function (GEPPETTO) {
        var ReactDOM = require('react-dom');
        var React = require('react');
        var MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default;
        var NetPyNE = require('./NetPyNE').default;
        var injectTapEventPlugin = require('react-tap-event-plugin');

        var Utils = require('./Utils').default;
        var Console = require('../../js/components/interface/console/Console');
        var TabbedDrawer = require('../../js/components/interface/drawer/TabbedDrawer');
        var PythonConsole = require('../../js/components/interface/pythonConsole/PythonConsole');
        
        require('./css/netpyne.less');
        require('./css/material.less');

        injectTapEventPlugin();

        function App(data = {}) {
            return (
                <div>
                    <MuiThemeProvider>
                        <NetPyNE {...data}></NetPyNE>
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


        GEPPETTO.on('jupyter_geppetto_extension_ready',  (data) => {
            Utils.execPythonMessage('from netpyne_ui.netpyne_geppetto import netpyne_geppetto');
            Utils.evalPythonMessage('netpyne_geppetto.getData',[]).then((response) => {
                var data = Utils.convertToJSON(response)
                ReactDOM.render(<App data={data} />, document.querySelector('#mainContainer'));
                GEPPETTO.trigger("spinner:hide");
            })
        });
    };
});
