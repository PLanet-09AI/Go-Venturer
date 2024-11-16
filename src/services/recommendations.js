import { searchNearbyPlaces } from './places';

const GEMINI_API_KEY = 'AIzaSyCaXpTW813OO-iJi5xyhflLkQ7pfQIA36Q';

export async function getRecommendations(location, visitedPlaces = []) {
  try {
    if (!location?.lat || !location?.lng) {
      return getDefaultRecommendations();
    }

    const places = await searchNearbyPlaces(location);
    if (!places?.length) {
      return getDefaultRecommendations();
    }

    const placesContext = places.map(place => ({
      name: place.name,
      rating: place.rating || 'Not rated',
      types: place.types || []
    }));

    const prompt = {
      contents: [{
        parts: [{
          text: `Given these nearby places: ${JSON.stringify(placesContext)} and these visited places: ${JSON.stringify(visitedPlaces)}, recommend 3 interesting places to visit next. Format the response as a JSON array with name and reason fields.`
        }]
      }]
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return getDefaultRecommendations();
    }

    try {
      const recommendations = JSON.parse(data.candidates[0].content.parts[0].text);
      return Array.isArray(recommendations) ? recommendations : getDefaultRecommendations();
    } catch (parseError) {
      console.error('Error parsing recommendations:', parseError);
      return getDefaultRecommendations();
    }
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return getDefaultRecommendations();
  }
}

function getDefaultRecommendations() {
  return [
    {
      name: 'Popular Attractions',
      reason: 'Discover the most visited places in this area'
    },
    {
      name: 'Hidden Gems',
      reason: 'Explore lesser-known local favorites'
    },
    {
      name: 'Local Experience',
      reason: 'Immerse yourself in the local culture and cuisine'
    }
  ];
}

export function speakRecommendation(text) {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1.0;
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    speechSynthesis.speak(utterance);
  }
}