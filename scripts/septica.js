function Septica() {
	
	stage = new createjs.Stage(arguments[0]);

	// wtf ?
	mode = arguments[1];
	// list of players (those not contained in remotePlayers are AI)
	players = arguments[2];
	// list of human players connected remotely
	remotePlayers = arguments[3];
	// player index
	playerIndex = arguments[4]

	//save player references
	var players = [];
	
	//original cards
	this.allCardModels;
	
	//deck cards that will be shuffled
	this.deck;
	
	//cards that have been played
	this.playedDeck;

	this.start = function() {
		console.log("starting Septica");

		// send resources to load to the preloader
		var preloader = new PreloadSeptica.getInstance();

		// define phases and what resources to load for each phase
		var jsonPhase = { id: "JSON", text: "Loading JSON", manifest: [{id:"deck", src:"resources/deck.json"}] };
		var imgPhase = { id: "IMG", text: "Loading Images", manifest: [{id:"card_back", src:"images/card_back.png" }]};
		var soundPhase = { id: "SOUND", text: "Loading Sound", manifest: [{id:"test", src:"test -- will show 404 in the console"}] };
		var phases = [jsonPhase, imgPhase, soundPhase];

		preloader.loadResources(onLoadComplete, stage, phases);
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
		
		var preloader = new PreloadSeptica.getInstance();
		this.allCardModels = preloader.getDeck();
		
		//create deck
		this.deck = new subDeck();
		//add all cards
		this.deck.addCards(this.allCardModels);
		//shuffle deck
		this.deck.shuffle();

		initializePlayers();
		
		drawBoard();
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

		//give cards
		for (var i = 0; i < players.length; i++) {
			var startingCards = [];
			startingCards = this.deck.giveCards(5);
			players[i].takeCard(startingCards);
		};

		stage.addChild(players[0].cardsContainer);
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
	
	function drawBoard() {
		drawPlayerPositions();
		drawMiddlePot();
	}

	function drawMiddlePot() {
		// draw middle deck
		var R = new PreloadSeptica.getInstance();
		var cardBack = new createjs.Bitmap(R.getImage("card_back"));
		
		var middlePot = new createjs.Container();
		for (var i = 0; i < 3; i++) {
			var card = cardBack.clone();
			card.x += i * 2;
			card.y -= i * 2;
			middlePot.addChild(card);
		}
		// center pot
		middlePot.x = (stage.canvas.width - middlePot.getBounds().width) / 2;
		middlePot.y = (stage.canvas.height - middlePot.getBounds().height) /2;

		middlePot.stageResizeHandler = function(){
			middlePot.x = (stage.canvas.width - middlePot.getBounds().width) / 2;
			middlePot.y = (stage.canvas.height - middlePot.getBounds().height) /2;
		}
		$(window).on("resize", middlePot.stageResizeHandler);
		
		stage.addChild(middlePot);
	}

	function drawPlayerPositions(playerIndex) {
		// x = cx + r * cos(a)
		// y = cy + r * sin(a)

		// 
		var circle = new createjs.Shape();
		var cx = stage.canvas.width / 2;
		var cy = stage.canvas.height / 2;
		var r = 400;
		var count = 8 ;// players.length; - this should be the number of players, changed it for debugging purposes

		// this circle represents the "game table" area
		circle.graphics.beginFill("white").drawCircle(cx, cy, r);
		circle.alpha = 0.2;
		stage.addChild(circle);

		// draw card hands for each player
		var angle = 0;
		var angleIncrement = 2 * Math.PI / count;
		for (var i = 0; i < count; i++) {
			var x = cx + r * Math.cos(angle);
			var y = cy + r * Math.sin(angle);

			var hand = drawPlayerHand();
			hand.x = x;
			hand.y = y;
			hand.rotation = Math.degrees(angle) + 90;
			stage.addChild(hand);

			// player center represents the player's position at the table
			var playerCenter = new createjs.Shape();
			playerCenter.graphics.beginFill("cyan").drawCircle(x, y, 20);
			playerCenter.alpha = 0.4;
			stage.addChild(playerCenter);

			angle += angleIncrement;
		}
	}

	function drawPlayerHand() {
		var R = new PreloadSeptica.getInstance();
		var cardBack = new createjs.Bitmap(R.getImage("AS"));

		// draw player hands
		var cardWidth = cardBack.clone().getBounds().width;
		
		var hand = new createjs.Container();
		for (var i = 0; i < 5; i++) {
			var card = cardBack.clone();
			card.x = i * cardWidth / 4;
			hand.addChild(card);
		}

		return hand;
	}

	// degrees to radians
	Math.radians = function(degrees) {
		return degrees * Math.PI / 180;
	};

	// radians to degrees
	Math.degrees = function(radians) {
		return radians * 180 / Math.PI;
	};

}

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

	//container to hold cards
	this.cardsContainer = new createjs.Container();

	//keep the deck private
	var deck = new subDeck();

	//place a card down and remove it from subdeck
	this.giveCard = function(card){

	}

	//accept card from pile and add it to subdeck
	this.takeCard = function(cards){
		deck.addCards(cards);
		renderCards(cards);
		placeCards();
	}

	//function to be called when its this players turn,
	//it will calculate if the player has moves, if it should 
	//add listeners(if human) or calculate move(if ai)
	this.consumeMove = function(){

	}

	function renderCards(card){

		var preload = new PreloadSeptica.getInstance();

		if(card instanceof Array){
			for(var i = 0 ; i < card.length ; i++){
				var cardBack = new createjs.Bitmap(preload.getImage(card[i].alias));
				var cardContainer = new createjs.Container();
				cardContainer.addChild(cardBack);
				cardContainer.model = card[i];
				self.cardsContainer.addChild(cardContainer);
			}
		} else{
			var cardBack = new createjs.Bitmap(R.getImage(card.alias));
			var cardContainer = new createjs.Container();
			cardContainer.addChild(cardBack);
			cardContainer.model = card;
			self.cardsContainer.addChild(cardContainer);
		}
	}

	function placeCards(){
		var cardNum = self.cardsContainer.getNumChildren();
		var x = 0;
		for(var i = 0 ; i < cardNum ; i++){
			var card = self.cardsContainer.getChildAt(i);
			card.x = x;
			x += 20;
		}
	}
}