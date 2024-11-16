import { auth } from './config/firebase';
import { signIn, signUp, signOut } from './services/auth';
import { initMap } from './services/map';
import { JourneyMode } from './services/journey';
import { getRecommendations, speakRecommendation } from './services/recommendations';
import './style.css';

let journey = null;
let map = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  map = initMap();
  setupAuthListeners();
  setupUIHandlers();
});

// Auth state listener
function setupAuthListeners() {
  auth.onAuthStateChanged((user) => {
    const authButton = document.getElementById('authButton');
    const userInfo = document.getElementById('userInfo');
    const journeyButton = document.getElementById('journeyMode');
    const authModal = document.getElementById('authModal');

    if (user) {
      authButton.classList.add('hidden');
      userInfo.classList.remove('hidden');
      journeyButton.classList.remove('hidden');
      authModal.classList.add('hidden');
      journey = new JourneyMode(user.uid);
      updateRecommendations();
    } else {
      authButton.classList.remove('hidden');
      userInfo.classList.add('hidden');
      journeyButton.classList.add('hidden');
      journey = null;
      // Show default recommendation for non-authenticated users
      updateRecommendations();
    }
  });
}

// UI Event Handlers
function setupUIHandlers() {
  // Auth Modal
  document.getElementById('authButton').addEventListener('click', () => {
    document.getElementById('authModal').classList.remove('hidden');
  });

  // Auth Form
  document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const isSignIn = document.getElementById('authTitle').textContent === 'Sign In';

    try {
      if (isSignIn) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert(error.message);
    }
  });

  // Auth Toggle
  document.getElementById('authToggle').addEventListener('click', (e) => {
    e.preventDefault();
    const title = document.getElementById('authTitle');
    const toggle = document.getElementById('authToggle');
    const isSignIn = title.textContent === 'Sign In';

    title.textContent = isSignIn ? 'Sign Up' : 'Sign In';
    toggle.textContent = isSignIn ? 'Already have an account?' : 'Create an account';
  });

  // Sign Out
  document.getElementById('signOut').addEventListener('click', async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      alert(error.message);
    }
  });

  // Journey Mode
  document.getElementById('journeyMode').addEventListener('click', () => {
    if (!journey.active) {
      journey.start();
      document.getElementById('journeyMode').textContent = 'End Journey';
      document.getElementById('journeyMode').classList.add('bg-red-600', 'hover:bg-red-700');
      document.getElementById('journeyMode').classList.remove('bg-green-600', 'hover:bg-green-700');
    } else {
      journey.stop();
      document.getElementById('journeyMode').textContent = 'Start Journey';
      document.getElementById('journeyMode').classList.add('bg-green-600', 'hover:bg-green-700');
      document.getElementById('journeyMode').classList.remove('bg-red-600', 'hover:bg-red-700');
    }
  });

  // Travel Mode
  document.getElementById('travelMode').addEventListener('change', (e) => {
    const mode = e.target.value;
    if (map) {
      map.setOptions({ travelMode: google.maps.TravelMode[mode] });
      updateRecommendations(); // Refresh recommendations when travel mode changes
    }
  });
}

// Update recommendations based on current location
async function updateRecommendations() {
  if (!map) return;

  const center = map.getCenter();
  const recommendations = await getRecommendations(
    { lat: center.lat(), lng: center.lng() },
    journey?.visitedPlaces ? Array.from(journey.visitedPlaces) : []
  );

  const recommendationsContainer = document.getElementById('recommendations');
  recommendationsContainer.innerHTML = recommendations.map(rec => `
    <div class="p-3 bg-gray-50 rounded-md group hover:bg-gray-100 transition-colors">
      <div class="flex justify-between items-start">
        <h3 class="font-semibold">${rec.name}</h3>
        <button 
          class="text-blue-600 hover:text-blue-800 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onclick="window.speakRecommendation('${rec.name}. ${rec.reason}')"
          aria-label="Read recommendation aloud"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6L8 10H4V14H8L12 18V6Z"/>
            <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53"/>
            <path d="M18.07 5.93C19.9447 7.80528 20.9979 10.3447 20.9979 13C20.9979 15.6553 19.9447 18.1947 18.07 20.07"/>
          </svg>
        </button>
      </div>
      <p class="text-sm text-gray-600 mt-1">${rec.reason}</p>
    </div>
  `).join('');
}

// Make speakRecommendation available globally for the onclick handler
window.speakRecommendation = speakRecommendation;