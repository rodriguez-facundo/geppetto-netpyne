function clickOnTree(casper, file) {
	casper.then(function(){ 
		let text = casper.evaluate(function(item) {
			let leaves = document.getElementById("TreeContainerCutting_component").getElementsByTagName("span");
			let out = {}
			for (var i = 0 ; i < leaves.length ; i++) {
				out[i] = leaves[i].textContent
			}
			return JSON.stringify(out)
		}, file)
		this.echo(text)
	})
	return casper.evaluate(function(item) {
		let leaves = document.getElementById("TreeContainerCutting_component").getElementsByTagName("span");
		for (var i = 0 ; i < leaves.length ; i++) {
			if (leaves[i].textContent == item) {
				leaves[i].scrollIntoView();
				leaves[i].click();
				return true
			}
		}
		return false
	}, file)
}

// ----------------------------------------------------------------------------------- //

function importHLS(casper, test, toolbox, tut3=true) {
	casper.then(function () {
		this.waitUntilVisible('button[id="appBar"]', function(){
			this.click('button[id="appBar"]')
		})
	})
	casper.then(function() {
		this.waitUntilVisible('span[id="appBarImportHLS"]', function(){
			this.wait(3000, function(){
				this.click('span[id="appBarImportHLS"]')
			})
			
		})
	})
	casper.then(function() {
		this.waitUntilVisible('input[id="appBarImportFileName"]', function(){
			this.click('input[id="appBarImportFileName"]')
		})
	})
	casper.then(function(){
		this.wait(1000)
	})
	casper.then(function() {
		test.assert(clickOnTree(this, (tut3 ? 'netpyne_ui' : 'output.py')), "click " + (tut3 ? "netpyne_ui" : "output.py") + " folder")
	})
	
	casper.then(function(){
		if (!tut3) {
			this.bypass(4)
		}
	})

	casper.then(function(){
		this.wait(1000)
	})
	casper.then(function() {
		test.assert(clickOnTree(this, 'tests'), "click tests folder")
	})
	casper.then(function(){
		this.wait(1000)
	})
	casper.then(function() {
		test.assert(clickOnTree(this, 'tut3.py'), "click tut3.py file")
	})

	casper.then(function(){
		this.wait(1000, function() {
			this.waitUntilVisible('button[id="browserAccept"]', function(){
				this.click('button[id="browserAccept"]')
			})
		})
	})

	casper.then(function(){
		this.waitWhileVisible("div[id='TreeContainerCutting_component']", function(){
			this.echo(tut3 ? 'tut3.py selection OK' : 'output.py selection OK')
		})
	})
	
	casper.then(function(){
		this.wait(1000, function() {
			this.waitUntilVisible('button[id="appBarPerformActionButton"]', function(){
				this.click('button[id="appBarPerformActionButton"]')
			})
		})
	})
	casper.then(function() {
		this.wait(1000)
	})
	casper.then(function(){
		test.assertExist('input[id="appBarImportFileName"]', "specify if mod files required before importing HLS OK")
	})

	casper.then(function() {
		toolbox.click(this, 'appBarImportRequiresMod')
	})

	casper.then(function(){
		toolbox.click(this, 'appBarImportRequiresModNo', 'span')
	})

	casper.then(function(){
		this.wait(1000, function() {
			this.waitUntilVisible('button[id="appBarPerformActionButton"]', function(){
				this.click('button[id="appBarPerformActionButton"]')
			})
		})
	})

	casper.then(function() {
		this.waitWhileVisible('input[id="appBarImportFileName"]')
    this.waitWhileVisible('div[id="loading-spinner"]', function() {
      test.assert(true, "Completed HLS import")
    }, 40000)
  })
}

// ----------------------------------------------------------------------------------- //

function instantiateNetwork(casper, test, toolbox) {
	casper.then(function() {
		this.waitUntilVisible('button[id="simulateNetwork"]', function() {
			this.click('button[id="simulateNetwork"]')
		})
	})
  casper.then(function() {
    this.waitWhileVisible('div[id="loading-spinner"]', function() {
      test.assert(this.evaluate(function() {
				return CanvasContainer.engine.getRealMeshesForInstancePath("network.S[10]")[0].visible
			}), "Instance created with 40 cells")
    }, 40000)
	})
}

// ----------------------------------------------------------------------------------- //

function simulateNetwork(casper, test, toolbox) {
	casper.thenClick('#PlotButton');

	casper.then(function() {
    this.waitUntilVisible('span[id="rasterPlot"]');
  })
  casper.thenEvaluate(function() {
    document.getElementById('rasterPlot').click();
	});
	casper.then(function() {
		this.wait(2000, function(){
			test.assertDoesntExist('div[id="rasterPlot"]', "Network has not been simulated")
		})
	})

	casper.then(function() {
    var info = this.getElementInfo('button[id="launchSimulationButton"]');
    this.mouse.click(info.x - 4, info.y - 4); //move a bit away from corner
	})
	
  casper.then(function(){
    this.wait(1000)
  })
  casper.then(function() {
    this.waitWhileVisible('div[role="menu"]', function() { //wait for menu to close
      test.assertDoesntExist('div[role="menu"]', "Plot Menu is gone");
    });
	})
	
	casper.then(function(){
		this.waitUntilVisible('button[id="launchSimulationButton"]', function(){
			this.click('button[id="launchSimulationButton"]')
		})
	})
  casper.then(function(){
		this.waitUntilVisible('button[id="okRunSimulation"]', function(){
			this.click('button[id="okRunSimulation"]')
		})
	})
	casper.then(function(){
		this.waitWhileVisible('div[id="loading-spinner"', function(){
			this.click('#PlotButton')
		})
	})

	casper.then(function() {
    this.waitUntilVisible('span[id="rasterPlot"]');
  })
  casper.thenEvaluate(function() {
    document.getElementById('rasterPlot').click();
  });
  
  casper.then(function() {
    this.waitUntilVisible('div[id="Popup1"]', function() {
			this.waitUntilVisible('g[id="figure_1"]')
			this.waitUntilVisible('g[id="axes_1"]')
		})
  })
	
	casper.then(function() {
    toolbox.click(this, "launchSimulationButton", "button"); //move a bit away from corner
	})
	
  
  casper.then(function() {
    this.waitWhileVisible('div[role="menu"]', function() { //wait for menu to close
      test.assertDoesntExist('div[role="menu"]', "Plot Menu is gone");
    });
	})
}

// ----------------------------------------------------------------------------------- //

function saveNetwork(casper, test, toolbox) {
	casper.then(function () {
		this.waitUntilVisible('button[id="appBar"]', function(){
			this.click('button[id="appBar"]')
		})
	})
	casper.then(function(){
		this.wait(2000)
	})
	casper.then(function() {
		this.waitUntilVisible('span[id="appBarSave"]', function(){
			this.click('span[id="appBarSave"]')
		})
	})
	casper.then(function(){
		this.waitUntilVisible('button[id="appBarPerformActionButton"]', function(){
			this.click('button[id="appBarPerformActionButton"]')
		})
	})
	casper.then(function() {
		this.waitWhileVisible('button[id="appBarPerformActionButton"]', function(){
			this.echo("Saved model in json format")
		})
	})
}

// ----------------------------------------------------------------------------------- //

function openNetwork(casper, test, toolbox) {
	casper.then(function () {
		this.waitUntilVisible('button[id="appBar"]', function() {
			this.click('button[id="appBar"]')
		})
	})
	casper.then(function() {
		this.waitUntilVisible('span[id="appBarOpen"]', function() {
			this.click('span[id="appBarOpen"]')
		})
	})
	casper.then(function() {
		this.waitUntilVisible('input[id="loadJsonFile"]', function() {
			this.click('input[id="loadJsonFile"]')
		})
	})
	casper.then(function(){
		this.wait(1000)
	})
	casper.then(function() {
		test.assert(clickOnTree(this, 'output.json'), "click output.json file")
	})

	casper.then(function(){
		this.wait(1000, function() {
			this.click('button[id="browserAccept"]')
		})
	})
	
	casper.then(function(){
		this.wait(1000, function() {
			this.click('button[id="appBarPerformActionButton"]')
		})
	})
	casper.then(function() {
		this.waitWhileVisible('input[id="loadJsonFile"]', function() {
			test.assert(false, 'Trying to loaded a model without specifying if mod files are required')
		}, function (){
			this.echo("Check if mod files are required OK")
		}, 1000)
	})

	casper.then(function() {
		toolbox.click(this, 'appBarLoadRequiresMod')
	})

	casper.then(function(){
		toolbox.click(this, 'appBarLoadRequiresModNo', 'span')
	})
	casper.then(function(){
		toolbox.click(this, "appBarPerformActionButton", "button")
	})
	casper.then(function() {
		this.waitWhileVisible('input[id="loadJsonFile"]')
		this.waitWhileVisible('div[id="loading-spinner"]', function() {
      test.assert(true, "Completed Model load")
    }, 40000)
	})
}

// ----------------------------------------------------------------------------------- //

function exploreOpenedModel(casper, test, toolbox) {
	casper.then(function() {
    this.waitWhileVisible('div[id="loading-spinner"]')
	})
	casper.then( function(){
		test.assert(this.evaluate(function() {
			return document.getElementById("launchSimulationButton").textContent == "You have already simulated your network"
		}) , "Launch simulation button is lock ")
	})
	casper.then(function(){
		test.assert(this.evaluate(function() {
			return document.getElementById("refreshInstanciatedNetworkButton").textContent == "Your network is in sync"
		}) , "Sync instance button is lock ")
	})

	casper.thenClick('#PlotButton')
	casper.then(function() {
		toolbox.testPlotButton(casper, test, "rasterPlot")
	})
	
	casper.then(function() {
		toolbox.testPlotButton(casper, test, "connectionPlot")
	})

	casper.then(function() {
    toolbox.click(this, "launchSimulationButton", "button"); //move a bit away from corner
	})

	casper.then(function(){
		this.wait(2000)
	})
}

// ----------------------------------------------------------------------------------- //

function exportHLS(casper, test, toolbox) {
	casper.then(function () {
		this.waitUntilVisible('button[id="appBar"]', function(){
			this.click('button[id="appBar"]')
		})
	})
	casper.then(function() {
		this.waitUntilVisible('span[id="appBarExportHLS"]', function(){
			this.click('span[id="appBarExportHLS"]')
		})
	})
	casper.then(function(){
		this.waitUntilVisible('button[id="appBarPerformActionButton"]', function(){
			this.click('button[id="appBarPerformActionButton"]')
		})
	})
	casper.then(function(){
		this.waitWhileVisible('button[id="appBarPerformActionButton"]')
	})
	casper.then(function(){
		this.waitWhileVisible('div[id="loading-spinner', function(){
			this.echo("HLS were saved")
		})
	})
}

// ----------------------------------------------------------------------------------- //

function clearModel(casper, test, toolbox) {
	casper.then(function () {
		this.waitUntilVisible('button[id="appBar"]', function(){
			this.click('button[id="appBar"]')
		})
	})
	casper.then(function() {
		this.waitUntilVisible('span[id="appBarDelete"]', function(){
			this.click('span[id="appBarDelete"]')
		})
	})
	casper.then(function(){
		this.waitUntilVisible('button[id="appBarPerformActionButton"]', function(){
			this.evaluate(function() {
				document.getElementById("appBarPerformActionButton").click()
			})
		})
	})

	casper.then(function(){
		this.waitWhileVisible('button[id="appBarPerformActionButton"]')
	})

	casper.then(function() {
		this.waitUntilVisible('div[id="Populations"]', function(){
			this.click('div[id="Populations"]')
		})
	})
	casper.then(function(){
		this.wait(1000)
	})
	casper.then(function(){
		test.assertDoesntExist('input[id="populationName"]', "Model deleted")
	})
	

}
module.exports = {  
	importHLS: importHLS,
	exportHLS: exportHLS,
	openNetwork: openNetwork,
	saveNetwork: saveNetwork,
	simulateNetwork: simulateNetwork,
	instantiateNetwork: instantiateNetwork,
	exploreOpenedModel: exploreOpenedModel,
	clearModel: clearModel
}