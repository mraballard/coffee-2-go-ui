
(function(){
  angular.module('coffee')
  .controller('mainController', mainController);


  mainController.$inject = ['$scope', '$http', '$state'];

  function mainController($scope, $http, $state) {
    var rootUrl = 'http://localhost:3000';
    var self = this;

// ======================================================== //
                // GOOGLE PLACES //
// ======================================================== //
    $scope.gPlace;
    self.searchString = "O'brien 2336, Vitacura, Chile";
    self.center = new google.maps.LatLng(-33.4023375, -70.59443920000001);
    self.map = new google.maps.Map({
       zoom: 15,
       center: self.center
     });
    self.infowindow = new google.maps.InfoWindow();
    self.geocoder = new google.maps.Geocoder();
    self.request;
    self.markers = [];
    self.service = new google.maps.places.PlacesService(self.map);

   self.searchAndMark = function(request) {
     self.service.nearbySearch(request, function(results, status){
      var marker;
      if (status == google.maps.GeocoderStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          marker = new google.maps.Marker({map: self.map, position: results[i].geometry.location, title: results[i].name, animation: google.maps.Animation.DROP});
           self.markers.push(marker);
           marker.addListener('click', function() {
             self.populateInfoWindow(this);
             console.log(this.position.lat());
             console.log(this.position.lng());

           });
         }
       }
     });
   }

   self.populateInfoWindow = function(marker) {
     if (self.infowindow.marker != marker) {
       self.infowindow.marker = marker;
       self.infowindow.setContent(`<div>${marker.title}</div>`);
       self.infowindow.open(self.map, marker);
       self.infowindow.addListener('closeclick', function() {
         self.infowindow.setMarker(null);
       })
     }
   }

   self.geocodeAddress = function() {
     self.geocoder.geocode({'address': self.searchString}, function(results, status) {
       if (status === google.maps.GeocoderStatus.OK) {
         self.map.setCenter(results[0].geometry.location);
         request = {
           location: results[0].geometry.location,
           radius: 3000,
           types: ['cafe']
         };
         self.searchAndMark(request);
       } else {
         alert('Geocode was not successful for the following reason: ' + status);
       }
     });
   }

   self.geocodeAddress();

// ======================================================== //
               // USER CONTROLLER //
// ======================================================== //

  } // Close mainController function

})()
console.log("app.js");
