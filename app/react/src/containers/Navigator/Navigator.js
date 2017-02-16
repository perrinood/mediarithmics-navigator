import React, { Component } from 'react';


class Navigator extends Component {

  render() {
    return (
      <div>
        {this.props.children }
      </div>
    );
  }

}

export default Navigator;
