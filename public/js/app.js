
(function(){
  angular.module('coffee')
  .controller('mainController', mainController);


  mainController.$inject = ['$scope', '$http', '$state', 'NgMap'];

  function mainController($scope, $http, $state, NgMap ) {
    var rootUrl = 'http://localhost:3000';
    var self = this;

// ======================================================== //
                // GOOGLE PLACES //
// ======================================================== //
    $scope.gPlace;
    self.googleMapsUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyD3VJxibMKMy0AuShNYyq2g8p6Y1iqLL9A";
    self.searchString = "O'brien 2336, Vitacura, Chile";
    self.center = new google.maps.LatLng(-33.4023375, -70.59443920000001);
    // self.map = NgMap.getMap('map');
    self.infowindow = new google.maps.InfoWindow();
    self.geocoder = new google.maps.Geocoder();
    self.service;
    self.request;
    self.markers = [];
    self.positions = [];

   self.searchAndMark = function() {
     self.markers = [];
     self.service = new google.maps.places.PlacesService(self.map);
     self.service.nearbySearch(self.request, function(results, status){
      if (status == google.maps.GeocoderStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          marker = new google.maps.Marker({map: self.map, title: results[i].name, position: results[i].geometry.location, animation: google.maps.Animation.DROP});
          self.markers.push(marker);
           marker.addListener('click', function() {
             self.populateInfoWindow(this);
           });
         }
       }
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
      NgMap.getMap('map').then(function(map) {
        return self.map = map;
      })
      .then(function(map){
        self.geocoder.geocode({'address': self.searchString}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            self.map.setCenter(results[0].geometry.location);
            self.request = {
              location: results[0].geometry.location,
              radius: 3000,
              types: ['cafe']
            };
              self.searchAndMark();
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        })
      })
      .catch(function(err){
        console.log(err);
      });
   }

   self.geocodeAddress();

// ======================================================== //
               // USER CONTROLLER //
// ======================================================== //

  } // Close mainController function

})()
console.log("app.js");
