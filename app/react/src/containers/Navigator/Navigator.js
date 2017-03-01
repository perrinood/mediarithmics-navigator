import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import Loading from 'mcs-react-loading';

import * as i18nActions from '../../services/i18n/i18nActions';

class Navigator extends Component {

  componentDidMount() {

    const {
      initI18n
    } = this.props;

    initI18n();

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
        { this.props.children }
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
  initI18n: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  isReady: state.translationsState.isReady,
  translations: state.translationsState.translations
});

const mapDispatchToProps = {
  initI18n: i18nActions.initI18n
};

Navigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigator);

export default Navigator;
