import DialogHeader from '../dialog-header';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import StripeInput from './stripe-input';
import upgrade from '../../assets/upgrade.png';
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  TextField,
  useTheme
} from '@material-ui/core';
import {CARD_FRAGMENT, LIST_CARDS, sortByDefault} from '../../utils';
import {gql, useMutation} from '@apollo/client';
import {injectStripe} from 'react-stripe-elements';

const CREATE_CARD = gql`
  mutation CreateCard($source: String!, $isDefault: Boolean) {
    createCard(source: $source, isDefault: $isDefault) {
      ...CardFragment
    }
  }
  ${CARD_FRAGMENT}
`;

function CardForm(props) {
  const {typography, palette} = useTheme();
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);
  const [createCard, {loading, error}] = useMutation(CREATE_CARD, {
    onCompleted: props.onCompleted,
    update(cache, {data}) {
      const {cards} = cache.readQuery({
        query: LIST_CARDS
      });

      const existingCards = data.createCard.isDefault
        ? cards.map(card => ({
            ...card,
            isDefault: false
          }))
        : cards;

      cache.writeQuery({
        query: LIST_CARDS,
        data: {
          cards: [data.createCard, ...existingCards].sort(sortByDefault)
        }
      });
    }
  });

  async function handleSubmit(event) {
    event.preventDefault();

    setStripeLoading(true);
    if (stripeError) {
      setStripeError(null);
    }

    const {isDefault} = event.target;
    const {token, error} = await props.stripe.createToken();
    if (error) {
      setStripeError(error);
    } else {
      createCard({
        variables: {
          source: token.id,
          isDefault: isDefault.checked
        }
      });
    }

    setStripeLoading(false);
  }

  const isLoading = stripeLoading || loading;
  const allError = stripeError || error;
  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        <DialogHeader image={upgrade}>Add a credit card</DialogHeader>
        {allError && (
          <DialogContentText color="error">
            {allError.message}
          </DialogContentText>
        )}
        <TextField
          fullWidth
          margin="normal"
          label="Your payment information"
          disabled={isLoading}
          InputLabelProps={{shrink: true}}
          InputProps={{inputComponent: StripeInput}}
          inputProps={{
            style: {
              base: {
                fontFamily: typography.fontFamily,
                fontSize: '16px',
                color: palette.text.primary
              }
            }
          }}
        />
        <FormControlLabel
          name="isDefault"
          disabled={isLoading || props.isDefault}
          control={<Checkbox defaultChecked={props.isDefault} />}
          label="Set as default payment method"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button disabled={isLoading} type="submit" color="primary">
          Add card
        </Button>
      </DialogActions>
    </form>
  );
}

CardForm.propTypes = {
  stripe: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  isDefault: PropTypes.bool.isRequired,
  onCompleted: PropTypes.func.isRequired
};

export default injectStripe(CardForm);
