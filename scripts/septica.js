function Septica() {
	var self = this;

	this.stage;

	this.start = function(canvasName) {
		console.log("starting Septica");

		this.stage = new createjs.Stage("stage");

		// send resources to load to the preloader
		var preloader = new Preload.getInstance();
		preloader.loadResources(onLoadProgress, onPhaseComplete, [{id:"deck", src:"resources/deck.json"}]);
	}

	function onPhaseComplete() {
		var R = Preload.getInstance();

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
			bmp.rotation = 2;

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

	function onLoadProgress() {

	}

}