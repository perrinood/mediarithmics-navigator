import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Header from 'mcs-react-header';

import * as sessionActions from '../../services/session/SessionActions';

import logoUrl from '../../assets/images/mediarithmics-small-white.png';
import imgUrl from '../../assets/images/user.svg';

class NavigatorHeader extends Component {

  constructor(props) {
    super(props);
    this.buildNavigationItems = this.buildNavigationItems.bind(this);
    this.buildProfileItems = this.buildProfileItems.bind(this);
  }

  render() {

    const navigationItems = this.buildNavigationItems();
    const profileItems = this.buildProfileItems();

    const logo = {
      url: logoUrl,
      alt: 'mediarithmics'
    };

    const img = {
      url: imgUrl,
      alt: 'profile'
    };

    return <Header navigationItems={navigationItems} profileItems={profileItems} logo={logo} img={img} />;

  }

  buildNavigationItems() {
    // todo retrieve organiation and/or datamart from workspace
    return [
      {
        url: '/v2/login',
        label: <FormattedMessage id="CAMPAIGNS" />
      },
      {
        url: '/v2/campaign',
        label: <FormattedMessage id="CAMPAIGNS" />
      },
      {
        url: '/o1dundefined/campaigns/display',
        label: <FormattedMessage id="CAMPAIGNS" />
      },
      {
        url: '/o1dundefined/creatives/display-ad',
        label: <FormattedMessage id="CREATIVES" />
      },
      {
        url: '/o1dundefined/library/placementlists',
        label: <FormattedMessage id="LIBRARY" />
      }
    ];
  }

  buildProfileItems() {

    const {
      authenticated,
      user,
      logout,
      router
    } = this.props;

    const redirect = url => {
      return router.replace(url);
    };

    const login = () => {
      return redirect('/login');
    };

    const loginItem = {
      label: <p><FormattedMessage id="LOGIN" /></p>,
      onClick: login
    };

    const logoutItem = {
      label: <p><FormattedMessage id="LOGOUT" /></p>,
      onClick: () => {
        logout();
        return redirect('/login');
      }
    };

    const userItem = user ? { label: <p>{user.email}</p> } : null;
    const authenticatedItem = authenticated ? logoutItem : loginItem;

    return [
      userItem,
      authenticatedItem
    ];

  }

}

NavigatorHeader.propTypes = {
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  authenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  authenticated: state.sessionState.authenticated,
  user: state.sessionState.user
});

const mapDispatchToProps = {
  logout: sessionActions.logout
};

NavigatorHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigatorHeader);

export default NavigatorHeader;
