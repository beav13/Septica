// loads resources in multiple phases and notifies progress for each one
// will also go through json like deck.json to get the resource paths to 
// load additional images, besides the ones passed in imgRes
function Preload(jsonRes, imgRes, soundRes, progressCallback, phaseCallback) {
	this.jsonRes = jsonRes;
	this.imgRes = imgRes;
	this.soundRes = soundRes;

	// send false when loading resources locally, switch to true when using XHR
	this.queue = new createjs.LoadQueue(false); 
	this.queue.addEventListener("complete", this.onComplete);

	this.manifest = null;

	this.loadResources = function() {
		this.loadJson();
		this.loadImg();
		this.loadSound();
	}

	this.loadJson = function() {
		// load JSON resources
		console.log("Start loading JSON resources");
		console.log(jsonRes);
		this.manifest = jsonRes;
		// new preload object

		if (this.manifest) {
			console.log("Something to load");
			this.queue.loadManifest(this.manifest);
		}
	}

	this.loadImg = function() {
		// load Image resources
		console.log("Start loading Image resources");
		console.log(imgRes);
		this.manifest = imgRes;
		if (this.manifest) {
			console.log("Something to load");
		}
	}

	this.loadSound = function() {
		// load Sound resources
		console.log("Start loading Sound resources");
		console.log(soundRes);
		this.manifest = soundRes;
		if (this.manifest) {
			console.log("Something to load");
		}
	}

	this.onComplete = function() {
		console.log("load complete");
	}
}