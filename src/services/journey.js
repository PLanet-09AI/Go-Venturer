import { db } from '../config/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export class JourneyMode {
  constructor(userId) {
    this.userId = userId;
    this.active = false;
    this.points = 0;
    this.visitedPlaces = new Set();
  }

  start() {
    this.active = true;
    this.points = 0;
    this.visitedPlaces.clear();
  }

  stop() {
    this.active = false;
    this.saveProgress();
  }

  async visitPlace(placeId) {
    if (!this.active || this.visitedPlaces.has(placeId)) return;

    this.visitedPlaces.add(placeId);
    this.points += 10;

    // Update points in Firebase
    const userRef = doc(db, 'users', this.userId);
    await updateDoc(userRef, {
      points: increment(10),
      visitedPlaces: Array.from(this.visitedPlaces)
    });

    return this.points;
  }

  async saveProgress() {
    if (!this.active) return;

    const userRef = doc(db, 'users', this.userId);
    await updateDoc(userRef, {
      points: increment(this.points),
      visitedPlaces: Array.from(this.visitedPlaces)
    });
  }
}