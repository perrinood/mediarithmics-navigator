import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import * as sessionActions from '../../services/session/SessionActions';

export function requireAuthentication(Component) {

  class AuthenticatedComponent extends React.Component {

    componentWillMount() {
      this.checkAuth(this.props.authenticated);
    }

    checkAuth(authenticated) {
      const {
        refreshToken,
        location: {
          pathname,
          search
        },
        getAccessTokens,
        getConnectedUser,
        router
      } = this.props;

      const redirectAfterLogin = `${pathname}${search}`;
      const nextUrl = `${redirectAfterLogin}`;
      const loginUrl = `${PUBLIC_URL}/login?next=${redirectAfterLogin}`; // eslint-disable-line no-undef
      const redirect = (path) => {
        return Promise.resolve(router.replace(path));
      };

      if (refreshToken) {
        if (!authenticated) {
          getAccessTokens()
            .then(getConnectedUser)
            .then(() => redirect(nextUrl))
            .catch(() => redirect(loginUrl));
        }
      } else {
        redirect(loginUrl);
      }

    }

    render() {

      const { authenticated } = this.props;
      const component = authenticated ? <Component {...this.props} /> : null;

      return component;

    }
  }


  AuthenticatedComponent.defaultProps = {
    refreshToken: null
  };

  AuthenticatedComponent.propTypes = {
    authenticated: PropTypes.bool.isRequired,
    refreshToken: PropTypes.string,
    location: PropTypes.shape({
      pathname: PropTypes.string
    }).isRequired,
    getAccessTokens: PropTypes.func.isRequired,
    getConnectedUser: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
  };

  const mapStateToProps = (state) => ({
    authenticated: state.sessionState.authenticated,
    refreshToken: state.persistedState.refresh_token
  });

  const mapDispatchToProps = {
    getAccessTokens: sessionActions.getAccessToken,
    getConnectedUser: sessionActions.getConnectedUser
  };

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(AuthenticatedComponent);

}
