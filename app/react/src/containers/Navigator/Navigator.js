import React, { Component } from 'react';


class Navigator extends Component {

  render() {

    const onClick = () => window.location.assign('/#/v2/campaign');
    console.log(this.props);
    console.log(this.props.children);

    return (
      <div>
        <button onClick={onClick} >click</button>
        {this.props.children }
      </div>
    );
  }

}

export default Navigator;
