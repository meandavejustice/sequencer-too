/*global module */
var trackStore = function trackStore(){
  var tracks = {
    reference: {}
  };

  this.addReference = function(key, obj) {
    tracks.reference[key] = obj;
  };

  this.getReference = function(key) {
    if (tracks.reference[key]) return tracks.reference[key];
  };

  this.keys = function() {
    return Object.keys(tracks).filter(function(key) {
             if (key !== 'reference') return key;
           });
  }

  this.get = function(key) {
    if (tracks[key]) return tracks[key];
  }

  this.add = function(key, track) {
    if (!tracks[key]) {
      tracks[key] = track;
    }
  };

  this.remove = function(key) {
    if (tracks[key]) {
      delete tracks[key];
    }
  };

  this.play = function(key) {
    if (tracks[key]) {
      tracks[key].play();
    }
  }

  this.stop = function(key) {
    if (tracks[key]) {
      tracks[key].stop();
    }
  }
}

trackStore.instance = null;

trackStore.getInstance = function() {
  if(this.instance === null){
    this.instance = new trackStore();
  }
  return this.instance;
}

module.exports = trackStore.getInstance();