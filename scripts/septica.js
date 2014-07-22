function Septica() {
	
	stage = new createjs.Stage(arguments[0]);
	// wtf ?
	mode = arguments[1];
	// list of players (those not contained in hotseatPlayers/remotePlayers are AI)
	players = arguments[2];
	// list of indexes from the player list which are playing from this client
	hotseatPlayers = arguments[3];
	// list of human players connected remotely
	remotePlayers = arguments[4];

	this.start = function() {
		console.log("starting Septica");

		// send resources to load to the preloader
		var preloader = new PreloadSeptica.getInstance();

		// define phases and what resources to load for each phase
		var jsonPhase = { id: "JSON", text: "Loading JSON", manifest: [{id:"deck", src:"resources/deck.json"}] };
		var imgPhase = { id: "IMG", text: "Loading Images" };
		var soundPhase = { id: "SOUND", text: "Loading Sound", manifest: [{id:"test", src:"test -- will show 404 in the console"}] };
		var phases = [jsonPhase, imgPhase, soundPhase];

		preloader.loadResources(onLoadComplete, stage, phases);
	}

	function onLoadComplete() {
		requestAnimationFrame(render);
	}

	function render(){
		requestAnimationFrame(render);
		renderDeck(stage);
		showMenu(stage);
	}

}
