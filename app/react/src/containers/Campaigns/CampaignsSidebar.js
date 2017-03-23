import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { Sidebar } from '../Sidebar';

class CampaignsSidebar extends Component {

  render() {

    const {
      activeWorkspace: {
        workspaceId
      },
      location: {
        pathname
      }
    } = this.props;

    const isActiveUrl = path => pathname.search(path) >= 0; // eslint-disable-line no-unused-vars

    const items = [
      {
        element: <a href={`#/${workspaceId}/campaigns/display`}>Display Campaigns</a>,
        isActive: isActiveUrl(new RegExp(/display|[^(email|scenarios|goals)]/))
      },
      {
        element: <a href={`#/${workspaceId}/campaigns/email`}>Email Campaigns</a>,
        isActive: isActiveUrl('email')
      },
      {
        element: <a href={`#/${workspaceId}/library/scenarios`}>Scenarios</a>,
        isActive: isActiveUrl('scenarios')
      },
      {
        element: <a href={`#/${workspaceId}/library/goals`}>Goals</a>,
        isActive: isActiveUrl('goals')
      }
    ];

    return <Sidebar items={items} />;
  }

}

CampaignsSidebar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  activeWorkspace: state.sessionState.activeWorkspace,
});

const mapDispatchToProps = {};

CampaignsSidebar = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsSidebar);

export default CampaignsSidebar;
