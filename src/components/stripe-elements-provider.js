import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {Elements, StripeProvider} from 'react-stripe-elements';

export default function StripeElementsProvider(props) {
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    if (window.Stripe) {
      initStripe();
    } else {
      document.querySelector('#stripe-js').addEventListener('load', initStripe);
    }
  }, []);

  function initStripe() {
    setStripe(window.Stripe(process.env.GATSBY_STRIPE_PUBLISHABLE_KEY_DEV));
  }

  return (
    <StripeProvider stripe={stripe}>
      <Elements>{props.children}</Elements>
    </StripeProvider>
  );
}

StripeElementsProvider.propTypes = {
  children: PropTypes.node.isRequired
};
