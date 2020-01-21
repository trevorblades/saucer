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
        {closeMenu => (
          <div>
            <MenuItem
              component={Link}
              to={`/dashboard/instances/${props.instance.id}`}
            >
              Instance details
            </MenuItem>
            {props.instance.status === 'Success' && (
              <MenuItem
                component="a"
                href={`https://${props.instance.name}.saucer.dev/wp-admin`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Wordpress
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                closeMenu();
                setDialogOpen(true);
              }}
            >
              Delete instance
            </MenuItem>
          </div>
        )}
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
