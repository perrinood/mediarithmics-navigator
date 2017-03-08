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
    this.getCurrentWorkspaceId = this.getCurrentWorkspaceId.bind(this);
    this.buildNavigationItems = this.buildNavigationItems.bind(this);
    this.buildWorkspaceItems = this.buildWorkspaceItems.bind(this);
    this.buildProfileItems = this.buildProfileItems.bind(this);
  }

  render() {

    const homeUrl = `${this.getCurrentWorkspaceId()}/campaigns/display`;
    const navigationItems = this.buildNavigationItems();
    const workspaceItems = this.buildWorkspaceItems();
    const profileItems = this.buildProfileItems();

    const logo = {
      url: logoUrl,
      alt: 'mediarithmics'
    };

    const img = {
      url: imgUrl,
      alt: 'profile'
    };

    return <Header homeUrl={homeUrl} navigationItems={navigationItems} workspaceItems={workspaceItems} profileItems={profileItems} logo={logo} img={img} />;

  }

  getCurrentWorkspaceId() {
    const {
      activeWorkspace: {
        organisation_id: organisationId,
        datamart_id: datamartId
      }
    } = this.props;
    return `/o${organisationId}d${datamartId}`;
  }

  buildNavigationItems() {

    const {
      activeWorkspace: {
        organisation_id: organisationId,
        datamart_id: datamartId
      }
    } = this.props;

    const campaignsUrl = `/v2/organisation/${organisationId}${datamartId ? `/datamart/${datamartId}` : ''}/campaign`;
    const currentWorkspaceId = this.getCurrentWorkspaceId();

    const datamartEntries = datamartId ? [
      {
        url: `${currentWorkspaceId}/datamart/segment`,
        label: <FormattedMessage id="AUDIENCE" />
      },
      {
        url: `${currentWorkspaceId}/datamart/categories`,
        label: <FormattedMessage id="CATALOGS" />
      },
    ] : [];

    const testEntries = [
      {
        url: '/v2/login',
        label: <FormattedMessage id="LOGIN" />
      },
      {
        url: campaignsUrl,
        label: <FormattedMessage id="CAMPAIGNS" />,
        activeLinks: [
          '/v2/campaign'
        ]
      }
    ];

    const defaultEntries = [
      {
        url: `${currentWorkspaceId}/campaigns/display`,
        label: <FormattedMessage id="CAMPAIGNS" />
      },
      {
        url: `${currentWorkspaceId}/creatives/display-ad`,
        label: <FormattedMessage id="CREATIVES" />
      },
      {
        url: `${currentWorkspaceId}/library/placementlists`,
        label: <FormattedMessage id="LIBRARY" />
      }
    ];

    return datamartEntries.concat(testEntries).concat(defaultEntries);
  }

  buildWorkspaceItems() {

    const {
      activeWorkspace,
      workspaces,
      switchWorkspace
    } = this.props;

    const getLabel = workspace => `${workspace.organisationName} ${activeWorkspace.datarmartName ? `[${activeWorkspace.datarmartName}]` : ''}`;

    const getActiveWorkespace = () => {
      return {
        label: getLabel(activeWorkspace),
        onClick: () => {}
      };
    };

    const getWorkspaceItems = () => workspaces.map(workspace => {

      const isActive = workspace.organisationId === activeWorkspace.organisationId;

      return {
        label: getLabel(workspace),
        onClick: isActive ? () => {} : () => switchWorkspace(workspace),
        isActive
      };

    });

    return {
      activeWorkspace: getActiveWorkespace(),
      workspaces: getWorkspaceItems()
    };
  }

  buildProfileItems() {

    const {
      authenticated,
      user,
      logout,
      router
    } = this.props;

    const loginUrl = `${PUBLIC_URL}/login`; // eslint-disable-line no-undef

    const redirect = url => {
      return router.replace(url);
    };

    const login = () => {
      return redirect(loginUrl);
    };

    const loginItem = {
      label: <p><FormattedMessage id="LOGIN" /></p>,
      onClick: login
    };

    const logoutItem = {
      label: <p><FormattedMessage id="LOGOUT" /></p>,
      onClick: () => {
        logout();
        return redirect(loginUrl);
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
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  workspaces: PropTypes.arrayOf(PropTypes.object).isRequired,
  authenticated: PropTypes.bool.isRequired,
  switchWorkspace: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  authenticated: state.sessionState.authenticated,
  user: state.sessionState.user,
  activeWorkspace: state.sessionState.activeWorkspace,
  workspaces: state.sessionState.workspaces
});

const mapDispatchToProps = {
  switchWorkspace: sessionActions.switchWorkspace,
  logout: sessionActions.logout
};

NavigatorHeader = connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigatorHeader);

export default NavigatorHeader;
