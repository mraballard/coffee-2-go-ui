
(function(){
  angular.module('coffee')
  .controller('mainController', mainController);


  mainController.$inject = ['$scope', '$http', '$state', 'NgMap', '$cart'];

  function mainController($scope, $http, $state, NgMap, $cart) {
    var rootUrl = 'http://localhost:3000';
    var self = this;
// ======================================================== //
               // USER CONTROLLER //
// ======================================================== //
  self.currentUserCheck = function(userId) {
      if (localStorage.user_id == userId.toString()) {
        self.isUser = true;
      }
      else {
        self.isUser = false;
      }
  }

  self.getUserFromLocalStorage = function() {
    $http({
      method: 'GET',
      headers:   {'Authorization': `Bearer ${JSON.stringify(localStorage.getItem('token'))}`},
      url: `${rootUrl}/users/current-user`
    })
    .then(function(response){
      self.user = response.data.user
      console.log(self.user);
      self.getOrders();
      self.getStores();
      $state.go('home');
    })
    .catch(function(err) {
      console.log(err);
    })

  }

  self.signup = function(userPass){
    $http.post(`${rootUrl}/users`, {user: {firstname: userPass.firstName, lastname: userPass.lastName, username: userPass.username, password: userPass.password }})
    .then(function(response) {
      console.log(response);
      self.user = response.data.user;
      localStorage.setItem('user_id', JSON.stringify(self.user.id));
      localStorage.setItem('token', JSON.stringify(response.data.token));
      // Get users favorite stores and previous orders
      $state.go('home');
    })
    .catch(function(err) {
      console.error(err);
    });
  }

  self.login = function(userPass){
    $http.post(`${rootUrl}/users/login`, {user: {username: userPass.username, password: userPass.password}})
    .then(function(response){
      self.user = response.data.user;
      localStorage.setItem('user_id', self.user.id);
      localStorage.setItem('token', response.data.token);
      self.getOrders();
      self.getStores();
      // Get users favorite stores and previous orders
      $state.go('home');
    })
    .catch(function(err){
      console.error(err);
    })
  }

  self.update = function(userPass) {
    $http({
      method: 'PATCH',
      headers:   {'Authorization': `Bearer ${JSON.stringify(localStorage.getItem('token'))}`},
      url: `${rootUrl}/users/${self.user.id}`,
      data: {
        user: {
          firstname: userPass.firstName, lastname: userPass.lastName, username: userPass.username, password: userPass.password
        }
      }
    })
    .then(function(response){
      console.log(response);
      self.user = response.data.user
      $state.go('home');
    })
    .catch(function(err){
      console.log(err);
    });
  }

  self.logout = function() {
    self.user = null;
    self.orders = [];
    self.thisOrder = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    $state.go('welcome');
  }

  // ======================================================== //
                 // STORE CONTROLLER //
  // ======================================================== //

  self.cart = $cart;
  self.quantityAtCartIndex = [];
  self.showMenu = function(store) {
    self.thisStore = store;

    $http.get(`${rootUrl}/items`)
    .then(function(response) {
      self.thisStore.menuItems = response.data.items;
      $state.go('store');
    })
    .catch(function(err) {
      console.log(err);
    })
  }

  self.addToCart = function(item) {
    $cart.add(item, 1, self.thisStore);
  }

  self.updateCart = function(item, quantity, index) {
    $cart.update(item, quantity);
    self.quantityAtCartIndex[index] = 0;
  }

  self.removeFromCart = function(item) {
    $cart.remove(item);
  }

  self.checkout = function() {
    $http({ // ADDS STORE TO DATABASE
      method: 'POST',
      headers:   {'Authorization': `Bearer ${JSON.stringify(localStorage.getItem('token'))}`},
      url: `${rootUrl}/stores`,
      data: {
        name: self.thisStore.title,
        address: self.thisStore.vicinity,
        lat: self.thisStore.position.lat(),
        lng: self.thisStore.position.lng()
      }
    })
    .then(function(response) {
      // Returns storeId for Order Post route
      if (response.data.status == 202){
        return response.data.store[0].id;
      } else {
        return response.data.store.id;
      }
    })
    .then(function(storeId) {
      var items = $cart.getProducts();
      console.log($cart.items);
      return $http({
        method: 'POST',
        headers:   {'Authorization': `Bearer ${JSON.stringify(localStorage.getItem('token'))}`},
        url: `${rootUrl}/users/${self.user.id}/orders`,
        data: {
          total: $cart.total,
          user_id: self.user.id,
          store_id: storeId,
          items: $cart.items
        }
      })
    })
    .then(function(response){
      $cart.emptyCart();
      self.getOrders();
      self.getStores();
      $state.go('home');
    })
    .catch(function(err){
      console.log(err);
    });
  }

  self.getOrders = function() {
    $http({
      method: 'GET',
      headers:   {'Authorization': `Bearer ${JSON.stringify(localStorage.getItem('token'))}`},
      url: `${rootUrl}/users/${self.user.id}/orders`,
    })
    .then(function(response) {
      self.orders = response.data.orders;
      console.log(self.orders);
    })
    .catch(function(err) {
      console.log(err);
    })
  }

  self.getStores = function() {
    $http({
      method: 'GET',
      headers:   {'Authorization': `Bearer ${JSON.stringify(localStorage.getItem('token'))}`},
      url: `${rootUrl}/users/${self.user.id}/stores`,
    })
    .then(function(response) {
      self.stores = response.data.stores;
      console.log(self.stores);
    })
    .catch(function(err) {
      console.log(err);
    })
  }

  self.showOrder = function(order) {
    self.thisOrder = order;
    $http({
      method: 'GET',
      headers:   {'Authorization': `Bearer ${JSON.stringify(localStorage.getItem('token'))}`},
      url: `${rootUrl}/users/${self.user.id}/orders/${self.thisOrder.id}`,
    })
    .then(function(response) {
      self.thisOrder.breakdown = response.data.items;
      console.log(self.thisOrder.breakdown);
      $state.go('order');
    })
    .catch(function(err) {
      console.log(err);
    })
  }

// ======================================================== //
                // GOOGLE PLACES //
// ======================================================== //
    $scope.gPlace;
    self.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?";
    self.searchString = "";
    self.center = new google.maps.LatLng(-33.4023375, -70.59443920000001);
    // self.map = NgMap.getMap('map');
    self.infowindow = new google.maps.InfoWindow();
    self.geocoder = new google.maps.Geocoder();
    self.markers = [];

   self.searchAndMark = function() {
     self.markers = [];
     self.request = {
       location: self.center,
       radius: 1500,
       types: ['cafe']
     };
     console.log("$state go to map");
     $state.go('map');
      NgMap.getMap('map').then(function(map) {
        return self.map = map;
      })
      .then(function(map){
        return self.service = new google.maps.places.PlacesService(self.map);
      })
      .then(function(service){
        service.nearbySearch(self.request, function(results, status){
         if (status == google.maps.GeocoderStatus.OK) {
           if (results.length > 8) {
             var max = 8;
           } else {
             var max = results.length;
           }
           for (var i = 0; i < max; i++) {
              marker = new google.maps.Marker({map: self.map, title: results[i].name, position: results[i].geometry.location, vicinity: results[i].vicinity, animation: google.maps.Animation.DROP});
              self.markers.push(marker);
              marker.addListener('click', function() {
              self.populateInfoWindow(this);
              });
            }
            $state.reload();
          }
        });
      })
      .catch(function(err){
        console.log(err);
      });
   }

   self.populateInfoWindow = function(marker) {
       self.infowindow.marker = marker;
       self.infowindow.setContent(`<div>${marker.title}</div>`);
        self.infowindow.open(self.map, marker);
        self.infowindow.addListener('closeclick', function() {
            self.infowindow.marker = null;
         })
    }

   self.geocodeAddress = function() {
     self.geocoder.geocode({'address': self.searchString}, function(results, status) {
       if (status === google.maps.GeocoderStatus.OK) {
         self.center = results[0].geometry.location;
         self.searchAndMark();
       } else {
         alert('Geocode was not successful for the following reason: ' + status);
       }
     })
   }




   self.getUserFromLocalStorage();
  } // Close mainController function

})()
console.log("app.js");
