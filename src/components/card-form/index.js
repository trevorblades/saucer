import PropTypes from 'prop-types';
import React, {useState} from 'react';
import StripeInput from './stripe-input';
import payment from '../../assets/payment.png';
import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControlLabel,
  TextField,
  Typography,
  useTheme
} from '@material-ui/core';
import {CARD_FRAGMENT, LIST_CARDS} from '../../utils';
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
          cards: [data.createCard, ...existingCards].sort(
            (a, b) => b.isDefault - a.isDefault
          )
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
        <Box
          component="img"
          height={200}
          display="block"
          mx="auto"
          src={payment}
        />
        <Typography paragraph variant="h5" align="center">
          Add a credit card
        </Typography>
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
          disabled={isLoading || props.isDefault}
          control={
            <Checkbox name="isDefault" defaultChecked={props.isDefault} />
          }
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
