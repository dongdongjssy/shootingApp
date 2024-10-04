/**
 * @format
 */
if (!__DEV__) {
  global.console = {
    info: () => { },
    log: () => { },
    assert: () => { },
    warn: () => { },
    debug: () => { },
    error: () => { },
    time: () => { },
    timeEnd: () => { },

  };
}
// import Orientation from 'react-native-orientation';  use other new lib
// Orientation.lockToPortrait();
import { AppRegistry, YellowBox, StatusBar } from 'react-native';
YellowBox.ignoreWarnings([
  '[mobx.array]',
  'Warning',
  'Possible',
  'Debugger',
  'Remote',
  'Require'
])
// StatusBar.setHidden(true)
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
// AppRegistry.registerComponent('LoginPage', () => LoginPage);