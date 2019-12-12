import EmptyState from './empty-state';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import {Box, Button, Typography} from '@material-ui/core';
import {useQuery} from '@apollo/client';

export function useQueryTable() {
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  function openModal() {
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function closeSnackbar() {
    setSnackbarOpen(false);
  }

  function handleCompleted() {
    closeModal();
    setSnackbarOpen(true);
  }

  return {
    modalOpen,
    openModal,
    closeModal,
    snackbarOpen,
    closeSnackbar,
    handleCompleted
  };
}

function QueryTableHeader(props) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
    >
      <Typography variant="h4">{props.title}</Typography>
      {props.children}
    </Box>
  );
}

QueryTableHeader.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string.isRequired
};

export default function QueryTable(props) {
  const {data, loading, error} = useQuery(props.query);

  if (loading || error) {
    return (
      <Fragment>
        <QueryTableHeader title={props.title} />
        <Typography color={error ? 'error' : 'textSecondary'} variant="h6">
          {error ? error.message : 'Loading...'}
        </Typography>
      </Fragment>
    );
  }

  const results = data[props.dataKey];
  if (!results.length) {
    return (
      <Fragment>
        <QueryTableHeader title={props.title} />
        <EmptyState {...props.EmptyStateProps} />
        {props.children(data)}
      </Fragment>
    );
  }

  const {onButtonClick, buttonText} = props.EmptyStateProps;
  return (
    <Fragment>
      <QueryTableHeader title={props.title}>
        <Button onClick={onButtonClick} color="primary" variant="contained">
          {buttonText}
        </Button>
      </QueryTableHeader>
      {props.renderTable(results)}
      {props.children(data)}
    </Fragment>
  );
}

QueryTable.propTypes = {
  query: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  dataKey: PropTypes.string.isRequired,
  children: PropTypes.func,
  renderTable: PropTypes.func.isRequired,
  EmptyStateProps: PropTypes.shape(EmptyState.propTypes).isRequired
};

QueryTable.defaultProps = {
  children: () => null
};
