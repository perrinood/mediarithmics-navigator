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
      params: {
        organisationId,
        datamartId
      },
      getConnectedUser,
      initWorkspace
    } = this.props;

    initI18n();

    if (token && !Object.keys(user).length) {
      getConnectedUser()
        .then(() => initWorkspace(organisationId, datamartId));
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
  locale: 'en'
};

Navigator.propTypes = {
  isReady: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  initI18n: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  params: PropTypes.shape({
    organisationId: PropTypes.string,
    datamartId: PropTypes.string,
  }).isRequired,
  token: PropTypes.string.isRequired,
  getConnectedUser: PropTypes.func.isRequired,
  initWorkspace: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isReady: state.translationsState.isReady,
  translations: state.translationsState.translations,
  user: state.sessionState.user,
  activeWorkspace: state.sessionState.activeWorkspace,
  token: state.persistedState.access_token
});

const mapDispatchToProps = {
  initI18n: i18nActions.initI18n,
  getConnectedUser: sessionActions.getConnectedUser,
  initWorkspace: sessionActions.initWorkspace
};

Navigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigator);

export default Navigator;
