import PropTypes from 'prop-types';
import React, {useImperativeHandle} from 'react';
import {CardElement} from 'react-stripe-elements';

export default function StripeInput({inputRef, ...props}) {
  useImperativeHandle(inputRef, () => ({
    focus() {
      // logic to focus the rendered component from 3rd party belongs here
      // see https://material-ui.com/components/text-fields#integration-with-3rd-party-input-libraries
    }
  }));

  return <CardElement {...props} />;
}

StripeInput.propTypes = {
  inputRef: PropTypes.func.isRequired
};
