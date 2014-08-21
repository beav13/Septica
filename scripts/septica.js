function Septica() {
	
	stage = new createjs.Stage(arguments[0]);

	// wtf ?
	mode = arguments[1];

	//save player references
	players = [];

	// current player's turn
	currentPlayer = 0;

	// game settings
	settings = {cardW:72, cardH:96};

	// preloader reference
	R = new PreloadSeptica.getInstance();
	
	//original cards
	this.allCardModels;
	
	//deck cards that will be shuffled
	this.deck;
	
	//cards that have been played
	this.playedDeck;

	this.start = function() {
		console.log("starting Septica");

		// define phases and what resources to load for each phase
		var jsonPhase = { id: "JSON", text: "Loading JSON", manifest: [{id:"deck", src:"resources/deck.json"}] };
		var imgPhase = { id: "IMG", text: "Loading Images", manifest: [{id:"card_back", src:"images/card_back.png" }]};
		var soundPhase = { id: "SOUND", text: "Loading Sound", manifest: [{id:"test", src:"test -- will show 404 in the console"}] };
		var phases = [jsonPhase, imgPhase, soundPhase];

		R.loadResources(onLoadComplete, stage, phases);
	}

	function onLoadComplete() {
		showMainMenu();
		requestAnimationFrame(render);
	}
	
	function render(){
		requestAnimationFrame(render);		
		stage.update();
	}
	
	function startGame(){
		console.log("Start game.");
		
		// prepare data
		this.allCardModels = R.getDeck();
		this.deck = new subDeck();
		this.playedDeck = new subDeck();
		this.deck.addCards(this.allCardModels);
		this.deck.shuffle();
		initializePlayers();
		
		// draw game
		renderBoard();


		// add resize listener
		$(window).on("resize", stageResize);

		// draw first card
		drawFirstCard();

		// start
		startTurn();
	}

	function initializePlayers(){
		var p1 = new Player("human", "mear mortal");
		var p2 = new Player("ai", "Data");
		var p3 = new Player("ai", "H.A.L.");
		var p4 = new Player("ai", "Bender");

		players.push(p1);
		players.push(p2);
		players.push(p3);
		players.push(p4);
		currentPlayer = 0;

		//give cards
		for (var i = 0; i < players.length; i++) {
			var startingCards = [];
			startingCards = this.deck.giveCards(5);
			players[i].takeCard(startingCards);
		};
	}

	function showMainMenu() {
		// draw graphics
		var g = new createjs.Graphics();
		g.beginFill("#000000").drawRect(0, 0, 100, 30);

		// create button "shape"
		var buttonShape = new createjs.Shape(g);
		// need to specify the bounds explicitly
		buttonShape.setBounds(0, 0, 100, 30);
		
		var buttonText = new createjs.Text("Start", "20px Arial", "#ffffff");
		
		buttonText.x = (buttonShape.getBounds().width - buttonText.getBounds().width) / 2;
		buttonText.y = (buttonShape.getBounds().height - buttonText.getBounds().height) / 2;
		
		var button = new createjs.Container();
		
		button.addChild(buttonShape);
		button.addChild(buttonText);
		
		// position
		button.x = (stage.canvas.width - button.getBounds().width) / 2;
		button.y = (stage.canvas.height - button.getBounds().height) / 2;
		
		function windowResizeHandler(){
			button.x = (stage.canvas.width - button.getBounds().width) / 2;
			button.y = (stage.canvas.height - button.getBounds().height) / 2;
		}
		
		$(window).on("resize", windowResizeHandler);
		
		button.addEventListener("click", function(){
			stage.removeChild(button);
			$(window).off("resize", windowResizeHandler);
			startGame();
		})
		
		stage.addChild(button);
		stage.update();
	}

	function stageResize() {
		placeMiddlePot();
		placePlayerPositions();
	}
	
	function renderBoard() {
		renderPlayerPositions();
		renderMiddlePot();

		stageResize();
	}

	function renderMiddlePot() {
		// draw middle deck
		var cardBack = new createjs.Bitmap(R.getImage("card_back"));
		
		var middlePot = new createjs.Container();

		var unplayedPot = new createjs.Container();
		for (var i = 0; i < 3; i++) {
			var card = cardBack.clone();
			card.x += i * 2;
			card.y -= i * 2;
			unplayedPot.addChild(card);
		}
		var playedPot = new createjs.Container();
		playedPot.name = "playedPot";

		unplayedPot.x = settings.cardW + 5;
		middlePot.addChild(playedPot);
		middlePot.addChild(unplayedPot);

		// center pot
		middlePot.name = "middlePot";
		stage.addChild(middlePot);
	}

	function placeMiddlePot() {
		var middlePot = stage.getChildByName("middlePot");
		middlePot.x = (stage.canvas.width - middlePot.getBounds().width) / 2;
		middlePot.y = (stage.canvas.height - middlePot.getBounds().height) /2;
	}

	function renderPlayerPositions() {
		// 
		var r = Math.floor(stage.canvas.height / 2.5);
		// this circle represents the "game table" area
		var circle = new createjs.Shape();
		circle.graphics.beginFill("white").drawCircle(0, 0, r);
		circle.alpha = 0.2;

		var circleContainer = new createjs.Container();
		// container (0,0) will be the center of the circle
		circleContainer.addChild(circle);
		circleContainer.setBounds(0,0,r,r);
		circleContainer.name = "tableCircle";
		circleContainer.initialR = r;
		stage.addChild(circleContainer);
	}

	function placePlayerPositions() {
		var circle = new createjs.Shape();
		var cx = Math.floor(stage.canvas.width / 2);
		var cy = Math.floor(stage.canvas.height / 2);
		var r = Math.floor(stage.canvas.height / 2.5);
		var count = players.length;

		var circleContainer = stage.getChildByName("tableCircle");
		//
		circleContainer.scaleX = r / circleContainer.initialR;
		circleContainer.scaleY = r / circleContainer.initialR;
		circleContainer.x = stage.canvas.width / 2;
		circleContainer.y = stage.canvas.height /2;

		// place card hands for each player
		var angle = Math.PI / 2;
		var angleIncrement = 2 * Math.PI / count;
		for (var i = 0; i < count; i++) {
			var x = cx + r * Math.cos(angle);
			var y = cy + r * Math.sin(angle);

			var hand = players[i].cardsContainer;
			hand.x = x;
			hand.y = y;
			hand.rotation = Math.degrees(angle) + 90;
			stage.addChild(hand);

			// player center represents the player's position at the table
			/*var playerCenter = new createjs.Shape();
			playerCenter.graphics.beginFill("cyan").drawCircle(x, y, 20);
			playerCenter.alpha = 0.4;
			stage.addChild(playerCenter);*/

			angle += angleIncrement;
		}
	}

	function drawFirstCard() {
		var card = deck.giveCards(1);
		var playedPot = stage.getChildByName("middlePot").getChildByName("playedPot");
		playedPot.addChild(card);
	}

	function changePlayer() {
		currentPlayer++;
		if (currentPlayer > players.length - 1) {
			currentPlayer = 0;
		}
	}

	function endTurn() {
		changePlayer();
		startTurn();
	}

	function startTurn() {
		var player = players[currentPlayer];

		if (player.active) {
			if (player.type == "human") {
				console.log("Human turn");

				function handlePlayerAction(evt) {
					if (isValid(evt.target.model)) {
						player.cardsContainer.removeAllEventListeners();
						player.consumeMove(evt.target);
						var cards = deck.giveCards(1);
						player.takeCard(cards);

						endTurn();
					}
				}

				// attach listener
				player.cardsContainer.addEventListener("click", handlePlayerAction);
			} else if (player.type == "ai") {
				console.log("AI turn");

				// consume first card
				player.consumeMove(player.cardsContainer.getChildAt(0));

				endTurn();
			}
		} else {
			endTurn();
		}
	}

	function isValid(card) {
		console.log(playedDeck.getCards()[playedDeck.getCards().length-1]);
		// will check the playedDeck to see if this is a valid move
		return true;
	}

}


// degrees to radians
Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};

// radians to degrees
Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
};

function subDeck(){

	var cards = [];
	
	function arrayShuffle(theArray) {
		var len = theArray.length;
		var i = len;
		 while (i--) {
			var p = parseInt(Math.random()*len);
			var t = theArray[i];
			theArray[i] = theArray[p];
			theArray[p] = t;
		}
	};
	
	this.addCards = function(c){
		if(c instanceof Array){
			for(var i = 0 ; i < c.length ; i++){
				cards.push(c[i]);		
			}
		} else{
			cards.push(c);		
		}		
	}
	
	this.removeCards = function(card){
		//keep index of cards to be deleted
		if(card instanceof Array){
			for(var i = 0 ; i < card.length ; i++){
				for(var j = 0 ; j < cards.length ; j++){
					if(cards[j].alias == card[i].alias){
						cards.splice(j, 1);
						break;
					}			
				}		
			}
		} else{
			for(var i = 0 ; i < cards.length ; i++){
				if(cards[i].alias == card.alias){
					cards.splice(i, 1);
					break;
				}
			}
		}
	}

	//TODO check cards exist
	this.giveCards = function(howMany){
		if(howMany){
			var returnCards = [];
			for(var i = 0 ; i < howMany ; i++){
				returnCards.push(cards[i]);			
			}
			this.removeCards(returnCards);
			return returnCards;
		}else{
			var card = cards[0];
			this.removeCards(card);
			return card;
		}
	}
	
	this.shuffle = function(){
		arrayShuffle(cards);
	}
	
	//temporary, for debug
	this.getCards = function(){
		return cards;
	}
}

function Player(type, id){

	var self = this;
	
	//"ai" or "human" or "internet"
	this.type = type;

	//id will only be present if its a human internet player
	this.id = id;

	// marks if this player is still in the game
	this.active = true;

	//container to hold cards
	this.cardsContainer = new createjs.Container();

	// keep deck private
	var deck = new subDeck();

	// accept card from pile and add it to subdeck
	this.takeCard = function(cards){
		deck.addCards(cards);
		renderCards(cards);
		placeCards();
	}

	// function that plays out the move for this player
	this.consumeMove = function(card){
		this.cardsContainer.removeChild(card);
		deck.removeCards(card.model);
		// put card in the played deck
		playedDeck.addCards(card);

		if (deck.getCards().length == 0) {
			this.active = false;
		}
		
		placeCards();
	}

	function renderCards(cards){
		if(cards instanceof Array){
			for(var i = 0 ; i < cards.length ; i++){
				renderCard(cards[i]);
			}
		} else {
			renderCard(cards);
		}
	}

	function renderCard(card) {
		var cardImage = (self.type == "human")?new createjs.Bitmap(R.getImage(card.alias))
												:new createjs.Bitmap(R.getImage("card_back"));
		var cardContainer = new createjs.Container();
		cardContainer.mouseChildren = false;
		cardContainer.addChild(cardImage);
		cardContainer.name = card.alias;
		cardContainer.model = card;

		self.cardsContainer.addChild(cardContainer);
	}

	function placeCards(){
		var cardNum = self.cardsContainer.getNumChildren();
		// if no children, skip placing
		if (cardNum == 0) {
			return;
		}

		var x = 0;
		for(var i = 0 ; i < cardNum ; i++){
			var card = self.cardsContainer.getChildAt(i);
			var space = (self.type == "human")?(settings.cardW + 5):20;
			card.x = x;
			x += space;
		}
		// move the registration point on X tot he middle of the movieclip
		self.cardsContainer.regX = self.cardsContainer.getBounds().width / 2;
	}
}