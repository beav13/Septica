function Septica(params) {
	var self = this;

	this.stage;

	this.start = function(canvasName) {
		console.log("starting Septica");

		this.stage = new createjs.Stage("stage");

		// send resources to load to the preloader
		var preloader = new PreloadSeptica.getInstance();

		// define phases and what resources to load for each phase
		var jsonPhase = { id: "JSON", text: "Loading JSON", manifest: [{id:"deck", src:"resources/deck.json"}] };
		var imgPhase = { id: "IMG", text: "Loading Images" };
		var soundPhase = { id: "SOUND", text: "Loading Sound", manifest: [{id:"test", src:"test -- will show 404 in the console"}] };

		var phases = [jsonPhase, imgPhase, soundPhase];

		preloader.loadResources(onLoadComplete, this.stage, phases);
	}

	function onLoadComplete() {
		return;
		
		var R = PreloadSeptica.getInstance();

		// get the full deck loaded from the JSON file
		var deck = R.getDeck();

		// variable that holds the remaining cards in the deck
		var gameDeck = deck;

		// position helpers
		var x = 5;
		var y = 5;

		// consume the deck in a random manner and render the cards on the stage
		while (gameDeck.length > 0) {
			var card = Math.floor(Math.random() * deck.length);
			var bmp = new createjs.Bitmap(R.getImage(deck[card].alias));
			self.stage.addChild(bmp);
			bmp.x = x;
			bmp.y = y;
			// bmp.rotation = 2;

			gameDeck.splice(card, 1);

			x += 50;
			if (x > 400) {
				x = 5;
				y += 100;
			}
		}

		// update the stage
		self.stage.update();
	}
}