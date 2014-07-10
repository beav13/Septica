// loads resources in multiple phases and notifies progress for each one
// will also go through json like deck.json to get the resource paths to 
// load additional images, besides the ones passed in imgRes

var PreloadSeptica = (function(){
	var instance = null;

	function Preload1() {
		var self = this;

		this.stage;
		this.phases;
		this.completeCallback

		this.phaseIndex = 0;
		this.phaseDisplayList = [];

		this.results = [];

		this.loadResources = function(completeCallback, stage, phases) {
			this.completeCallback = completeCallback;
			this.phases = phases;
			this.stage = stage;

			// start loading JSON resources
			this.load();
		}

		this.load = function() {
			if (this.phases.length > this.phaseIndex) {
				var phase = this.phases[this.phaseIndex];
				// start loading if there is a manifest set
				if (phase.manifest) {
					console.log("Start loading manifest: " + phase.id);
					var loadQueue = new createjs.LoadQueue();
					// add listeners
					loadQueue.addEventListener("fileload", fileLoad);
					loadQueue.addEventListener("progress", phaseProgress);
					loadQueue.addEventListener("complete", phaseEnd);

					// signal phase start
					phaseStart(phase);
					// start loading the manifest
					loadQueue.loadManifest(phase.manifest);
				}
			} else {
				// signal that all phases finished loading
				this.completeCallback();
			}
		}

		this.addDeckImages = function(cards) {
			// initialize image
			var imgPhase = null;
			// start from current phase, no need to look before this index, since those resource queues are already loaded
			for (var i = this.phaseIndex; i < this.phases.length; i++) {
				if (this.phases[i].id === "IMG") {
					imgPhase = this.phases[i];
				}
			}

			// if image phase was found, add images to the image manifest
			if (imgPhase) {
				// make sure the array isn't null
				if (!imgPhase.manifest) {
					imgPhase.manifest = [];
				}
				// add card src to the image manifest
				for (var i = 0; i < cards.length; i++) {
					var card = cards[i];
					imgPhase.manifest.push({id : card.alias , src : card.imagePath});
				}
			}
		}

		function phaseStart(phase) {
			var text = new createjs.Text(phase.text, "20px Arial", "#000000");
			self.stage.addChild(text);
			text.y += self.phaseIndex * text.getMeasuredLineHeight();

			self.phaseDisplayList.push({id:phase.id, text:text});
			self.stage.update();
		}

		function phaseProgress(event) {
			// TODO
		}

		function fileLoad(event) {
			// if loaded resource is the deck JSON, add the image resources to the image manifest
			if (event.item.id === "deck") {
				self.addDeckImages(event.result.cards);
			}
		}

		function phaseEnd(event) {
			// will store the event target (load queue) in the results map with the phase name key
			var key = self.phases[self.phaseIndex].id;
			self.results[key] = event.target;

			self.phaseIndex++;
			self.load();
		}


		this.getImage = function(key) {
			return this.results["IMG"].getResult(key);
		}

		this.getDeck = function() {
			return this.results["JSON"].getResult("deck").cards;
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