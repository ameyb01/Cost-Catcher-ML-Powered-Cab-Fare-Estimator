// === Logo Imports for Providers ===
// These are image files used to represent each ride provider in the UI
import cab1Logo from './assets/cab1-logo.png';
import cab2Logo from './assets/cab2-logo.png';

// === Animation Imports for Cab Types ===
// These are Lottie animation files used to visually show selected cab type
import EconomyAnimation from './assets/animations/economy-car.json';
import QuickestAnimation from './assets/animations/quickest-car.json';
import WaitAndSaveAnimation from './assets/animations/wait-and-save.json';
import MinivanAnimation from './assets/animations/minivan.json';
import BlackSUVAnimation from './assets/animations/black-suv.json';

// === Mapping: Provider IDs → Logos ===
// Used in App.js to dynamically display correct provider logo
export const providerLogos = {
  cab1: cab1Logo,   // Kuber
  cab2: cab2Logo,   // Dryft
};

// === Mapping: Provider IDs → Display Names ===
// These names are shown to users (instead of internal IDs like cab1, cab2)
export const providerNames = {
  cab1: 'Kuber',
  cab2: 'Dryft',
};

// === Mapping: Cab Type → Corresponding Lottie Animation ===
// This powers the animated cab visual depending on user selection
export const cabAnimations = {
  Economy: EconomyAnimation,
  Quickest: QuickestAnimation,
  WaitAndSave: WaitAndSaveAnimation,
  Minivan: MinivanAnimation,
  BlackSUV: BlackSUVAnimation,
};
