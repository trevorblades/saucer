import EmptyState from './empty-state';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {Box, Button, Typography} from '@material-ui/core';
import {useQuery} from '@apollo/client';

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

  const {image, onButtonClick, buttonText, title, subtitle} = props.emptyState;
  if (!data[props.dataKey].length) {
    return (
      <Fragment>
        <QueryTableHeader title={props.title} />
        <EmptyState image={image}>
          <Box mb={3}>
            <Typography variant="h5" gutterBottom>
              {title}
            </Typography>
            <Typography>{subtitle}</Typography>
          </Box>
          <Button
            onClick={onButtonClick}
            size="large"
            color="primary"
            variant="contained"
          >
            {buttonText}
          </Button>
        </EmptyState>
        {props.children(data)}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <QueryTableHeader title={props.title}>
        <Button onClick={onButtonClick} color="primary" variant="contained">
          {buttonText}
        </Button>
      </QueryTableHeader>
      {props.renderTable(data[props.dataKey])}
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
  emptyState: PropTypes.shape({
    image: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    onButtonClick: PropTypes.func.isRequired
  }).isRequired
};

QueryTable.defaultProps = {
  children: () => null
};
