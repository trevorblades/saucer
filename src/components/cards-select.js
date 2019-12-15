import LabeledSelect from './labeled-select';
import PaymentMethod from './payment-method';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {Link} from 'gatsby';
import {MenuItem} from '@material-ui/core';

export default function CardsSelect({cards, ...props}) {
  const [source, setSource] = useState(
    cards.length ? cards.find(card => card.isDefault).id : ''
  );

  function handleSourceChange(event) {
    // avoid a warning when the "add card" link is clicked (no value)
    const {value} = event.target;
    if (value) {
      setSource(value);
    }
  }

  return (
    <LabeledSelect
      label="Payment method"
      value={source}
      onChange={handleSourceChange}
      {...props}
    >
      <MenuItem component={Link} to="/dashboard/billing">
        Add a new card
      </MenuItem>
      {cards.map(card => (
        <MenuItem key={card.id} value={card.id}>
          <PaymentMethod card={card} />
        </MenuItem>
      ))}
    </LabeledSelect>
  );
}

CardsSelect.propTypes = {
  cards: PropTypes.array.isRequired
};
