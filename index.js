/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerAttendanceLocationHeadlessTask } from './src/services/locationTrackingService';

registerAttendanceLocationHeadlessTask();
AppRegistry.registerComponent(appName, () => App);
