let map;
let markers = [];
let directionsService;
let directionsRenderer;
let currentInfoWindow = null;

export function initMap() {
  const defaultLocation = { lat: 40.7128, lng: -74.0060 };

  map = new google.maps.Map(document.getElementById('map'), {
    center: defaultLocation,
    zoom: 13,
    mapId: 'YOUR_MAP_ID',
    tilt: 45,
    mapTypeId: 'hybrid'
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    panel: document.getElementById('directions-panel')
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(pos);
        addMarker(pos, 'Your Location', '📍');
      },
      () => {
        console.log('Error: The Geolocation service failed.');
      }
    );
  }

  setupMapClickHandlers();
  return map;
}

function setupMapClickHandlers() {
  let startMarker = null;
  let endMarker = null;

  map.addListener('click', (event) => {
    if (!startMarker) {
      startMarker = addMarker(event.latLng, 'Start', '🚩');
    } else if (!endMarker) {
      endMarker = addMarker(event.latLng, 'Destination', '🏁');
      calculateAndDisplayRoute(startMarker.getPosition(), endMarker.getPosition());
    } else {
      // Reset markers for new route
      clearMarkers();
      startMarker = addMarker(event.latLng, 'Start', '🚩');
      endMarker = null;
      directionsRenderer.setDirections({ routes: [] });
    }
  });
}

function calculateAndDisplayRoute(start, end) {
  const request = {
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING,
    alternatives: true
  };

  directionsService.route(request, (response, status) => {
    if (status === 'OK') {
      directionsRenderer.setDirections(response);
      const route = response.routes[0];
      updateRouteInfo(route);
    } else {
      console.error('Directions request failed due to ' + status);
    }
  });
}

function updateRouteInfo(route) {
  const leg = route.legs[0];
  const routeInfo = document.getElementById('route-info');
  if (routeInfo) {
    routeInfo.innerHTML = `
      <div class="p-4 bg-white rounded-lg shadow-md">
        <h3 class="font-semibold text-lg mb-2">Route Information</h3>
        <p class="text-gray-700">Distance: ${leg.distance.text}</p>
        <p class="text-gray-700">Duration: ${leg.duration.text}</p>
        <p class="text-gray-700">From: ${leg.start_address}</p>
        <p class="text-gray-700">To: ${leg.end_address}</p>
      </div>
    `;
  }
}

export function addMarker(position, title, icon = '📍') {
  const marker = new google.maps.Marker({
    position,
    map,
    title,
    label: {
      text: icon,
      fontSize: '24px'
    }
  });

  markers.push(marker);
  return marker;
}

export function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
}

export function getMap() {
  return map;
}