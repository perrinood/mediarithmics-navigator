import React, { Component } from 'react';

class TemporaryView extends Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

export default TemporaryView;
