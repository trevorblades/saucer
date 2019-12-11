import PropTypes from 'prop-types';
import React, {useState} from 'react';
import StripeInput from './stripe-input';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  useTheme
} from '@material-ui/core';
import {gql, useMutation} from '@apollo/client';
import {injectStripe} from 'react-stripe-elements';

const CREATE_CARD = gql`
  mutation CreateCard($source: String) {
    createCard(source: $source) {
      id
    }
  }
`;

function CardForm(props) {
  const {typography, palette} = useTheme();
  const [stripeLoading, setStripeLoading] = useState(false);
  const [createCard, {loading, error}] = useMutation(CREATE_CARD);

  async function handleSubmit(event) {
    event.preventDefault();
    setStripeLoading(true);

    const {token} = await props.stripe.createToken();
    if (token) {
      createCard({
        variables: {
          source: token.id
        }
      });
    }

    setStripeLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Add a card</DialogTitle>
      <DialogContent>
        {error && (
          <DialogContentText color="error">{error.message}</DialogContentText>
        )}
        <TextField
          fullWidth
          margin="normal"
          label="Your payment information"
          disabled={stripeLoading || loading}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button
          disabled={stripeLoading || loading}
          type="submit"
          color="primary"
        >
          Add card
        </Button>
      </DialogActions>
    </form>
  );
}

CardForm.propTypes = {
  onCancel: PropTypes.func.isRequired,
  stripe: PropTypes.object
};

export default injectStripe(CardForm);
