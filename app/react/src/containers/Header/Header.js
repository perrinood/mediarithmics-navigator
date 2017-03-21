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

    const {
      authenticated,
      isVisible
    } = this.props;

    const homeUrl = authenticated ? `${this.getCurrentWorkspaceId()}/campaigns/display` : '';
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

    return isVisible ? <Header homeUrl={homeUrl} navigationItems={navigationItems} workspaceItems={workspaceItems} profileItems={profileItems} logo={logo} img={img} /> : null;

  }

  getCurrentWorkspaceId() {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      }
    } = this.props;
    return `/o${organisationId}d${datamartId}`;
  }

  buildNavigationItems() {

    const {
      activeWorkspace: {
        // organisationId,
        datamartId
      },
      location: {
        pathname
      },
      authenticated
    } = this.props;

    const currentWorkspaceId = this.getCurrentWorkspaceId();

    /*
      To add a new link to the navbar use an object with the property active.
      Use isActiveUrl function by passing the path of the route.
      The property is used by the NavLink component to apply an active class to the element.
    */
    const isActiveUrl = path => pathname.search(path) >= 0; // eslint-disable-line no-unused-vars

    const datamartEntries = datamartId ? [
      {
        url: `${currentWorkspaceId}/datamart/segments`,
        label: <FormattedMessage id="AUDIENCE" />
      },
      {
        url: `${currentWorkspaceId}/datamart/categories`,
        label: <FormattedMessage id="CATALOGS" />
      },
    ] : [];

    const reactEntries = [
      /*
        To test until a real link is implemented
        const campaignsUrl = `/v2/organisation/${organisationId}${datamartId ? `/datamart/${datamartId}` : ''}/campaigns`;
        {
          url: campaignsUrl,
          label: <FormattedMessage id="CAMPAIGNS" />,
          active: isActiveUrl('campaigns'),
        }
      */
    ];

    const angularEntries = [
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

    return authenticated ? datamartEntries.concat(reactEntries).concat(angularEntries) : [];
  }

  buildWorkspaceItems() {

    const {
      activeWorkspace,
      workspaces,
      switchWorkspace
    } = this.props;

    const getLabel = workspace => `${workspace.organisationName} ${workspace.datamartName ? `[${workspace.datamartName}]` : ''}`;

    const getActiveWorkespace = () => {
      return {
        label: getLabel(activeWorkspace),
        onClick: () => {}
      };
    };

    const getWorkspaceItems = () => workspaces.map(workspace => {

      const isActive = (workspace.organisationId === activeWorkspace.organisationId) && (workspace.role === activeWorkspace.role) && (workspace.datamartId === activeWorkspace.datamartId);

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
        // should use redirect(loginUrl) later
        window.location = '/#/logout'; // eslint-disable-line no-undef
      }
    };

    const account = {
      label: <p><FormattedMessage id="ACCOUNT_SETTINGS" /></p>,
      onClick: () => {
        window.location = `/#${this.getCurrentWorkspaceId()}/settings/useraccount`; // eslint-disable-line no-undef
      }
    };

    const userItem = user ? { label: <p>{user.email}</p> } : null;
    const accountItem = user ? account : null;
    const authenticatedItem = authenticated ? logoutItem : loginItem;

    return [
      userItem,
      accountItem,
      authenticatedItem
    ];

  }

}

NavigatorHeader.propTypes = {
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  workspaces: PropTypes.arrayOf(PropTypes.object).isRequired,
  isVisible: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  switchWorkspace: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  authenticated: state.sessionState.authenticated,
  user: state.sessionState.user,
  activeWorkspace: state.sessionState.activeWorkspace,
  workspaces: state.sessionState.workspaces,
  isVisible: state.headerState.isVisible
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
