import CardActions from '../../components/card-actions';
import CardForm from '../../components/card-form';
import PaymentMethod from '../../components/payment-method';
import QueryTable, {useQueryTable} from '../../components/query-table';
import React, {Fragment} from 'react';
import StripeElementsProvider from '../../components/stripe-elements-provider';
import SuccessToast from '../../components/success-toast';
import dog from '../../assets/dog.png';
import {
  Chip,
  Dialog,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import {Helmet} from 'react-helmet';
import {LIST_CARDS} from '../../utils';

export default function Billing() {
  const {
    modalOpen,
    openModal,
    closeModal,
    snackbarOpen,
    closeSnackbar,
    handleCompleted
  } = useQueryTable();
  return (
    <Fragment>
      <Helmet>
        <title>Billing</title>
      </Helmet>
      <QueryTable
        title="Payment methods"
        query={LIST_CARDS}
        dataKey="cards"
        EmptyStateProps={{
          image: dog,
          title: 'You have no payment methods',
          subtitle: 'Configure a credit card here',
          buttonText: 'Add card',
          onButtonClick: openModal
        }}
        renderTable={cards => (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="none">Card number</TableCell>
                <TableCell colSpan={2}>Expiry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cards.map(card => (
                <TableRow key={card.id}>
                  <TableCell padding="none">
                    <PaymentMethod
                      card={card}
                      defaultIndicator={<Chip size="small" label="Default" />}
                    />
                  </TableCell>
                  <TableCell>
                    {card.expMonth.toString().padStart(2, '0')}/
                    {card.expYear.toString().slice(2)}
                  </TableCell>
                  <TableCell align="right" padding="checkbox">
                    <CardActions card={card} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      >
        {data => (
          <Dialog fullWidth maxWidth="xs" open={modalOpen} onClose={closeModal}>
            <StripeElementsProvider>
              <CardForm
                isDefault={!data.cards.length}
                onCancel={closeModal}
                onCompleted={handleCompleted}
              />
            </StripeElementsProvider>
          </Dialog>
        )}
      </QueryTable>
      <SuccessToast
        open={snackbarOpen}
        onClose={closeSnackbar}
        message="Card added 🤑"
      />
    </Fragment>
  );
}
