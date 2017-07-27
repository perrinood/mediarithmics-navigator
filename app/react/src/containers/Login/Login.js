import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import Button from 'mcs-react-button';
import Alert from 'mcs-react-alert';

import * as loginActions from './redux/LoginActions';
import * as sessionActions from '../../services/session/SessionActions';

import { Input } from '../../components/Forms';


class Login extends Component {

  constructor(props) {
    super(props);
    this.submitCredentials = this.submitCredentials.bind(this);
  }

  componentWillUnmount() {
    this.props.resetLogin();
  }

  /**
   * Rendering
   */
  render() {

    const {
      translations,
      handleSubmit,
      loginState: { error }
     } = this.props;

    const submitCredentials = this.submitCredentials;

    const errorMsg = error ? <Alert type="danger" text={<FormattedMessage id={error} />} /> : null;

    return (
      <div className="container">

        <form className="mcs-form-signin" role="form" onSubmit={handleSubmit(submitCredentials)}>

          <div className="form-group">
            { errorMsg }
          </div>

          <div className="form-group">
            <label htmlFor="loginEmail">
              <FormattedMessage id="EMAIL_ADDRESS" />
            </label>
            <Input name="email" placeholder={translations.EMAIL_PLACEHOLDER} />
          </div>
          <div>
            <label htmlFor="loginPassword">
              <FormattedMessage id="EMAIL_ADDRESS" />
            </label>
            <Input name="password" type="password" placeholder={translations.PASSWORD_PLACEHOLDER} />
          </div>
          <div className="row">
            <div className="col-lg-offset-6 col-lg-6">
              <Link className="text-right" to="/request-password-reset">
                <FormattedMessage id="FORGOT_PASSWORD" />
              </Link>
            </div>
          </div>
          <Button action="finish" type="submit">
            <FormattedMessage id="SUBMIT" />
          </Button>
        </form>

      </div>
    );
  }

  submitCredentials(credentialsForm) {

    const {
     refreshToken,
     getAccessToken,
     getConnectedUser,
     location: {
       query: {
         next
       }
     },
     router
    } = this.props;

    const redirect = () => {

      const {
        activeWorkspace: {
          organisationId,
          datamartId
        }
      } = this.props;

      const redirectUrl = `o${organisationId}d${datamartId}/campaigns/display`;
      const nextUrl = next ? next : redirectUrl;
      router.push(nextUrl);
    };

    refreshToken(credentialsForm)
      .then(getAccessToken)
      .then(getConnectedUser)
      .then(redirect);

  }

}

Login.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  loginState: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.shape({
    query: PropTypes.shape({
      next: PropTypes.string
    })
  }).isRequired,
  refreshToken: PropTypes.func.isRequired,
  resetLogin: PropTypes.func.isRequired,
  getAccessToken: PropTypes.func.isRequired,
  getConnectedUser: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations,
  loginState: state.loginState,
  activeWorkspace: state.sessionState.activeWorkspace
});

const mapDispatchToProps = {
  refreshToken: loginActions.refreshToken,
  resetLogin: loginActions.resetLogin,
  getAccessToken: sessionActions.getAccessToken,
  getConnectedUser: sessionActions.getConnectedUser
};

Login = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

Login = reduxForm({
  form: 'credentialsForm'
})(Login);

export default Login;
