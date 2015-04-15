var React = require('react');
var ReactART = require('react-art');
var NumberEditor = require('react-number-editor');
var ColorChooser = require('./color-choose');
var BPMTapper = require('./bpm-tap');
var Surface = ReactART.Surface;
var Text = ReactART.Text;
var audioClock = require('audio-clock');

var Track = require('./track');

module.exports = function(opts) {
  var Sequencer = React.createClass({
  getInitialState: function() {
    return {activeStep: 0};
  },
  updateStep: function() {
    if (this.state.activeStep === 15) {
      this.setState({activeStep: 0});
    } else this.setState({activeStep: this.state.activeStep + 1});

    console.log('tick', this.state.activeStep);
    this.emitter.emit('tick:sequence:'+this.props.data.id, {
      activeStep: this.state.activeStep
    });
  },
  componentDidMount: function() {
    this.emitter = this.props.emitter;
    audioClock.onTick(this.updateStep);
    audioClock.setBPM(this.props.data.bpm);
  },
    randomize: function() {
      this.emitter.emit('random:sequence', {seqId: this.props.data.id});
    },
    play: function() {
      audioClock.start();
    },
    stop: function() {
      audioClock.stop();
    },
  onBpmChange: function(bpm) {
    audioClock.setBPM(bpm);
    this.props.emitter.emit('bpm:sequence', {
      seqId: this.props.data.id,
      bpm: bpm
    });
  },
  render: function() {
    var getTrack = function(key, i) {
      return <Track index={i}
                    trackId={key}
                    seqId={this.props.data.id}
                    activeStep={this.state.activeStep}
                    emitter={this.props.emitter}
                    activeColor={this.props.data.activeColor}
                    track={this.props.data.tracks[key]}/>
    };

    return (
      <div>
      <button class={"btn btn--m btn--gray-border"} onClick={this.play}>Play</button>
      <button class={"btn btn--m btn--gray-border"} onClick={this.stop}>Stop</button>
      <NumberEditor min={0} max={200} step={1} decimals={0}
                    initialValue={this.props.data.bpm}
                    onValueChange={this.onBpmChange} />
      <button class={"btn btn--m btn--gray-border"} onClick={this.randomize}>get random sequence for all tracks</button>
      <ColorChooser seqId={this.props.data.id}
                    activeColor={this.props.activecolor}
                    emitter={this.props.emitter} />

      <BPMTapper seqId={this.props.data.id}
                 bpm={this.props.data.bpm}
                 emitter={this.props.emitter} />
        <div style={{overflowY: "scroll", height: "350px"}}>
      <Surface
        width={1000}
        height={Object.keys(this.props.data.tracks).length * 50}>
        {Object.keys(this.props.data.tracks).map(getTrack, this)}
        </Surface>
        </div>
        </div>
    )
  }
  });

  return Sequencer;
}
