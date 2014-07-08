// loads resources in multiple phases and notifies progress for each one
// will also go through json like deck.json to get the resource paths to 
// load additional images, besides the ones passed in imgRes

var Preload = (function(){
	var instance = null;

	function Preload1() {
		var self = this;

		this.jsonRes;
		this.imgRes;
		this.soundRes;

		this.jsonQueue;
		this.imgQueue;
		this.soundQueue;

		this.loadResources = function(progressCallback, phaseCallback, jsonRes, imgRes, soundRes) {
			this.progressCallback = progressCallback;
			this.phaseCallback = phaseCallback;
			this.jsonRes = arguments[2];
			this.imgRes = arguments[3];
			this.soundRes = arguments[4];

			// start loading JSON resources
			this.loadJson();
		}

		this.loadJson = function() {
			// load JSON resources
			if (this.jsonRes) {
				console.log("Start loading JSON resources");
				this.jsonQueue = new createjs.LoadQueue(); 
				this.jsonQueue.addEventListener("fileload", onJsonFileLoad);
				this.jsonQueue.addEventListener("complete", onJsonComplete);

				this.jsonQueue.loadManifest(this.jsonRes);
			}
		}

		this.loadImg = function() {
			// load Image resources
			if (this.imgRes) {
				console.log("Start loading Image resources");
				this.imgQueue = new createjs.LoadQueue(); 
				this.imgQueue.addEventListener("fileload", onImgFileLoad);
				this.imgQueue.addEventListener("progress", onImgProgress);
				this.imgQueue.addEventListener("complete", onImgComplete);

				this.imgQueue.loadManifest(this.imgRes);
			}
		}

		this.loadSound = function() {
			// load Sound resources
			if (this.soundRes) {
				console.log("Start loading Sound resources");
				queue = new createjs.LoadQueue();
				queue.addEventListener("fileload", onSoundLoad);
				queue.addEventListener("complete", onSoundComplete);

				queue.loadManifest(this.soundRes);
			}
			this.phaseCallback();
		}

		this.addDeckImages = function(cards) {
			// initialize image
			if (this.imgRes == null) {
				this.imgRes = [];
			}
			for (var i = 0; i < cards.length; i++) {
				var card = cards[i];
				this.imgRes.push({id : card.alias , src : card.imagePath});
			}
		}

		this.getImage = function(key) {
			return this.imgQueue.getResult(key);
		}

		this.getDeck = function() {
			return this.jsonQueue.getResult("deck").cards;
		}

		function onJsonFileLoad(event) {
			// if loaded JSON is the deck, add the image resources to the image manifest
			if (event.item.id === "deck") {
				self.addDeckImages(event.result.cards);
			}
		}

		function onJsonComplete(event) {
			// go on and load images
			self.loadImg();
		}

		function onImgComplete(event) {
			// go on and load sound
			self.loadSound();
		}

		function onImgFileLoad(event) {
			// console.log("Image file loaded " + event.item);
		}

		function onImgProgress(event) {
			// console.log("Image load queue progress");
		}

		function onSoundFileLoad(event) {
			// console.log("Sound file loaded " + event.item);
		}

		function onSoundComplete(event) {
			// console.log("Sound queue load complete");
		}

	}

	return {
		getInstance: function(){
			if(instance == null){
				instance = new Preload1();
			}

			return instance;
		}
	}

})();

