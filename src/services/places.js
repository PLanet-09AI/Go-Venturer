export function searchNearbyPlaces(location) {
  return new Promise((resolve, reject) => {
    // Get the map instance
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      reject(new Error('Map element not found'));
      return;
    }

    const placesService = new google.maps.places.PlacesService(mapElement);

    const request = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius: '1000',
      type: ['tourist_attraction', 'park', 'museum', 'restaurant', 'shopping_mall']
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
}

export function getPlaceDetails(placeId) {
  return new Promise((resolve, reject) => {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      reject(new Error('Map element not found'));
      return;
    }

    const placesService = new google.maps.places.PlacesService(mapElement);

    const request = {
      placeId,
      fields: ['name', 'formatted_address', 'rating', 'photos', 'opening_hours', 'types']
    };

    placesService.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(place);
      } else {
        reject(new Error(`Place details failed: ${status}`));
      }
    });
  });
}