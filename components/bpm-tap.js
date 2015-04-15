var React = require('react');
var Modal = require('react-modal');
var BPMTap = require('react-bpm');

Modal.setAppElement(document.body);
Modal.injectCSS();

var BPMTapper = React.createClass({
  getInitialState: function() {
    return { modalIsOpen: false };
  },

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  bpmChange: function(bpm) {
    this.props.emitter.emit('bpm:sequence', {
      seqId: this.props.seqId,
      bpm: bpm
    });
  },
  render: function() {
    return (
      <div style={{display: "inline"}}>
        <button onClick={this.openModal}>Tap BPM</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}>
          <div class="settings">
           <i onClick={this.closeModal}>X</i>
        <p>{"hey, wait, what the fuck"}</p>
          </div>
        </Modal>
      </div>
    );
  }
});

module.exports = BPMTapper;
// <BPMTap bpm={this.props.bpm} onChange={this.bpmChange}/>
