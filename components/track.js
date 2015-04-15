var React = require('react');
var ReactART = require('react-art');
var Colr = require('colr');
var colr = new Colr();
var Rect = require('react-art/shapes/rectangle');
var Text = ReactART.Text;
var Shape = ReactART.Shape;
var Group = ReactART.Group;
var Transform = ReactART.Transform;

var SCALE_FOUR = new Transform().scale(0.04);
var SCALE_SEVEN = new Transform().scale(0.07);

var PLAY_D="M86.563,475.059c-1.727,0-3.453-0.446-5-1.34c-3.094-1.786-5-5.088-5-8.66V52.978c0-3.572,1.906-6.874,5-8.66" +
	"c3.094-1.787,6.906-1.787,10,0l356.873,206.04c3.094,1.786,5,5.088,5,8.66s-1.906,6.874-5,8.66L91.563,473.719" +
	"C90.017,474.613,88.29,475.059,86.563,475.059z M96.563,70.298v377.44l326.873-188.721L96.563,70.298z";

var RubbishIcon = require('./rubbish-react');

var Sequence = React.createClass({
  componentDidMount: function() {
    this.emitter = this.props.emitter;
  },
  setActivation: function(ev) {
    var idx = [].indexOf.call(ev.target.parentNode.parentNode.children, ev.target.parentNode);
    idx--;
    if (this.props.seq[idx]) {
      this.emitter.emit('deactivate:sequence', {
        id: this.props.trackId,
        seq: this.props.seq,
        seqId: this.props.seqId,
        index: idx
      });
    } else {
      this.emitter.emit('activate:sequence', {
        id: this.props.trackId,
        seq: this.props.seq,
        seqId: this.props.seqId,
        index: idx
      });
    }
  },
  getFill: function(idx) {
    var fillColor = "rgba(0, 0, 0, 0)";
    var active = this.props.seq[idx]
    var isActiveStep = this.props.activeStep === idx;
    if(active) {
      fillColor = this.props.activeColor;
      if (isActiveStep) fillColor = Colr.fromHex(fillColor).lighten(10).toHex();
    } else if (isActiveStep) {
      fillColor = Colr.fromHex(this.props.activeColor).lighten(20).toHex();
      console.log(fillColor);
    }
    return fillColor;
  },
  render: function() {
    var getRect = function(seq, i) {
      return (
          <Group onClick={this.setActivation} x={(i * 50)}>
          <Rect height={50} width={50}
                style={{cursor: 'pointer'}}
                fill={this.getFill(i)}
                stroke={"#000000"}/>
          </Group>);
    };
    return (
        <Group y={this.props.y} x={this.props.x}>
        {this.props.seq.map(getRect, this)}
      </Group>
    )
  }
});

var Control = React.createClass({
  getInitialState: function() {
    return {activeStep: 0};
  },
  updateStep: function(obj) {
    this.setState({activeStep: obj.activeStep});
    if (this.props.seq[this.state.activeStep]) this.preview();
  },
  componentDidMount: function() {
    this.emitter = this.props.emitter;
    this.emitter.on('tick:sequence:'+this.props.seqId, this.updateStep);
  },
  preview: function(ev) {
    this.emitter.emit('preview:sequence', {
      id: this.props.trackId,
      seq: this.props.seq,
      seqId: this.props.seqId
    });
  },
  remove: function(ev) {
    this.emitter.emit('remove:sequence', {
      id: this.props.trackId,
      seq: this.props.seq,
      seqId: this.props.seqId
    });
  },
  render: function() {
    return (
        <Group y={this.props.y}>
          <Text fill={"#000"} x={5} y={15} fontFamily={"Verdana"} fontSize={"55"}>{this.props.title}</Text>
          <Rect stroke={"#000000"} height={50} width={200} />
        <Group onClick={this.preview} x={120} y={8}>
          <Rect stroke={"rgba(0, 0, 0, 0,)"} fill={"rgba(0, 0, 0, 0,)"} height={30} width={30} />
          <Shape transform={SCALE_SEVEN} d={PLAY_D} fill={"#000000"}/>
        </Group>
          <Group onClick={this.remove} x={160} y={10}>
            <Rect stroke={"rgba(0, 0, 0, 0,)"} fill={"rgba(0, 0, 0, 0,)"} height={30} width={30} />
            <RubbishIcon transform={SCALE_FOUR} fill={"#000000"} />
          </Group>
        </Group>
    )
  }
});

var Track = React.createClass({
  render: function() {
    return (
        <Group>
        <Control title={this.props.track.title}
                 y={this.props.index * 50}
                 trackId={this.props.trackId}
                 seq={this.props.track.sequence}
                 seqId={this.props.seqId}
                 emitter={this.props.emitter}/>
        <Sequence seq={this.props.track.sequence}
                  emitter={this.props.emitter}
                  x={200}
                  activeStep={this.props.activeStep}
                  y={this.props.index * 50}
                  trackId={this.props.trackId}
                  activeColor={this.props.activeColor}
                  seqId={this.props.seqId} />
        </Group>
    )
  }
});

module.exports = Track;