import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import Loading from 'mcs-react-loading';

import { NavigatorHeader } from '../Header';

import * as i18nActions from '../../services/i18n/i18nActions';
import * as sessionActions from '../../services/session/SessionActions';

class Navigator extends Component {

  componentDidMount() {

    const {
      initI18n,
      user,
      token,
      params,
      location: {
        pathname
      },
      router,
      getConnectedUser,
      initWorkspace
    } = this.props;

    const validateUrl = () => {

      const {
        checkUrl
      } = this.props;

      checkUrl(pathname);

      const {
        isReactUrl
      } = this.props;

      const {
        activeWorkspace: {
          organisationId,
          datamartId
        }
      } = this.props;

      if (isReactUrl && params.organisationId !== organisationId) {
        const redirectUrl = `o${organisationId}d${datamartId}/campaigns/display`;
        router.push(redirectUrl);
      }

    };

    const retrieveUser = () => {
      return getConnectedUser()
        .then(() => initWorkspace(params.organisationId, params.datamartId))
        .then(validateUrl);
    };

    initI18n();

    if (token && !Object.keys(user).length) {
      retrieveUser();
    } else {
      // todo remove later
      // as the angular app will be bootstraped first, we need to know if the user has logged in through the angular app
      window.addEventListener('core/login/constants/LOGIN_SUCCESS', () => { // eslint-disable-line no-undef
        retrieveUser();
      }, false);
    }

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
  token: PropTypes.string,
  getConnectedUser: PropTypes.func.isRequired,
  initWorkspace: PropTypes.func.isRequired,
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
  initWorkspace: sessionActions.initWorkspace,
  checkUrl: sessionActions.checkUrl
};

Navigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigator);

export default Navigator;
