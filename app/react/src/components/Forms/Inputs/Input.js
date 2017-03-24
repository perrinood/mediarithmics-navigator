import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';
import classNames from 'classnames';

import InternalInput from './InternalInput';

class Input extends Component {

  render() {

    const {
      defaultInputClassNames,
      inputClassNames,
      ...other
    } = this.props;

    const inputClass = classNames(defaultInputClassNames, inputClassNames);

    return (
      <Field component={InternalInput} className={inputClass} {...other} />
    );

  }

}

Input.defaultProps = {
  defaultInputClassNames: ['form-control'],
  inputClassNames: []
};

Input.propTypes = {
  defaultInputClassNames: PropTypes.arrayOf(PropTypes.string),
  inputClassNames: PropTypes.arrayOf(PropTypes.string)
};

export default Input;
