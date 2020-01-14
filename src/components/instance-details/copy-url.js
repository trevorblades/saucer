import PropTypes from 'prop-types';
import React, {useRef, useState} from 'react';
import copy from 'clipboard-copy';
import {Box, Chip, Typography} from '@material-ui/core';

export default function CopyUrl(props) {
  const timeout = useRef(null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copy(props.url);
    setCopied(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <Box mb={2} display="flex" alignItems="center">
      <Box mr={2}>
        <Typography>{props.url}</Typography>
      </Box>
      <Chip
        clickable
        size="small"
        variant="outlined"
        color={copied ? 'primary' : 'default'}
        label={copied ? 'Copied!' : 'Copy to clipboard'}
        onClick={handleCopy}
      />
    </Box>
  );
}

CopyUrl.propTypes = {
  url: PropTypes.string.isRequired
};
