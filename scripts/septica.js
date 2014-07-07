function Septica() {

	this.start = function() {
		console.log("starting Septica");

		// send resources to load to the preloader
		var preloader = new PreloadVlad.getInstance();
		preloader.loadResources(onLoadProgress, onPhaseComplete, [{id:"deck", src:"resources/deck.json"}]);
	}

	function onPhaseComplete() {

	}

	function onLoadProgress() {

	}

}