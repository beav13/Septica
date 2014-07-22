
function testHtmlElement(stage) {
	var htmlElement = document.getElementById("hello");
	var domElement = new createjs.DOMElement(htmlElement);
	domElement.x = 200;
	domElement.y = 200;
	domElement.rotation = 30;
	domElement.visible = true;

	stage.addChild(domElement);
	stage.update();
}

// renders the whole deck in a random manner
function testDeckRender(stage) {
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
		// bmp.rotation = 2;

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