function Septica() {

	this.start = function() {
		console.log("starting Septica");

		// send resources to load to the preloader
		var preloader = new Preload([{id:"json", src:"resources/deck.json"}]);
		preloader.loadResources();
	}

}