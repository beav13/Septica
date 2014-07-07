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
		// var img = Preload.getInstance().getImages().getResult("AHearts");
		var bmp = new createjs.Bitmap(Preload.getInstance().getImages().getResult("AHearts"));
		var bmp2 = new createjs.Bitmap(Preload.getInstance().getImages().getResult("QHearts"));
		var bmp3 = new createjs.Bitmap(Preload.getInstance().getImages().getResult("7Hearts"));
		
		self.stage.addChild(bmp);
		self.stage.addChild(bmp2);
		bmp2.x += 50;
		self.stage.addChild(bmp3);
		bmp3.x += 100;
		self.stage.update();
	}

	function onLoadProgress() {

	}

}