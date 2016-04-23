var ProfileEdit = require('./ProfileEdit');
var api = require('../../Utils/api');
var firebaseUrl = require('../../Utils/config');
var Firebase = require('firebase');

import Login from '../Authentication/Login';

var app = new Firebase(firebaseUrl);

import React, {
  View,
  Text,
  Image,
  StyleSheet,
  Component,
  ScrollView,
  TouchableHighlight,
  AsyncStorage
} from 'react-native';

class Profile extends Component{

  constructor(props) {

    super(props)
    this.state = {
      isLoading: true
    };
  }

  getRowTitle(user, item) {
    item = item;
    return item[0] ? item[0].toUpperCase() + item.slice(1) : item;
  }

  handleProfileRender(item, value) {
    var userData = this.state.userData
    userData[item] = value;
    this.setState({
      userData: userData
    })
  }

  editProfile() {
    var that = this;
    this.props.navigator.push({
      title: 'Edit Profile',
      component: ProfileEdit,
      passProps: {userData: that.state.userData, authInfo: that.props.userInfo, handleProfileRender: this.handleProfileRender.bind(this)}
    });
  }

  componentWillMount() {
    this.getAsyncData();
  }

  getAsyncData() {
    var that = this;
    console.log(that.props);
    api.getUserData(that.props.userInfo.uid).then(function(res) {
      
        that.setState({
          userData: res,
          isLoading: false
        })
      })
      .catch((err) => console.log(err))
  }

  logout() {
    var that = this;

    AsyncStorage.removeItem('authData').then(function(){
      app. unauth();

      that.props.navigator.replace({
        component: Login
      });
    })
  }


  render(){
      var userData = this.state.userData;
      var topicArr = ['email', 'phone'];
      if(userData) {

        var list = topicArr.map((item, index) => {
          return (
            <View key={index}>
              <View style={styles.rowContainer}>
                <Text style={styles.rowTitle}> {this.getRowTitle(userData, item)} </Text>
                <Text style={styles.rowContent}> {userData[item]} </Text>
              </View>
            </View>
          )
        })
        return (
          <View>
            <View style={styles.badgeContainer}>
              <TouchableHighlight onPress={() => this.editProfile()}>
                <Image style={styles.editImage} source={require('../../Images/edit.png')} />
              </TouchableHighlight>
              <Image style={styles.badgeImage} source={{uri: userData.profileImageURL}} />
              <Text style={styles.badgeName}> {userData.name}</Text>
            </View>
            <View style={styles.container}>
              {list}
            </View>
            <TouchableHighlight
              style={styles.button}
              onPress={() => this.logout()}
              underlayColor='white' >
                <Text style={styles.buttonText}>LOG OUT</Text>
            </TouchableHighlight>
          </View>
        )
      } else {
        return(<View />)
      }
    }

}

var styles = {
  isLoadingContainer: {
    flex: 1,
    marginTop: 150,
    alignSelf: 'center'
  },
  container: {
    flex: 1,
    marginLeft: 20,
    marginTop: 10,
    padding: 20
  },
  badgeContainer: {
    backgroundColor: '#498183',
    paddingBottom: 10,
    padding: 20,
    marginTop: 55,
    width: 400
  },
  badgeName: {
    alignSelf: 'center',
    fontSize: 21,
    marginTop: 10,
    marginBottom: 5,
    color: 'white'
  },
  badgeImage: {
    height: 126,
    width: 126,
    borderRadius: 63,
    alignSelf: 'center',
    borderWidth: 10,
    borderColor: '#9dc7c9'
  },
  editImage: {
    height: 30,
    width: 30,
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: 20
  },
  loadingImage: {
    height: 100,
    width: 100,
    alignSelf: 'center',
    marginTop: 100
  },
  rowContainer: {
    padding: 10
  },
  rowTitle: {
    color: '#498183',
    fontSize: 16
  },
  rowContent: {
    color: '#022c3d',
    fontSize: 19
  },
  button: {
    height: 30,
    width: 150,
    flexDirection: 'row',
    backgroundColor: '#498183',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 15,
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 10
  },
  buttonText: {
    color: 'white',
    // padding: 10,
    fontSize: 20,
    alignSelf: 'center'
  }
};

export default Profile;
