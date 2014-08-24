function Septica() {

	var self = this;
	
	stage = new createjs.Stage(arguments[0]);

	// wtf ?
	mode = arguments[1];

	//save player references
	var players = [];

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
		self.allCardModels = R.getDeck();
		self.playedDeck = new subDeck();
		self.deck = new subDeck(self.playedDeck);		
		self.deck.addCards(self.allCardModels);
		self.deck.shuffle();
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
			startingCards = self.deck.giveCards(5);
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
		
		button.on("click", function(){
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
		unplayedPot.name = "unplayedPot";
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
		var card = self.deck.giveCards(1)[0];

		var cardImage = new createjs.Bitmap(R.getImage(card.alias));
		var cardContainer = new createjs.Container();
		cardContainer.mouseChildren = false;
		cardContainer.addChild(cardImage);
		cardContainer.name = card.alias;
		cardContainer.model = card;
		
		var playedPot = stage.getChildByName("middlePot").getChildByName("playedPot");
		self.playedDeck.addCards(card);
		playedPot.addChild(cardContainer);
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

				var currentPlayedCardValue = self.playedDeck.getLastAddedCard().value;
				switch(currentPlayedCardValue){
					case 1:
						if(player.hasSpecialCardA()){//does he have another A ?
							player.cardsContainer.addEventListener("click", handlePlayerAction);
						}else{
							console.log('Human doesn`t have an A');
							endTurn();
						}
						break;

					case 12:
						if(player.hasSpecialCardJ()){//does he have another J ?
							player.cardsContainer.addEventListener("click", handlePlayerAction);
						}else{
							//TODO 2 is a placeholder
							player.takeCard(self.deck.giveCards(2));
							console.log('Human doesn`t have a J');
							endTurn();
						}
						break;

					case 7:
						//vai
						//break;

					default:
					// attach listener
					player.cardsContainer.addEventListener("click", handlePlayerAction);
					stage.getChildByName("middlePot").getChildByName("unplayedPot").addEventListener("click", getCardFromDeck);
				}

				function handlePlayerAction(evt) {
					if (isValid(evt.target.model)) {
						player.cardsContainer.removeAllEventListeners();
						player.consumeMove(evt.target);
						// put card in the played deck
						self.playedDeck.addCards(evt.target.model);
						var pot = stage.getChildByName("middlePot").getChildByName("playedPot");
						stage.getChildByName("middlePot").getChildByName("unplayedPot").removeAllEventListeners();
						pot.removeAllChildren();
						evt.target.x = 0;
						evt.target.y = 0;
						pot.addChild(evt.target);
						endTurn();
					}
				}

				function getCardFromDeck(evt){
					player.takeCard(self.deck.giveCards(1));
					player.cardsContainer.removeAllEventListeners();
					stage.getChildByName("middlePot").getChildByName("unplayedPot").removeAllEventListeners();
					endTurn();
				}
			} else if (player.type == "ai") {
				var aiCard = player.consumeAiMove(self.playedDeck.getLastAddedCard());
				if(aiCard){//if player returned a card, handle it
					self.playedDeck.addCards(aiCard.model);
					var pot = stage.getChildByName("middlePot").getChildByName("playedPot");
					pot.removeAllChildren();
					aiCard.x = 0;
					aiCard.y = 0;
					pot.addChild(aiCard);
				}else{//get a card
					player.takeCard(self.deck.giveCards(1));
				}

				endTurn();
			}
		} else {
			endTurn();
		}
	}

	function isValid(card) {
		var lastCard = self.playedDeck.getLastAddedCard();
		//TODO think of mechanism to handle 7
		if((lastCard.value == card.value) || (lastCard.type == card.type)){
			return true;
		}
		return false;
	}

}

/**
*	Class - creates a deck
*
*	@param fallbackDeck - deck from which cards will be taken when current deck reaches 0 cards
*/
function subDeck(fallbackDeck){

	//holds the cards for this deck
	var cards = [];
	//fallback deck from which cards will be taken when
	//current deck reaches 0 cards
	var fallbackDeck = fallbackDeck;
	
	/**
	*	Shuffles an array
	*
	*	@param theArray - array to be shuffled
	*/
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
	
	/**
	*	Adds card models to the deck
	*
	*	@params c - single card model or array of card models
	*/
	this.addCards = function(c){
		if(c instanceof Array){
			for(var i = 0 ; i < c.length ; i++){
				cards.push(c[i]);		
			}
		} else{
			cards.push(c);		
		}		
	}
	
	/**
	*	Removes card models from deck
	*
	*	@params card - single card model or array of card models
	*/
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

	/**
	*	Returns card models from deck, removes them aswell
	*
	*	@params howMany - int - number of cards to be returned
	*/
	this.giveCards = function(howMany){
		this.verifyCanGive(howMany);
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

	/**
	*	Checks if we can give howMany cards(or at least 1), if not,
	*	gets cards from the fallback deck
	*
	*	@params howMany - int - number of cards to be returned
	*/
	this.verifyCanGive = function(howMany){
		//check if we can give howMany cards, or at least 1
		//if not, get cards from fallback deck
		if((howMany || 2) > cards.length){
			console.log('o trecut');
			//possible breakage point, although fallback should always have more than 2 cards
			this.addCards(fallbackDeck.giveCards(fallbackDeck.getCardCount()-2));
			this.shuffle();
		}
	}
	
	/**
	*	Shuffles cards in deck
	*/
	this.shuffle = function(){
		arrayShuffle(cards);
	}

	/**
	*	Returns the last added card
	*/
	this.getLastAddedCard = function(){
		return cards[cards.length-1];
	}

	/**
	*	Returns the first card of the given type
	*
	*	@params type - string - type of card
	*/
	this.getCardByType = function(type){
		for(var i = 0 ; i < cards.length ; i++){
			if(cards[i].type == type){
				return cards[i];
			}
		}
	}

	/**
	*	Returns the first card of the given val
	*
	*	@params val - int - value of card
	*/
	this.getCardByValue = function(val){
		for(var i = 0 ; i < cards.length ; i++){
			if(cards[i].van == val){
				return cards[i];
			}
		}
	}

	/**
	*	Returns the number of cards in the deck
	*/
	this.getCardCount = function(){
		return cards.length
	}
	
	/**
	*	Temporary, for debug
	*/
	this.getCards = function(){
		return cards;
	}
}

/**
*	Class - creates a player
*
*	@param type - string - human/ai/internet
*	@param id - string
*/
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

	/**
	*	Accept card model and add it to deck
	*
	*	@params card - card models
	*/
	this.takeCard = function(cards){
		deck.addCards(cards);
		renderCards(cards);
		placeCards();
	}

	/**
	*	Handle move for player
	*
	*	@params card - card view
	*/
	this.consumeMove = function(card){
		this.cardsContainer.removeChild(card);
		deck.removeCards(card.model);		

		if (deck.getCards().length == 0) {
			this.active = false;
		}
		
		placeCards();
	}

	/**
	*	Handle ai move:
	*		see if has a valid card and return it
	*		if not, a card will be given to the player by the game
	*
	*	@params card - card model
	*/
	this.consumeAiMove = function(card){
		var selectCard = deck.getCardByType(card.type) || deck.getCardByType(card.val);
		if(selectCard){//remove card and return it
			console.log('AI:'+ self.id + ' pune ' + selectCard.alias);
			var cardView = this.cardsContainer.getChildByName(selectCard.alias);
			cardView.addChild(new createjs.Bitmap(R.getImage(selectCard.alias)));
			this.consumeMove(cardView);
			return cardView;
		}
		console.log('AI:'+ self.id + ' a luat carte.');
	}

	this.hasSpecialCardA = function(){
		return (deck.getCardByValue(1))?true:false;
	}

	this.hasSpecialCardJ = function(){
		return (deck.getCardByValue(2))?true:false;
	}

	/**
	*	Renders cards
	*
	*	@params cards - card models
	*/
	function renderCards(cards){
		if(cards instanceof Array){
			for(var i = 0 ; i < cards.length ; i++){
				renderCard(cards[i]);
			}
		} else {
			renderCard(cards);
		}
	}

	/**
	*	Creates a single card view and adds it to the cardsContainer
	*
	*	@params card - card model
	*/
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

	/**
	*	Positiones the cards in the cards container
	*/
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

// degrees to radians
Math.radians = function(degrees) {
	return degrees * Math.PI / 180;
};

// radians to degrees
Math.degrees = function(radians) {
	return radians * 180 / Math.PI;
};