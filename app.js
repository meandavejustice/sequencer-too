require("babel/polyfill");
var data = window.data = {sequences: []}; // require('./data.json');
var React = require('react');
var ReactTabs = require('react-tabs');
var Tab = ReactTabs.Tab;
var Tabs = ReactTabs.Tabs;
var TabList = ReactTabs.TabList;
var TabPanel = ReactTabs.TabPanel;

var tree = require('tree-view');
var trackStore = require('./trackstore');
var AudioSource = require('audiosource');
var FFT = require('audio-fft');
var AudioContext = require('audiocontext');
var context = new AudioContext();
var Sequencer = require('./components/sequence')();
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var gainNode = context.createGain();
var O = require('observed');
var ee = O(window.data);
var genId = require('./getId');

require('./morph-search')(emitter);

var welcomeContent = 'Welcome to the sequencer, from here you can'

var activeTabIndex = 1;

var fft = new FFT(context, {canvas: document.getElementById('fft')});
var fftime = new FFT(context, {canvas: document.getElementById('fftime'), type: "time"});

function getFreshSeqModel() {
  return {
    "id": Math.random().toString(16).slice(2),
    "active": false,
    "activeColor": "#E6A2DB",
    "bpm": 120,
    "tracks": {}
  }
}

document.querySelector('.save-session').addEventListener('click', function(ev) {
  var sessionData = [JSON.stringify(data, null, 2)];
  var sessionBlob = new Blob(sessionData, {type : 'text/json'});
  forceDownload(sessionBlob, 'sequencer-session'+new Date().toDateString()+'.json');
})

function loadTracksFromFile(sequence) {
  Object.keys(sequence.tracks).forEach(function(key) {
    var track = sequence.tracks[key];
    var trackObj = new AudioSource(context, {url: track.url, ffts: [fft, fftime], gainNode: gainNode});
    trackStore.add(track.id, trackObj);
  });
}

document.querySelector('.load-session').addEventListener('click', function(ev) {
  document.querySelector('.load-session-input').click();
})

document.querySelector('.load-session-input').addEventListener('change', function(ev) {
  var file = ev.target.files[0]
  if (!~file.type.indexOf('json')) return;
  var fileReader = new FileReader();
  fileReader.onloadend = function(ev) {
    var freshData = JSON.parse(ev.target.result).sequences;
    freshData.forEach(loadTracksFromFile);
    window.data.sequences = freshData;
  };
  fileReader.readAsText(file, 'json');
})

function forceDownload(blob, filename){
  var url = (window.URL || window.webkitURL).createObjectURL(blob);
  var link = window.document.createElement('a');
  link.href = url;
  link.download = filename || 'myimage.png';
  var click = document.createEvent("Event");
  click.initEvent("click", true, true);
  link.dispatchEvent(click);
}

document.querySelector('.new-sequence').addEventListener('click', function(ev) {
  data.sequences.push(getFreshSeqModel());
  render(data);
})

ee.on('change', function() {
  render(data);
});

function getSeqById(seqId) {
  return data.sequences.find(function(element) {
    return element.id === seqId;
  });
}

function activateTrackSequence(obj, activate) {
  var seqObj = getSeqById(obj.seqId);
  if (!seqObj) return;
  seqObj.tracks[obj.id].sequence[obj.index] = activate ? 1 : 0;
}

function addTrack(id, track, seqId) {
  var sequenceId = seqId ? seqId : activeTabIndex;
  data.sequences[sequenceId].tracks[id] = track;
  render(data);
}

function getRandomSequence() {
  var result = [];
  for(var i=0; i < 16; i++) {
    result.push(Number(Math.random() > Math.random()));
  }
  return result;
}

emitter.on('random:sequence', function(obj) {
  var sequence = getSeqById(obj.seqId);
  Object.keys(sequence.tracks).forEach(function(key) {
    sequence.tracks[key].sequence = getRandomSequence();
  });
})

emitter.on('track:add', function(obj) {
  var track;

  if (!track) {
    var trackObj = new AudioSource(context, {url: obj.url, ffts: [fft, fftime], gainNode: gainNode});
    var id = genId();
    trackStore.add(id, trackObj);
    var splitPath = obj.url.split('/');
    track = {
      "id": id,
      "url": obj.url,
      "title": splitPath[splitPath.length - 1],
      "sequence": [0, 0, 0, 0, 0, 0, 0, 0,
                   0, 0, 0, 0, 0, 0, 0, 0]
    }
    addTrack(track.id, track);
  }
})

emitter.on('bpm:sequence', function(obj) {
  getSeqById(obj.seqId).bpm = obj.bpm;
});

emitter.on('colorset:sequence', function(obj) {
  getSeqById(obj.seqId).activeColor = obj.activeColor;
});

emitter.on('deactivate:sequence', function(ev) {
  activateTrackSequence(ev);
});

emitter.on('activate:sequence', function(ev) {
  activateTrackSequence(ev, true);
});

emitter.on('preview:sequence', function(ev) {
  trackStore.play(ev.id);
  console.log('preview:seq:: ', ev);
});

emitter.on('remove:sequence', function(ev) {
  var seqObj = getSeqById(ev.seqId);
  if (!seqObj) return;
  delete seqObj.tracks[ev.id];
  if (!seqObj.tracks.length) {
    // remove sequence
  }
});

var browser = tree()

var SequencerPanel = React.createClass({
  handleSelected: function(selectedIndex) {
    activeTabIndex = selectedIndex;
  },
  removeTab: function() {
  },
  render: function() {
    var panel;
    if (this.props.data.sequences.length) {
      panel = <Tabs onSelect={this.handleSelected}
                  selectedIndex={activeTabIndex + 1}>

                <TabList>
                    {this.props.data.sequences.map(function(sequencer, i){
                      return (<Tab>
                              {'Sequencer '+i}
                              <i onClick={this.removeTab}>{"X"}</i>
                              </Tab>)
                    }, this)}
                </TabList>
                     {this.props.data.sequences.map(function(sequencer, i){
                      return (<TabPanel><Sequencer data={sequencer} emitter={emitter}/></TabPanel>);
                    })}
            </Tabs>;
    } else {
      panel = <div>
               <h1>{"Sequencer"}</h1>
               <p>{"Welcome"}</p>
               <p>{welcomeContent}</p>
               </div>;
    }
    return (<div>{panel}</div>);
  }
});

var sp = document.querySelector('.sp');

function render(data) {
  React.render(<SequencerPanel activeTabIndex={activeTabIndex} data={data} />, sp);
}

render(data);

browser.on('directory', getDirectory)

browser.on('file', function(p, entry) {
  emitter.emit('track:add', {'url': 'http://localhost:8441' + p});
})

function getDirectory(p) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:8441' + p);
  xhr.onloadend = function(ev) {
    var resp = JSON.parse(ev.target.response);
    browser.directory(p, resp);
  }
  xhr.send();
}

function upload(blob, filename) {
  var xhr = new XMLHttpRequest(),
  fd = new FormData();

  fd.append( 'file', blob, filename);
  xhr.open('PUT', '/upload');
  xhr.send(fd);
}

/* things I can upload:
 * - session file
 * - regular old samples (what should the file limit be?)
 * - recordings (what should the length limit be?)
*/

// uploadButton.addEventListener('click', function(ev) {
//   if (globalAudioBlob) {
//     var prefix = new Date().toISOString();
//     upload(globalAudioBlob, prefix + '.wav');
//     upload(canvas2blob(waveEl), prefix + '.png');
//   } else {
//     window.alert('you must record something first');
//   }
// }, false);


browser.appendTo(document.querySelector('.files'));

browser.directory('/', [{
  path: '/industrial',
  type: 'directory'
}])


getDirectory('/');


// tracksource

// bpm tapper: ''