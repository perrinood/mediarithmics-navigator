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
      getConnectedUser
    } = this.props;

    initI18n();

    if (token && !Object.keys(user).length) {
      getConnectedUser();
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
  token: PropTypes.string.isRequired,
  getConnectedUser: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  isReady: state.translationsState.isReady,
  translations: state.translationsState.translations,
  user: state.sessionState.user,
  token: state.persistedState.access_token
});

const mapDispatchToProps = {
  initI18n: i18nActions.initI18n,
  getConnectedUser: sessionActions.getConnectedUser
};

Navigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigator);

export default Navigator;
