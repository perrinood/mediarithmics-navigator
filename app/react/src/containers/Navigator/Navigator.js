import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import Loading from 'mcs-react-loading';

import { NavigatorHeader } from '../Header';

import * as i18nActions from '../../services/i18n/i18nActions';
import * as sessionActions from '../../services/session/SessionActions';

class Navigator extends Component {

  constructor(props) {
    super(props);
    this.validateUrl = this.validateUrl.bind(this);
    this.initWorkspace = this.initWorkspace.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      user
    } = this.props;

    const {
      activeWorkspace: nextActiveWorkspace,
      params: nextParams,
      user: nextUser
    } = nextProps;

    if (user.id || user.id !== nextUser.id) {
      if (nextParams.organisationId) {
        if (nextParams.organisationId !== nextActiveWorkspace.organisationId) {
          const workspace = {
            organisationId: nextParams.organisationId,
            datamartId: nextParams.datamartId
          };
          this.initWorkspace(workspace);
        } else if (nextParams.datamartId !== nextActiveWorkspace.datamartId) {
          this.validateUrl();
        }
      }
    }
  }

  componentDidMount() {

    const {
      initI18n,
      params,
      getConnectedUser
    } = this.props;

    const workspace = {
      organisationId: params.organisationId,
      datamartId: params.datamartId
    };

    const retrieveUser = () => {
      return getConnectedUser()
        .then(() => this.initWorkspace(workspace));
    };

    initI18n();

    // todo remove later
    // as the angular app will be bootstraped first, we need to know if the user has logged in through the angular app
    window.addEventListener('core/login/constants/LOGIN_SUCCESS', () => { // eslint-disable-line no-undef
      retrieveUser();
    }, false);

  }

  render() {

    const {
      isReady,
      locale,
      translations
    } = this.props;

    if (!isReady) {
      return <Loading />;
    }

    return (
      <IntlProvider locale={locale} key={locale} messages={translations}>
        <div>
          <NavigatorHeader {...this.props} />
          {this.props.children}
        </div>
      </IntlProvider>
    );
  }

  initWorkspace(workspace) {

    const {
      getWorkspaces,
      initActiveWorkspace
    } = this.props;

    console.log(workspace);

    return getWorkspaces(workspace)
      .then(() => initActiveWorkspace(workspace))
      .then(() => this.validateUrl());

  }

  validateUrl() {

    const {
      activeWorkspace,
      checkUrl,
      location: {
        pathname
      },
      router
    } = this.props;

    checkUrl(pathname);

    const {
      isReactUrl
    } = this.props;

    const datamartPart = activeWorkspace.datamartId ? `/datamart/${activeWorkspace.datamartId}` : '';
    const url = `${PUBLIC_URL}/organisation/${activeWorkspace.organisationId}${datamartPart}/campaigns`; // eslint-disable-line no-undef

    if (isReactUrl) {
      router.replace(url);
    }
  }

}

Navigator.defaultProps = {
  locale: 'en',
  token: null
};

Navigator.propTypes = {
  isReady: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  initI18n: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isReactUrl: PropTypes.bool.isRequired,
  params: PropTypes.shape({
    organisationId: PropTypes.string,
    datamartId: PropTypes.string,
  }).isRequired,
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  getConnectedUser: PropTypes.func.isRequired,
  getWorkspaces: PropTypes.func.isRequired,
  initActiveWorkspace: PropTypes.func.isRequired,
  checkUrl: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  isReady: state.translationsState.isReady,
  translations: state.translationsState.translations,
  user: state.sessionState.user,
  activeWorkspace: state.sessionState.activeWorkspace,
  isReactUrl: state.sessionState.isReactUrl,
  token: state.persistedState.access_token
});

const mapDispatchToProps = {
  initI18n: i18nActions.initI18n,
  getConnectedUser: sessionActions.getConnectedUser,
  getWorkspaces: sessionActions.getWorkspaces,
  initActiveWorkspace: sessionActions.initActiveWorkspace,
  checkUrl: sessionActions.checkUrl
};

Navigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigator);

export default Navigator;
