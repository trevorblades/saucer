import ActionMenu from '../action-menu';
import DeleteInstanceDialog from '../delete-instance-dialog';
import PropTypes from 'prop-types';
import React, {Fragment, useState} from 'react';
import {Link} from 'gatsby';
import {MenuItem} from '@material-ui/core';

export default function InstanceActions(props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  function closeDialog() {
    setDialogOpen(false);
  }

  return (
    <Fragment>
      <ActionMenu>
        {closeMenu => {
          const menuItems = [
            <MenuItem
              key="details"
              component={Link}
              to={`/dashboard/instances/${props.instance.id}`}
            >
              Instance details
            </MenuItem>,
            <MenuItem
              key="delete"
              onClick={() => {
                closeMenu();
                setDialogOpen(true);
              }}
            >
              Delete instance
            </MenuItem>
          ];

          if (props.instance.status === 'Success') {
            menuItems.push(
              <MenuItem
                key="wordpress"
                component="a"
                href={`https://${props.instance.name}.saucer.dev/wp-admin`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Wordpress
              </MenuItem>
            );
          }

          return menuItems;
        }}
      </ActionMenu>
      <DeleteInstanceDialog
        instance={props.instance}
        open={dialogOpen}
        onClose={closeDialog}
      />
    </Fragment>
  );
}

InstanceActions.propTypes = {
  instance: PropTypes.object.isRequired
};
