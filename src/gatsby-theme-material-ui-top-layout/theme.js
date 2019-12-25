import {createMuiTheme} from '@material-ui/core';
import {themeOptions} from '@trevorblades/mui-theme';

const theme = createMuiTheme({
  ...themeOptions,
  palette: {
    primary: {
      main: '#2568ef'
    },
    secondary: {
      main: '#ff564f'
    }
  }
});

export default theme;
