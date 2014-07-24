function Septica() {
	
	stage = new createjs.Stage(arguments[0]);
	// wtf ?
	mode = arguments[1];
	// list of players (those not contained in remotePlayers are AI)
	players = arguments[2];
	// list of human players connected remotely
	remotePlayers = arguments[3];
	
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
		var imgPhase = { id: "IMG", text: "Loading Images" };
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

		// test sh...tuff
		// testDeckRender(stage);
		//testHtmlElement(stage);
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
	
	this.removeCard = function(card){
		for(var i = 0 ; i < cards.length ; i++){
			if(cards[i].alias == card.alias){
				delete cards[i];
			}			
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
