import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import {FiMoreHorizontal} from 'react-icons/fi';
import {IconButton, Menu, Tooltip} from '@material-ui/core';

export default function ActionMenu(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function closeMenu() {
    setAnchorEl(null);
  }

  return (
    <Fragment>
      <Tooltip title="Actions">
        <IconButton size="small" onClick={handleClick}>
          <FiMoreHorizontal size={24} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        {props.children(closeMenu)}
      </Menu>
    </Fragment>
  );
}

ActionMenu.propTypes = {
  children: PropTypes.func.isRequired
};
