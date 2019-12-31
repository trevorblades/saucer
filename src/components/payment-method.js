import PropTypes from 'prop-types';
import React from 'react';
import amexIcon from 'payment-icons/min/flat/amex.svg';
import defaultIcon from 'payment-icons/min/flat/default.svg';
import mastercardIcon from 'payment-icons/min/flat/mastercard.svg';
import visaIcon from 'payment-icons/min/flat/visa.svg';
import {Box} from '@material-ui/core';

function getIconForBrand(brand) {
  switch (brand) {
    case 'Visa':
      return visaIcon;
    case 'MasterCard':
      return mastercardIcon;
    case 'American Express':
      return amexIcon;
    default:
      return defaultIcon;
  }
}

export default function PaymentMethod(props) {
  const {brand, last4} = props.card;
  return (
    <Box display="flex" alignItems="center" component="span">
      <Box
        component="img"
        src={getIconForBrand(brand)}
        width="2em"
        title={brand}
      />
      <Box component="span" mx={2} style={{letterSpacing: 1}}>
        xxxx {last4}
      </Box>
      {props.children}
    </Box>
  );
}

PaymentMethod.propTypes = {
  card: PropTypes.object.isRequired,
  children: PropTypes.node
};
