var Connections = require('../Connections');
var Separator = require('../Helpers/Separator');
var api = require('../../Utils/api');
var ProfileFriend = require('../Profiles/ProfileFriend');
var AddFriendButton = require('../Helpers/AddFriendButton');
var CreateListing = require('../FriendsAdd');
var Chat = require('../Chat/Chat.js')
var CreateListingButton = require('./CreateListingButton');
var CreateListing = require('./CreateListing');
var SearchListing = require('./SearchListing');
var _ = require('underscore');
var util = require('../../Utils/location-util');
var Promise = require('bluebird');
var Firebase = require('firebase');
var reactfire = require('reactfire');
var firebaseUrl = require('../../Utils/config')


import React, {
  View,
  Text,
  StyleSheet,
  Component,
  ScrollView,
  TouchableHighlight,
  Image,
  AlertIOS
} from 'react-native';


class Listings extends Component{

  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      updateAlert: '',
      listingData: {},
      displayData: {},
      search: false,
      lat: 37.783610,
      long: -122.409002
    };
    this.ref = new Firebase(firebaseUrl + '/Listings');
  }

  handleFriendsRender(newListing) {
    var listingData = this.state.listingData;
    listingData.push(newListing.info);

    this.setState({
      friendData: friendData
    })
  }

  componentWillMount() {
    this.getAsyncData();
    this.ref.on('value', function(snapshot) {

      api.getListings({latitude: this.state.lat, longitude: this.state.long}, 100, (res) => {

        this.setState({
          updateAlert: '',
          listingData: res,
          displayData: res,
          isLoading: false,
        });

      }).catch((err) => {

        this.setState({
          updateAlert: 'The hamsters running the server are too tired. Try again later.',
          isLoading: false
        });


      });

    }.bind(this));
  }

  getAsyncData() {
    var that = this;
      //GET LISTINGS HERE
      util.getPosition((pos) => {
        that.setState({
          lat: pos.coords.latitude,
          long: pos.coords.longitude
        });
        api.getListings({latitude: that.state.lat, longitude: that.state.long}, 100, (res) => {

          that.setState({
            updateAlert: '',
            listingData: res,
            isLoading: false,
          });

        }).catch((err) => {

          that.setState({
            updateAlert: 'The hamsters running the server are too tired. Try again later.',
            isLoading: false
          });


        })
      }, (err) => {
        api.getListings({latitude: that.state.lat, longitude: that.state.long}, 100, (res) => {

          that.setState({
            updateAlert: '',
            listingData: res,
            isLoading: false,
          });

        }).catch((err) => {

          that.setState({
            updateAlert: 'The hamsters running the server are too tired. Try again later.',
            isLoading: false
          });
        })
      });

  }

  startConnection(listingData) {
    this.props.navigator.push({
      title: 'Chat',
      component: Chat,
      passProps: {listingCreatedBy: listingData.userId}
    });
  }

  viewFriend(rowData){
    var rowData = rowData;
    console.log(rowData);
    this.props.navigator.push({
      title: 'View Friend',
      component: ProfileFriend,
      passProps: {friendData: rowData}
    });
  }

  handleRoute(rowData){
    var rowData = rowData;
    this.startConnection(rowData);
    // AlertIOS.alert('Friend Time!', 'Do you want to start a connection?', [
    //   {text: 'No, Cancel', onPress: () => { console.log('back to page') }, style: 'default'},
    //   {text: 'Yes, Start Connection', onPress: () => { this.startConnection(rowData) }, style: 'cancel'},
    //   {text: 'No, View User\'s Profile', onPress: () => { this.viewFriend(rowData) }, style: 'default'}

    //   ]
    // );
  }

  addFriends(){
    this.props.navigator.push({
      title: 'Create New Listing',
      component: CreateListing,
      passProps: {userInfo: this.props.userInfo, allFriends: this.state.friendData, handleFriendsRender: this.handleFriendsRender.bind(this)}
    });
  }

  changeListing(text) {
    text = text.toLowerCase();

    var obj = {};

    var searchKeys = {
      activity: '',
      createdBy: '',
      description: '',
      category: ''
    };

    _.each(this.state.listingData, function(listing, index) {
        // console.log('listing: ', this.state.listingData);
      for (var key in searchKeys) {
        if (listing[key] && listing[key].toLowerCase().includes(text)) {
          obj[index] = listing;
          break;
        }
      }
    });

    this.setState({
      displayData: obj,
      search: true
    })
    console.log('data: ', this.state.displayData);
  }

  render(){

    if (this.state.isLoading) {
      return (
        <View style={styles.isLoadingContainer}>
          <Image style={styles.loadingImage} source={require('../../Images/loading.gif')} />
          <Text> Fetching listings... </Text>
        </View>
      )
    } else {
      var user = this.props.userInfo;
      if (!this.state.search) {
        var listings = this.state.listingData;
      } else {
        var listings = this.state.displayData;
      }
      if (listings !== null && Object.keys(listings).length > 0) {
        var listingsView = _.map(listings, (item, index) => {
          return (
            <View key={index}>
              <TouchableHighlight
                onPress={() => this.handleRoute(item)}
                underlayColor="#EEE">
                <View style={styles.listingContainer}>
                  <Image style={styles.userImages} source={{uri: item.imgUrl}} />
                  <View style={styles.centerContainer}>
                    <Text style={styles.headlineText}>{item.category} - {item.activity}</Text>
                    <Text style={styles.descriptionText}>{item.description}</Text>
                    <Text style={styles.authorText}>Listed by: {item.createdBy}</Text>
                    <View style={styles.rightContainer}>
                      <Text style={styles.distanceText}>{util.getDistanceFromLatLonInMiles(this.state.lat, this.state.long, item.latitude, item.longitude)} Miles</Text>
                    </View>
                  </View>
                </View>
              </TouchableHighlight>
            </View>
          )
        })
      } else {
        var listingsView = (
            <View>
              <Text style={styles.friendAlert}>No Listings close by. Try a wider search area?</Text>
            </View>
          )
      };


      return (
        <View style={styles.mainContainer} >
          <Text style={styles.alertText}>{'\n'}{this.state.updateAlert}</Text>

          <SearchListing style={styles.searchListing} changeListing={this.changeListing.bind(this)} />
          <ScrollView style={styles.listContain}
            showsVerticalScrollIndicator={true}
          >
            {listingsView}
          </ScrollView>
          <TouchableHighlight
          style={styles.buttonContainer}
          onPress={this.addFriends.bind(this)}
          underlayColor="#EEE"
          >
          <Text style={styles.buttonText}> Create New Listing </Text>
          </TouchableHighlight>
        </View>
      )
    }
  }
}

var styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: '#9DC261',
  },

  searchListing: {
    flex: 1,
    backgroundColor: '#9DC261',
    height: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b6142',
    color: '#fff',
    height:55,
    overflow:'hidden'
   },

  isLoadingContainer: {
    flex: 1,
    marginTop: 150,
    alignSelf: 'center',
  },

  loadingImage: {
    height: 100,
    width: 100,
    alignSelf: 'center',
    marginTop: 100
  },
  alertText: {
    marginTop: 20,
    fontSize: 16,
    color: '#feb732'
  },
  friendAlert: {
    marginLeft: 20,
    marginTop: 20,
    fontSize: 16,
    color: 'red'
  },
  // rowContainer: {
  //   flex: 1,
  //   backgroundColor: 'lightblue',
  //   borderRadius: 4,
  //   borderWidth: 0.5,
  //   borderColor: '#d6d7da',
  //   padding: 30,
  //   marginLeft: 20,
  //   marginRight: 20,
  //   height: 75,
  //   flexDirection: 'column'
  // },

  headlineText: {
    fontSize: 14,
    fontWeight: 'bold'
    // color: 'black'
  },
  buttonText: {
    position: 'relative',
    top: -2,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'
    // color: 'black'
  },

  descriptionText: {
    fontSize: 12,
    // color: '#feb732'
  },

  distanceText: {
    fontSize: 10,
    color: '#feb732'
  },

  authorText: {
    fontSize: 12,
    // color: '#feb732'
  },

  listingContainer: {
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#d6d7da',
    margin: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    alignItems: 'center',
    backgroundColor: '#f2faf4',
    padding: 10,
    shadowOffset:{
      width: 3,
      height: 3,
    },
    shadowColor: 'black',
    shadowOpacity: .5,
  },
  centerContainer: {
    flex: 1,
    alignSelf: 'center',
    paddingLeft: 20
  },
  rightContainer: {
    flex: 1,
    alignSelf: 'flex-end'
  },

  image: {
    flex: 1,
    height: 50,
    width: 50,
    borderRadius: 25,
    // position: 'relative',
    // top: -20,
    // left: -20
    alignSelf: 'flex-start'
  },
  name: {
    paddingLeft: 100,
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0)'
  },
  userImages: {
    height: 60,
    width: 60,
    borderRadius: 4,
    // alignSelf: 'flex-end',
    // marginRight: 20,
    // marginTop: 40,
    // flex: 1
  },
};

Listings.propTypes = {
  userInfo: React.PropTypes.object.isRequired
}

module.exports = Listings;
