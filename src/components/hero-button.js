import React from 'react';
import {Button} from 'gatsby-theme-material-ui';
import {makeStyles} from '@material-ui/core';

const useStyles = makeStyles({
  button: {
    borderWidth: 2,
    borderRadius: 1000,
    fontSize: '1rem',
    padding: '8px 24px'
  }
});

export default function HeroButton(props) {
  const {button} = useStyles();
  return (
    <Button
      {...props}
      size="large"
      variant="outlined"
      color="inherit"
      className={button}
    />
  );
}
