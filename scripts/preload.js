// loads resources in multiple phases and notifies progress for each one
// will also go through json like deck.json to get the resource paths to 
// load additional images, besides the ones passed in imgRes

var PreloadVlad = (function(){
	var instance = null;

	function Preload1() {		

		manifest = null;

		this.loadResources = function(progressCallback, phaseCallback, jsonRes, imgRes, soundRes) {
			this.jsonRes = jsonRes;
			this.imgRes = imgRes;
			this.soundRes = soundRes;

			this.loadJson();
			// this.loadImg();
			// this.loadSound();
		}

		this.loadJson = function() {
			// load JSON resources
			console.log("JSON files to load " + this.jsonRes);
			manifest = this.jsonRes;
			// new preload object

			if (manifest) {
				console.log("Start loading JSON resources");
				queue = new createjs.LoadQueue(); 
				queue.addEventListener("complete", onJsonComplete);
				queue.addEventListener("fileload", onJsonFileLoad);

				queue.loadManifest(manifest);
			}
		}

		this.loadImg = function() {
			// load Image resources
			console.log("Images to load " + this.imgRes);
			manifest = this.imgRes;

			if (manifest) {
				console.log("Start loading Image resources");
				queue = new createjs.LoadQueue(); 
				queue.addEventListener("complete", onImgComplete);
				queue.addEventListener("fileload", onImgFileLoad);
				queue.addEventListener("progress", onImgProgress);

				queue.loadManifest(manifest);
			}
		}

		function onJsonComplete(event) {
			console.log("JSON queue load complete");
			instance.loadImg();
		}

		function onJsonFileLoad(event) {
			console.log("JSON file loaded");
			if (event.item.id === "deck") {
				manifest = [];
				for (var i = 0; i < event.result.cards.length; i++) {
					var card = event.result.cards[i];
					if (instance.imgRes == null) {
						instance.imgRes = [];
					}
					instance.imgRes.push({id:(card.alias + card.type) , src:card.imagePath});
				}
			}
		}

		function onImgComplete(event) {
			console.log("Image queue load complete");
		}

		function onImgFileLoad(event) {
			console.log("Image file loaded" + event.item);
		}

		function onImgProgress(event) {
			console.log("Image load queue progress");
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

