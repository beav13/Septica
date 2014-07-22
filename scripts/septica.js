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
		renderDeck();
		stage.update();
	}

	function showMenu() {
		var htmlElement = document.getElementById("hello");
		htmlElement.style.display = "block";
		var domElement = new createjs.DOMElement(htmlElement);
		domElement.x = 200;
		domElement.y = 200;
		domElement.rotation = 30;
		domElement.visible = true;

		stage.addChild(domElement);
		stage.update();
	}

	function renderDeck() {
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
			stage.addChild(bmp);
			bmp.x = x;
			bmp.y = y;
			// bmp.rotation = 5;

			gameDeck.splice(card, 1);

			x += 50;
			if (x > 400) {
				x = 5;
				y += 100;
			}
		}

		// update the stage
		stage.update();
	}
}