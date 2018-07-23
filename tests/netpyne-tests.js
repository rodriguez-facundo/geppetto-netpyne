var urlBase = casper.cli.get('host');
if (urlBase == null || urlBase == undefined) {
  urlBase = "http://localhost:8888/";
}

casper.test.begin('NetPyNE projects tests', function suite(test) {
  casper.options.viewportSize = {
    width: 1340,
    height: 768
  };

  casper.on("page.error", function(msg, trace) {
    this.echo("Error: " + msg, "ERROR");
  });

  // show page level errors
  casper.on('resource.received', function(resource) {
    var status = resource.status;
    if (status >= 400) {
      this.echo('URL: ' + resource.url + ' Status: ' + resource.status);
    }
  });

  //load netpyne main landing page
  casper.start(urlBase + "geppetto", function() {
    this.echo("Load : " + urlBase);
    //wait for the loading spinner to go away, meaning netpyne has loaded
    this.waitWhileVisible('div[id="loading-spinner"]', function() {
      this.wait(5000, function() { //test some expected HTML elements in landing page
        this.echo("I've waited for netpyne to load.");
        test.assertTitle("NetPyNE", "NetPyNE title is ok");
        test.assertExists('div[id="widgetContainer"]', "NetPyNE loads the initial widgetsContainer");
        test.assertExists('div[id="mainContainer"]', "NetPyNE loads the initial mainContainer");
        //test.assertExists('div[id="settingsIcon"]', "NetPyNE loads the initial settingsIcon");
      });
    }, null, 40000);
  });

  casper.then(function() { //test HTML elements in landing page
    casper.echo("######## Testing landping page contents and layout ######## ");
    testLandingPage(test);
  });

  casper.then(function() { //test initial state of consoles
    casper.echo("######## Test Consoles ######## ");
    testConsoles(test);
  });

  casper.then(function() { // test adding a population using UI
    casper.echo("######## Test Add Population ######## ");
    addPopulation(test);
  });

  casper.then(function() { // test adding a cell rule using UI
    casper.echo("######## Test Add Cell Rule ######## ");
    addCellRule(test);
  });

  casper.then(function() { // test adding a population using UI
    casper.echo("######## Test Add Synapse ######## ");
    addSynapse(test);
  });

  casper.then(function() { // test adding a connection using UI
    casper.echo("######## Test Add Connection Rule ######## ");
    addConnection(test);
  });

  casper.then(function() { // test adding a stimulus target using UI
    casper.echo("######## Test Add stimTarget Rule ######## ");
    addStimTarget(test);
  });


  casper.then(function() { //test full netpyne loop using a demo project
    casper.echo("######## Running Demo ######## ");
    var demo = "from netpyne_ui.tests.tut3 import netParams, simConfig \n" +
      "netpyne_geppetto.netParams=netParams \n" +
      "netpyne_geppetto.simConfig=simConfig";
    loadModelUsingPython(test, demo);
  });

  casper.then(function() { //test explore network tab functionality
    casper.echo("######## Test Explore Network Functionality ######## ");
    exploreNetwork(test);
  });

  casper.then(function() { //test simulate network tab functionality
    casper.echo("######## Test Simulate Network Functionality ######## ");
    simulateNetwork(test);
  });

  casper.run(function() {
    test.done();
  });
});

/**
 * Test existence of HTML elements expected when main landing page is reached
 */
function testLandingPage(test) {
  casper.then(function() {
    test.assertExists('div[id="Populations"]', 'Populations button exists.');
    test.assertExists('div[id="CellRules"]', "Cell rules button exists.");
    test.assertExists('div[id="Synapses"]', "Synapses button exists.");
    test.assertExists('div[id="Connections"]', "Connections button exists.");
    test.assertExists('div[id="SimulationSources"]', "Connections button exists.");
    test.assertExists('div[id="Configuration"]', "Configuration button exists.");
    test.assertExists('button[id="defineNetwork"]', 'Define network button exists.');
    test.assertExists('button[id="exploreNetwork"]', 'Explore network button exists.');
    test.assertExists('button[id="simulateNetwork"]', 'Simulate network button exists.');
  });
}

/**
 * Load consoles and test they toggle
 */
function testConsoles(test) {
  casper.then(function() { //test existence and toggling of python console
    loadConsole(test, 'pythonConsoleButton', "pythonConsole");
  });
  casper.then(function() { //test existence and toggling of console
    loadConsole(test, 'consoleButton', "console");
  });
}

/**
 * Load console, and test it hides/shows fine
 */
function loadConsole(test, consoleButton, consoleContainer) {
  casper.then(function() {
    casper.click('#' + consoleButton);
    casper.waitUntilVisible('div[id="' + consoleContainer + '"]', function() {
      this.echo(consoleContainer + ' loaded.');
      test.assertExists('div[id="' + consoleContainer + '"]', consoleContainer + " exists");
      casper.click('#consoleButton');
      casper.waitWhileVisible('div[id="' + consoleContainer + '"]', function() {
        this.echo(consoleContainer + ' hidden.');
        test.assertNotVisible('div[id="' + consoleContainer + '"]', consoleContainer + " no longer visible");
      }, 5000);
    }, 5000);
  });
}

/**
 * Adds a population using the add population button 
 * and goes field by field checking everithing exist
 */
function addPopulation(test) {
  casper.click('#Populations'); //open Pop Card

  casper.then(function() { // check add pop button exist 
    casper.waitUntilVisible('button[id="newPopulationButton"]', function() {
      test.assertExist("#newPopulationButton", "add population button exists")
    });
  })
  
  casper.thenClick("#newPopulationButton", function() { //add new population
    test.assertExists("#Population", "Pop thumbnail Exists");
    casper.wait(1000, function() {
      this.echo("waited for metadata")
    });
  })

  casper.then(function() { // check all fields exist
    test.assertExists("#populationName", "Pop name Exists");
    test.assertExists("#popCellModel", "Pop cellModel Exists");
    test.assertExists("#popCellType", "Pop cellType Exists");
    test.assertExists("#popParamsDimensionsSelect", "Pop dimensions selectField Exists");
  })
  casper.then(function() { //check MenuItems for Dimension exist
    click("#popParamsDimensionsSelect");
    casper.waitForSelector("#popParamSgridSpacing", function() {
      test.assertExist("#popParamSnumCells", "Pop numCells menuItem Exist");
      test.assertExist("#popParamSdensity", "Pop density menuItem Exist");
      test.assertExist("#popParamSgridSpacing", "Pop gridSpacing menuItem Exist");
    });
  })
  casper.thenClick("#popParamSnumCells", function() { //check 1st menuItem shows field
    test.assertExist("#popParamsDimensions", "Pop numCells field Exist");
  })
  casper.then(function() { //click SelectField again
    click("#popParamsDimensionsSelect")
  })
  casper.thenClick("#popParamSdensity", function() { //check 2st menuItem shows field
    test.assertExist("#popParamsDimensions", "Pop density field Exist");
  })
  casper.then(function() { //click SelectField again
    click("#popParamsDimensionsSelect")
  })
  casper.thenClick("#popParamSdensity", function() { //check 3st menuItem shows field
    test.assertExist("#popParamSgridSpacing", "Pop gridSpacing field Exist");
  })

  casper.thenClick('#spatialDistPopTab', function() { //go to second tab in population
    casper.waitForSelector("#xRangePopSelect", function() {
      this.echo("--------testing range component in popParams--------")
    })
  })

  casper.then(function() { // test rangeComponent
    exploreRangeComponent(test, "#xRangePopSelect", "#xRangePopAbsoluteMenuItem", "x");
    exploreRangeComponent(test, "#yRangePopSelect", "#yRangePopAbsoluteMenuItem", "y");
    exploreRangeComponent(test, "#zRangePopSelect", "#zRangePopAbsoluteMenuItem", "z");
    exploreRangeComponent(test, "#xRangePopSelect", "#xRangePopNormalizedMenuItem", "x");
    exploreRangeComponent(test, "#yRangePopSelect", "#yRangePopNormalizedMenuItem", "y");
    exploreRangeComponent(test, "#zRangePopSelect", "#zRangePopNormalizedMenuItem", "z");
  });

  casper.then(function() { //back to General tab
    casper.click('#generalPopTab');
    casper.waitForSelector("#populationName", function() {
      test.assertExists("#populationName", "Came back to general tab");
      this.echo("------------------------------------------------------")
    })
  });

  casper.thenClick('#newPopulationButton', function() {
    casper.waitUntilVisible('button[id="Population2"]', function() {
      test.assertExist("#Population2", "Population2 thumbnail added");
    });
  })
  casper.then(function() {
    delThumbnail("#Population")
    casper.waitWhileVisible('button[id="Population"]', function() {
      test.assertDoesntExist('button[id="#Population"]', "Population deletion");
    })
  })

  casper.then(function() {
    delThumbnail("#Population2")
    casper.waitWhileVisible('button[id="Population2"]', function() {
      test.assertDoesntExist('button[id="#Population2"]', "Population2 deletion");
    })
  })

  casper.thenClick("#Populations", function() {
    casper.waitWhileVisible('button[id="newPopulationButton"]', function() {
      test.assertDoesntExist('button[id="newPopulationButton"]', "Populations view collapsed");
    }, 5000);
  });
}

/**
 * Adds a cell rule using the add cell rule button
 */
function addCellRule(test) {
  casper.click('#CellRules', function() { // expand card
    casper.waitUntilVisible('button[id="newCellRuleButton"]', function() {
      test.assertExist("#newCellRuleButton", "Add cellRule button exist")
    });
  })
  casper.thenClick("#newCellRuleButton", function() { //click add cellRule
    casper.waitUntilVisible('button[id="CellRule"]', function() {
      test.assertExist("#CellRule", "New cellRule thumbnail exist")
    })
  })
  casper.then(function() { // check fields exist
    casper.waitForSelector("#cellRuleName", function() {
      test.assertExist("#cellRuleName", "cellRule Name field Exist");
      test.assertExist("#cellParamsCondsCellModel", "cellRule cellModel selectField Exist");
      test.assertExist("#cellParamsCondsCellType", "cellRule cellType selectField Exist");
      test.assertExist("#cellParamsCondsPop", "cellRule pop selectField Exist");
    })
  })
  casper.then(function() { // explore spatial distribution tab
    casper.wait(500, function() {
      this.echo("--------testing range component in cellParams--------");
    });
    casper.then(function() {
      exploreRangeComponent(test, "#xRangeRuleSelect", "#xRangeRuleAbsoluteMenuItem", "x");
      exploreRangeComponent(test, "#yRangeRuleSelect", "#yRangeRuleAbsoluteMenuItem", "y");
      exploreRangeComponent(test, "#zRangeRuleSelect", "#zRangeRuleAbsoluteMenuItem", "z");
      exploreRangeComponent(test, "#xRangeRuleSelect", "#xRangeRuleNormalizedMenuItem", "x");
      exploreRangeComponent(test, "#yRangeRuleSelect", "#yRangeRuleNormalizedMenuItem", "y");
      exploreRangeComponent(test, "#zRangeRuleSelect", "#zRangeRuleNormalizedMenuItem", "z");
    });
  });
  casper.then(function() {
    this.echo("------------------------------------------------------")
  });
  casper.thenClick("#cellParamsGoSectionButton", function() { //go to sections
    //wait(500)
    casper.waitUntilVisible('button[id="newCellRuleSectionButton"]', function() {
      test.assertExist("#newCellRuleSectionButton", "Go to -section- button exists.");
    })
  })

  casper.thenClick('#newCellRuleSectionButton', function() { //add new section and check name
    casper.waitForSelector("#cellParamsSectionName", function() {
      test.assertExist("#cellParamsSectionName", "Section Name field Exist");
    })
  });

  casper.thenClick("#sectionGeomTab", function() { //go to geom tab and chec fields
    casper.waitForSelector("#sectionDiam", function() {
      test.assertExist("#sectionDiam", "section Diam field Exist");
      test.assertExist("#sectionL", "section L field Exist");
      test.assertExist("#sectionCm", "section Ra field Exist");
      test.assertExist("#sectionRa", "section Cm field Exist");
      //REVIEW test.assertExist("#sectionPt3d", "section Pt3d field Exist"); 
    });
  })

  casper.thenClick("#sectionTopoTab", function() { // go to Topo tab and check fields
    casper.waitForSelector("#sectionParentSec", function() {
      test.assertExist("#sectionParentSec", "section ParentSec field Exist");
      test.assertExist("#sectionParentX", "section ParentX field Exist");
      test.assertExist("#sectionChildX", "section ChildX field Exist");
    });
  })

  casper.thenClick("#sectionGeneralTab", function() { //Go to Mechs
    casper.waitUntilVisible('button[id="cellParamsGoMechsButton"]', function() {
      casper.click("#cellParamsGoMechsButton", function() {
        test.assertExist("#addNewMechButton", "Go to CellRule mechanisms");
      })
    })
  })

  casper.thenClick('#addNewMechButton', function() { // click SelectField and check MenuItems
    casper.waitForSelector("#pas", function() {
      test.assertExist("#pas", "mech pas MenuItem Exist");
      test.assertExist("#hh", "mech HH MenuItem Exist");
      test.assertExist("#fastpas", "mech fastPas MenuItem Exist");
    })
  })

  casper.thenClick("#hh", function() { // add hh mech and check Fields
    test.assertExist("#hh", "HH mechanism was created");
    casper.waitForSelector("#singleMechName", function() {
      test.assertExist("#singleMechName", "HH Name field Exist");
      test.assertExist("#mechNamegnabar", "gnabar param Exist");
      test.assertExist("#mechNamegkbar", "gkbar param Exist");
      test.assertExist("#mechNamegl", "gl param Exist");
      test.assertExist("#mechNameel", "el param Exist");
    })
  })

  casper.thenClick('#addNewMechButton', function() { // add pas mech and check Fields
    casper.thenClick("#pas", function() {
      test.assertExist("#pas", "pas mechanism was created");
      casper.waitForSelector("#singleMechName", function() {
        test.assertExist("#singleMechName", "pas Name field Exist");
        test.assertExist("#mechNameg", "g param Exist");
        test.assertExist("#mechNamee", "e param Exist");
      })
    })
  });

  casper.thenClick('#addNewMechButton', function() { // add fastpas mech and check Fields
    casper.thenClick("#fastpas", function() {
      test.assertExist("#fastpas", "fastpas mech created");
      casper.waitForSelector("#singleMechName", function() {
        test.assertExist("#singleMechName", "fastPas Name field Exist");
        test.assertExist("#mechNameg", "g param Exist");
        test.assertExist("#mechNamee", "e param Exist");
      })
    })
  });

  casper.then(function() { // delete hh mech
    delThumbnail("#mechThumbhh")
    casper.then(function() {
      test.assertDoesntExist('button[id="#mechThumbhh"]', "HH deleted");
    })
  })

  casper.then(function() { // del pas mech
    delThumbnail("#mechThumbpas")
    casper.then(function() {
      test.assertDoesntExist('button[id="#mechThumbpas"]', "pas deleted");
    })
  })

  casper.then(function() { // del fastpas mech
    delThumbnail("#mechThumbfastpas")
    casper.then(function() {
      test.assertDoesntExist('button[id="#mechThumbfastpas"]', "fastPas deleted");
    })
  })

  casper.thenClick('#fromMech2SectionButton', function() { // come back to --secion--
    test.assertDoesntExist('button[id="#addNewMechButton"]', "Go back from Mechs to Sections");
    casper.wait(1000)
  });

  casper.thenClick('#newCellRuleSectionButton', function() { // create a second section
    casper.waitUntilVisible('button[id="sectionThumbSection2"]', function() {
      test.assertExist("#sectionThumbSection2", "New section created")
    })
    casper.wait(500)
  });

  casper.then(function() { //delete section1
    delThumbnail("#sectionThumbSection")
  })

  casper.then(function() { //delete second section and check non exist
    delThumbnail("#sectionThumbSection2")
    casper.then(function() {
      test.assertDoesntExist('button[id="#sectionThumbSection"]', "Section deletion");
      test.assertDoesntExist('button[id="#sectionThumbSection2"]', "Section2 deletion");
    })
  })

  casper.thenClick("#fromSection2CellRuleButton", function() { // go back to 
    //casper.wait(500)
    casper.waitWhileVisible('button[id="newCellRuleSectionButton"]', function() {
      test.assertDoesntExist("#newCellRuleSectionButton", "New section button does not exist")
    })
  })
  casper.then(function() {
    delThumbnail("#CellRule")
    casper.then(function() {
      test.assertDoesntExist('button[id="#CellRule"]', "Section deletion");
    })
  })

  casper.then(function() { //hide the cell rules view
    casper.click('#CellRules');
    casper.waitWhileVisible('button[id="newCellRuleButton"]', function() {
      test.assertDoesntExist('button[id="newCellRuleButton"]', "Cell Rules view collapsed");
    }, 1000);
  });
}
/**
 * Adds a synapse Rule using the add synapse button
 */
function addSynapse(test) {
  casper.then(function() { //expand synapse card
    casper.click('#Synapses', function() {
      casper.waitUntilVisible('button[id="newSynapseButton"]', function() {
        test.assertExist("#newSynapseButton", "Add synapse button exist");
      })
    });
  })
  casper.thenClick("#newSynapseButton", function() { //add new synaptic rule
    casper.waitUntilVisible('button[id="Synapse"]', function() {
      test.assertExist("#Synapse", "New Synapse rule added");
    })
  })
  casper.then(function() {
    casper.waitForSelector("#synapseModSelect", function() {
      test.assertExist("#synapseName", "synapse Name field Exist");
      test.assertExist("#synapseModSelect", "synapse mod selectField Exist");
    })
  })
  casper.then(function() { //check selectField has corretc MenuItems
    click("#synapseModSelect")
    casper.then(function() {
      casper.waitForSelector("#Exp2Syn", function() {
        test.assertExist("#ExpSyn", "ExpSyn mech MenuItem Exist");
        test.assertExist("#Exp2Syn", "Exp2Syn mech MenuItem Exist");
      })
    })
  })
  casper.thenClick("#Exp2Syn", function() { // select Exp2Syn mod and check correct params
    casper.waitForSelector("#synMechTau1", function() {
      test.assertExist("#synMechTau1", "Tau1 param Exist for Exp2Syn");
      test.assertExist("#synMechTau2", "Tau2 param Exist for Exp2Syn");
      test.assertExist("#synMechE", "E param Exist for Exp2Syn");
    })
  })
  casper.then(function() { //wait before continuing
    casper.wait(500)
  })
  casper.then(function() { //change to ExpSyn mod in SelectField
    click("#synapseModSelect")
    casper.then(function() {
      casper.wait(2000)
      casper.waitForSelector("#ExpSyn", function() {
        casper.click("#ExpSyn");
      })
    })
  })
  casper.then(function() { // check ExpSyn mod has correct params
    casper.waitWhileSelector("#synMechTau2", function() {
      test.assertExist("#synMechTau1", "Tau1 param exist for ExpSyn");
      test.assertExist("#synMechE", "E param exist for ExpSyn");
      test.assertDoesntExist("#synMechTau2", "Tau2 param doesnot exist for ExpSyn");
    })
  })
  casper.thenClick("#newSynapseButton", function() { //add new synaptic rule
    casper.waitUntilVisible('button[id="Synapse2"]', function() {
      test.assertExist("#Synapse2", "Synapse2 Thumbnail exist");
    })
  })
  casper.then(function() { //assert new Synapse rule does not displays params before selectiong a "mod"
    casper.waitForSelector("#synapseName", function() {
      test.assertExist("#synapseName", "synapse Name field Exist");
      test.assertExist("#synapseModSelect", "synapse mod selectField Exist");
      test.assertDoesntExist("#synMechTau1", "synapse2 Name field doesnt Exist");
      test.assertDoesntExist("#synMechTau2", "synapse2 Name field doesnt Exist");
      test.assertDoesntExist("#synMechE", "synapse2 Name field doesnt Exist");
    })
  })
  casper.then(function() { // delete synapse rule 1
    delThumbnail("#Synapse")
    casper.waitWhileVisible('button[id="Synapse"]', function() {
      test.assertDoesntExist("#Synapse", "Synapse deleted");
    })
  })
  casper.then(function() { //delete synapse rule 2
    delThumbnail("#Synapse2")
    casper.waitWhileVisible('button[id="Synapse2"]', function() {
      test.assertDoesntExist("#Synapse2", "Synapse2 deleted");
    })
  })
  casper.then(function() {
    this.echo("------------------------------------------------------")
  });
  casper.then(function() { // colapse card
    casper.click('#Synapses');
    casper.waitWhileVisible('button[id="newSynapseButton"]', function() {
      test.assertDoesntExist('button[id="newSynapseButton"]', "Synapse view collapsed");
    });
  });
}

/**
 * Adds a connectivity rule using the add conn button
 */
function addConnection(test) {
  casper.then(function() { //expand ConnParams view and add a new connectivityRule using the button
    casper.click('#Connections');
    casper.waitUntilVisible('button[id="newConnectivityRuleButton"]', function() {
      casper.click('#newConnectivityRuleButton');
    }, 1000)
  });
  casper.then(function() { // explore spatial distribution for preConn
    casper.waitUntilVisible('button[id="preCondsConnTab"]', function() {
      this.echo("--------testing range component in connParams.preConds--------");
      casper.click("#preCondsConnTab");
    })
    casper.then(function() {
      exploreRangeComponent(test, "#xRangePreConnSelect", "#xRangePreConnAbsoluteMenuItem", "x");
      exploreRangeComponent(test, "#yRangePreConnSelect", "#yRangePreConnAbsoluteMenuItem", "y");
      exploreRangeComponent(test, "#zRangePreConnSelect", "#zRangePreConnAbsoluteMenuItem", "z");
      exploreRangeComponent(test, "#xRangePreConnSelect", "#xRangePreConnNormalizedMenuItem", "x");
      exploreRangeComponent(test, "#yRangePreConnSelect", "#yRangePreConnNormalizedMenuItem", "y");
      exploreRangeComponent(test, "#zRangePreConnSelect", "#zRangePreConnNormalizedMenuItem", "z");
    });
  });
  casper.then(function() { // explore spatial distribution for postConn
    casper.waitUntilVisible('button[id="postCondsConnTab"]', function() {
      this.echo("--------testing range component in connParams.postConds--------");
      casper.click("#postCondsConnTab");
    })
    casper.then(function() {
      exploreRangeComponent(test, "#xRangePostConnSelect", "#xRangePostConnAbsoluteMenuItem", "x");
      exploreRangeComponent(test, "#yRangePostConnSelect", "#yRangePostConnAbsoluteMenuItem", "y");
      exploreRangeComponent(test, "#zRangePostConnSelect", "#zRangePostConnAbsoluteMenuItem", "z");
      exploreRangeComponent(test, "#xRangePostConnSelect", "#xRangePostConnNormalizedMenuItem", "x");
      exploreRangeComponent(test, "#yRangePostConnSelect", "#yRangePostConnNormalizedMenuItem", "y");
      exploreRangeComponent(test, "#zRangePostConnSelect", "#zRangePostConnNormalizedMenuItem", "z");
    });
  });
  casper.then(function() {
    this.echo("------------------------------------------------------")
  });
  casper.then(function() { //hide populations view
    casper.click('#Connections');
    casper.waitWhileVisible('button[id="newConnectivityRuleButton"]', function() {
      test.assertDoesntExist('button[id="newConnectivityRuleButton"]', "Connectivity view collapsed");
    }, 20000);
  })
}
/**
 * Adds a stimulus Target rule using the add stimTarget rule button
 */
function addStimTarget(test) {
  casper.then(function() { //expand ConnParams view and add a new connectivityRule using the button
    casper.click('#stimTargets');
    casper.waitUntilVisible('button[id="newStimulationTargetButton"]', function() {
      casper.click('#newStimulationTargetButton');
    }, 2000)
  });
  casper.then(function() { // explore spatial distribution for preConn
    casper.waitUntilVisible('button[id="stimTargetCondsTab"]', function() {
      this.echo("--------testing range component in stimTarget.conds--------");
      casper.click("#stimTargetCondsTab");
    })
    casper.then(function() {
      exploreRangeComponent(test, "#xRangeStimTargetSelect", "#xRangeStimTargetAbsoluteMenuItem", "x");
      exploreRangeComponent(test, "#yRangeStimTargetSelect", "#yRangeStimTargetAbsoluteMenuItem", "y");
      exploreRangeComponent(test, "#zRangeStimTargetSelect", "#zRangeStimTargetAbsoluteMenuItem", "z");
      exploreRangeComponent(test, "#xRangeStimTargetSelect", "#xRangeStimTargetNormalizedMenuItem", "x");
      exploreRangeComponent(test, "#yRangeStimTargetSelect", "#yRangeStimTargetNormalizedMenuItem", "y");
      exploreRangeComponent(test, "#zRangeStimTargetSelect", "#zRangeStimTargetNormalizedMenuItem", "z");
    });
  });
  casper.then(function() {
    this.echo("------------------------------------------------------")
  });
  casper.then(function() { //hide populations view
    casper.click('#stimTargets');
    casper.waitWhileVisible('button[id="newStimulationTargetButton"]', function() {
      test.assertDoesntExist('button[id="newStimulationTargetButton"]', "StimTarget view collapsed");
    }, 5000);
  })
}
/**
 * Tests adding a new population and its contents
 */
function testPopulation(test, buttonSelector, expectedName, expectedCellModel, expectedCellType, expectedDimensions) {
  casper.then(function() {
    this.echo("------Testing population button " + buttonSelector);
    casper.waitUntilVisible(buttonSelector, function() {
      test.assertExists(buttonSelector, "Population " + expectedName + " correctly created");
      casper.click('#' + expectedName);
      casper.then(function() { //give it time so metadata gets loaded
        casper.wait(2000, function() {
          this.echo("I've waited a second for metadata to be populated")
        });
      });
      this.echo('Population metadata loaded.');
      casper.then(function() { //test metadata contents
        testElementValue(test, "#populationName", expectedName);
        testElementValue(test, "#popCellModel", expectedCellModel);
        testElementValue(test, "#popCellType", expectedCellType);
        testElementValue(test, "#popParamsDimensions", expectedDimensions);
      });
    }, 5000);
  });
}

function delThumbnail(elementID) {
  casper.wait(300)
  casper.waitForSelector(elementID, function() {
    casper.mouse.doubleclick(elementID);
  })
  casper.then(function() {
    casper.wait(500)
  })
  casper.then(function() {
    casper.click(elementID)
  })
  casper.then(function() {
    casper.wait(500)
  })
  casper.waitUntilVisible('button[id="confirmDeletion"]', function() {
    casper.thenClick("#confirmDeletion")
  })
}

function click(elementID) {
  casper.evaluate(function(elementID) {
    document.getElementById(elementID).scrollIntoView();
  }, elementID.replace("#", ''));
  var info = casper.getElementInfo(elementID);
  casper.mouse.click(info.x + 1, info.y + 1);
}
/**
 * Explore SelectField, MenuItems and TextField inside RangeComponent
 */
function exploreRangeComponent(test, elementID, secondElementID, xyz) {
  casper.waitForSelector(elementID, function() {
    var absNorm = secondElementID.includes('Absolute') ? "Absolute" : "Normalized"
    test.assertExist(elementID, "SelectField in " + xyz + "-axis EXISTS");
    click(elementID)
    casper.wait(1000, function() {
      casper.waitForSelector(secondElementID, function() {
        test.assertExist(secondElementID, absNorm + " menu item in " + xyz + "-axis EXISTS");
        casper.click(secondElementID)
        casper.wait(500, function() {
          casper.waitForSelector(elementID.replace('Select', '') + "MinRange", function() {
            test.assertExist(elementID.replace('Select', '') + "MinRange", absNorm + " min in " + xyz + "-axis EXISTS");
            test.assertExist(elementID.replace('Select', '') + "MaxRange", absNorm + " max in " + xyz + "-axis EXISTS");
          });
        })
      });
    })
  });
};

/**
 * Test adding a new cell rule and its contents
 */
function testCellRule(test, buttonSelector, expectedName, expectedCellModelId, expectedCellTypeId) {
  casper.then(function() {
    this.echo("------Testing cell rules button " + buttonSelector);
    casper.waitUntilVisible(buttonSelector, function() {
      this.echo('Cell Rule button exists.');
      this.click('#' + expectedName);
      casper.then(function() { //give it some time to allow metadata to load
        casper.wait(500, function() {
          this.echo("I've waited a second for metadata to be populated")
        });
      });
      casper.then(function() { //test contents of metadata
        testElementValue(test, "#cellRuleName", expectedName);
        test.assertExists(expectedCellModelId, "cellRullCellModel exists");
        test.assertExists(expectedCellTypeId, "cellRullCellType exists");
      });
    }, 5000);
  });
}

function testElementValue(test, elementID, expectedName) {
  casper.then(function() {
    var name = casper.evaluate(function(elementID) {
      return $(elementID).val();
    }, elementID);
    test.assertEquals(name, expectedName, elementID + " field correctly populated");
  });
}

/**
 * Load demo model using python
 */
function loadModelUsingPython(test, demo) {
  casper.then(function() {
    this.echo("------Loading demo for further testing ");
    casper.evaluate(function(demo) {
      var kernel = IPython.notebook.kernel;
      kernel.execute(demo);
    }, demo);
  });

  casper.then(function() { //make populations view visible
    casper.click('#Populations');
    casper.waitUntilVisible('button[id="newPopulationButton"]', function() {
      this.echo("Population view loaded");
    }, 5000);
  });

  casper.then(function() { //test first population exists after demo is loaded
    testPopulation(test, "button#S", "S", "HH", "PYR", "20");
  });

  casper.then(function() { //test second population exists after demo is loaded
    testPopulation(test, "button#M", "M", "HH", "PYR", "20");
  });

  casper.then(function() { //expand cell rules view
    casper.click('#CellRules');
    casper.waitUntilVisible('button[id="newCellRuleButton"]', function() {
      this.echo("Cell Rule view loaded");
    }, 5000);
  });

  casper.then(function() { //test a cell rule exists after demo is loaded
    testCellRule(test, "button#PYRrule", "PYRrule", "#cellParamsCondsCellModel", '#cellParamsCondsCellType');
  });
}

/**
 * Test functionality within the explore network view
 */
function exploreNetwork(test) {
  casper.then(function() {
    this.echo("------Testing explore network");
    test.assertExists('button[id="exploreNetwork"]', "Explore network button exists");
    casper.click('#exploreNetwork');
    casper.waitUntilVisible('button[id="okInstantiateNetwork"]', function() {
      casper.then(function() {
        canvasComponentsTests(test);
      });
      casper.then(function() { //switch to explore network tab
        casper.click('#okInstantiateNetwork');
        casper.waitWhileVisible('button[id="okInstantiateNetwork"]', function() {
          test.assertDoesntExist('button[id="okInstantiateNetwork"]', "Explore network dialog is gone");
          casper.waitWhileVisible('div[id="loading-spinner"]', function() {
            test.assertDoesntExist('button[id="okInstantiateNetwork"]', "Explore network's finished loading");
            this.echo("Testing meshes for network exist and are visible");
            testMeshVisibility(test, true, "network.S[0]");
            testMeshVisibility(test, true, "network.S[1]");
            testMeshVisibility(test, true, "network.S[2]");
            testMeshVisibility(test, true, "network.S[18]");
            testMeshVisibility(test, true, "network.S[19]");
          }, 5000);
        }, 5000);
      });

    }, 5000);
  });

  casper.then(function() { //open up plot menu 
    casper.click('#PlotButton');
  });

  casper.then(function() { //wait for plot menu to become visible
    casper.waitUntilVisible('div[role="menu"]', function() {
      test.assertExists('div[role="menu"]', "Drop down Plot Menu Exists");
      casper.then(function() { // test 2d Net plot comes up
        testPlotButton(test, "2dNetPlot", "Popup1");
      });
      //FIXME: Broken test
      /*casper.then(function(){ // test shape plot comes up
      	testPlotButton(test, "shapePlot", "Popup1");
      });*/
      casper.then(function() { // test connection plot comes up
        testPlotButton(test, "connectionPlot", "Popup1");
      });

    }, 5000);
  });

  casper.then(function() { // click on plot button again to close the menu	
    casper.evaluate(function() {
      $("#PlotButton").click();
    });
    casper.waitWhileVisible('div[role="menu"]', function() { //wait for menu to close
      test.assertDoesntExist('div[role="menu"]', "Drop down Plot Menu is gone");
    }, 5000);
  });

  casper.then(function() { //open up control panel
    casper.click('#ControlPanelButton');
  });

  casper.then(function() { //test initial load values in control panel
    testControlPanelValues(test, 43);
  });

  casper.then(function() { //close control panel
    casper.click('#ControlPanelButton');
  });
}

/**
 * Test functionality within the simulate network view
 */
function simulateNetwork(test) {
  casper.then(function() {
    this.echo("------Testing explore network");
    test.assertExists('button[id="simulateNetwork"]', "Simulate network button exists");
    casper.click('#simulateNetwork');
    casper.waitUntilVisible('button[id="runSimulation"]', function() {
      casper.then(function() {
        casper.click('#runSimulation');
        casper.waitWhileVisible('button[id="runSimulation"]', function() {
          casper.echo("Dialog disappeared");
          casper.waitWhileVisible('div[id="loading-spinner"]', function() {
            casper.echo("Loading spinner disappeared");
            this.echo("Testing meshes for network exist and are visible");
            testMeshVisibility(test, true, "network.S[0]");
            testMeshVisibility(test, true, "network.S[1]");
            testMeshVisibility(test, true, "network.S[2]");
            testMeshVisibility(test, true, "network.S[18]");
            testMeshVisibility(test, true, "network.S[19]");
          }, 150000);
        }, 150000);
      });

    }, 15000);
  });

  casper.then(function() {
    casper.click('#PlotButton');
  });

  casper.then(function() {
    casper.waitUntilVisible('div[role="menu"]', function() {
      test.assertExists('div[role="menu"]', "Drop down Plot Menu Exists");

      casper.then(function() {
        testPlotButton(test, "rasterPlot", "Popup1");
      });

      casper.then(function() {
        testPlotButton(test, "spikePlot", "Popup1");
      });

      //FIXME: Broken test
      /*casper.then(function(){
      	testPlotButton(test, "spikeStatsPlot", "Popup1");
      });*/

      casper.then(function() {
        testPlotButton(test, "ratePSDPlot", "Popup1");
      });

      casper.then(function() {
        testPlotButton(test, "tracesPlot", "Popup1");
      });

      casper.then(function() {
        testPlotButton(test, "grangerPlot", "Popup1");
      });
    }, 5000);
  });

  casper.then(function() {
    casper.evaluate(function() {
      $("#PlotButton").click();
    });

    casper.waitWhileVisible('div[role="menu"]', function() {
      test.assertDoesntExist('div[role="menu"]', "Drop down Plot Menu is gone");

    }, 5000);
  });
}

function testMeshVisibility(test, visible, variableName) {
  casper.then(function() {
    var visibility = casper.evaluate(function(variableName) {
      var visibility = CanvasContainer.engine.getRealMeshesForInstancePath(variableName)[0].visible;
      return visibility;
    }, variableName);
    test.assertEquals(visibility, visible, variableName + " visibility correct");
  });
}

function waitForPlotGraphElement(test, elementID) {
  casper.waitUntilVisible('g[id="' + elementID + '"]', function() {
    test.assertExists('g[id="' + elementID + '"]', "Element " + elementID + " exists");
  }, 5000);
}

/**
 * Test canvas controllers and other HTML elements 
 */
function canvasComponentsTests(test) {
  casper.then(function() {
    this.echo("Testing existence of few simulation controls")
    test.assertExists('button[id="panLeftBtn"]', "Pan left button present");
    test.assertExists('button[id="panUpBtn"]', "Pan up button present");
    test.assertExists('button[id="panRightBtn"]', "Pan right button present");
    test.assertExists('button[id="panHomeBtn"]', "Pan home button present");
    test.assertExists('button[id="zoomOutBtn"]', "Zoom out button present");
    test.assertExists('button[id="zoomInBtn"]', "Zoom in button present");
    test.assertExists('button[id="PlotButton"]', "Plot button present");
    test.assertExists('button[id="ControlPanelButton"]', "Control panel ");
  });
}

/**
 * Tests the different plotting options using the plot button on the canvas
 */
function testPlotButton(test, plotButton, expectedPlot) {
  casper.then(function() {
    test.assertExists('span[id="' + plotButton + '"]', "Menu option " + plotButton + "Exists");
    casper.evaluate(function(plotButton, expectedPlot) {
      document.getElementById(plotButton).click(); //Click on plot option
    }, plotButton, expectedPlot);
    casper.then(function() {
      casper.waitUntilVisible('div[id="' + expectedPlot + '"]', function() {
        test.assertExists('div[id="' + expectedPlot + '"]', expectedPlot + " (" + plotButton + ") exists");
        casper.then(function() { //test plot has certain elements that are render if plot succeeded
          waitForPlotGraphElement(test, "figure_1");
          waitForPlotGraphElement(test, "axes_1");
        });
        casper.then(function() { //destroy the plot widget
          casper.evaluate(function(expectedPlot) {
            window[expectedPlot].destroy();
          }, expectedPlot);
          casper.waitWhileVisible('div[id="' + expectedPlot + '"]', function() {
            test.assertDoesntExist('div[id="' + expectedPlot + '"]', expectedPlot + " (" + plotButton + ") no longer exists");
          }, 5000);
        });
      }, 5000);
    });
  });

  casper.then(function() {
    var plotError = test.assertEvalEquals(function() {
      var error = document.getElementById("netPyneDialog") == undefined;
      if (!error) {
        document.getElementById("netPyneDialog").click();
      }
      return error;
    }, true, "Open plot for action: " + plotButton);
  });
}

/**
 * Tests control panel is loaded with right amount of elements
 */
function testControlPanelValues(test, values) {
  casper.then(function() {
    casper.waitUntilVisible('div#controlpanel', function() {
      test.assertVisible('div#controlpanel', "The control panel is correctly open.");
      var rows = casper.evaluate(function() {
        return $(".standard-row").length;
      });
      test.assertEquals(rows, values, "The control panel opened with right amount of rows");
    });
  });
  casper.then(function() {
    casper.evaluate(function() {
      $("#controlpanel").remove();
    });

    casper.waitWhileVisible('div#controlpanel', function() {
      test.assertDoesntExist('div#controlpanel', "Control Panel went away");
    }, 5000);
  });
}
