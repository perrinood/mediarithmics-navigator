import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';

import CampaignsSidebar from './CampaignsSidebar';

class Campaigns extends Component {

  render() {
    return (
      <div>
        <CampaignsSidebar {...this.props} />
        <div className="mcs-content-with-sidebar">
          { this.props.children || <FormattedMessage id="CAMPAIGN_COMPONENT" /> }
        </div>
      </div>
    );
  }
}

export default Campaigns;
