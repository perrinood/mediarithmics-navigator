import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import Loading from 'mcs-react-loading';
import Header from 'mcs-react-header';

import * as i18nActions from '../../services/i18n/i18nActions';

import logoUrl from '../../assets/images/mediarithmics-small-white.png';
import imgUrl from '../../assets/images/user.svg';

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

    // todo retrieve organiation and/or datamard from workspace
    const navigationItems = [
      {
        url: '/o1dundefined/campaigns/display',
        label: translations.CAMPAIGNS
      },
      {
        url: '/o1dundefined/creatives/display-ad',
        label: translations.CREATIVES
      },
      {
        url: '/o1dundefined/library/placementlists',
        label: translations.LIBRARY
      }
    ];

    const profileItems = [];

    const logo = {
      url: logoUrl,
      alt: 'mediarithmics'
    };

    const img = {
      url: imgUrl,
      alt: 'profile'
    };

    if (!isReady) {
      return <Loading />;
    }

    return (
      <IntlProvider locale={locale} key={locale} messages={translations}>
        <div>
          <Header navigationItems={navigationItems} profileItems={profileItems} logo={logo} img={img} />
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
