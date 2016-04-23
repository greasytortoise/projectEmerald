var api = require('./App/Utils/api');
import Login from './App/Components/Authentication/Login'
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  NavigatorIOS,
  Text,
  View
} from 'react-native';


// initializing app
class projectSapphire extends Component {
  render() {
    return (
    <NavigatorIOS
      style={styles.container}
      initialRoute={{
        component: Login
      }}
    />
    );
  }
}

// stylesheet
var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111'
  }
});

AppRegistry.registerComponent('projectSapphire', () => projectSapphire);
