var React = require('react');
var Modal = require('react-modal');
var ColorPlane = require('colorplane-react');

Modal.setAppElement(document.body);
Modal.injectCSS();

var ColorPicker = React.createClass({
  getInitialState: function() {
    return { modalIsOpen: false };
  },

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  colorChange: function(color) {
    this.props.emitter.emit('colorset:sequence', {
      seqId: this.props.seqId,
      activeColor: color
    });
  },
  render: function() {
    return (
      <div style={{display: "inline"}}>
        <button onClick={this.openModal}>Open Modal</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}>
          <div class="settings">
           <i onClick={this.closeModal}>X</i>
          <ColorPlane color={this.props.activeColor} onChange={this.colorChange}/>
          </div>
        </Modal>
      </div>
    );
  }
});

module.exports = ColorPicker;