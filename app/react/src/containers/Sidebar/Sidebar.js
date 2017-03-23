import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

class Sidebar extends Component {

  render() {

    const {
      isVisible,
      items
    } = this.props;


    const buildSidebarItems = () => {
      return items.map((item, index) => {
        return <li className={item.isActive ? 'active' : ''} key={index.toString()}>{ item.element }</li>;
      });
    };

    const content = (
      <div className="mcs-sidebar">
        <div className="mcs-sidebar-background" />
        <div className="mcs-sidebar-content">
          <ul className="mcs-lm-nav mcs-lm-nav-pills mcs-lm-nav-stacked">
            { buildSidebarItems() }
          </ul>
        </div>
      </div>
    );

    return isVisible ? content : null;

  }

}

Sidebar.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  isVisible: state.sidebarState.isVisible
});

const mapDispatchToProps = {};

Sidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);

export default Sidebar;
