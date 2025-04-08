// src/services/geocode.js

/**
 * getCoords
 * This function takes an address string and returns geographic coordinates using
 * the free OpenStreetMap Nominatim API.
 *
 * @param {string} address - The human-readable address to geocode
 * @returns {Promise<{lat: number, lon: number} | null>} The coordinates or null if not found
 */
export async function getCoords(address) {
  // Build the API request URL with the address encoded for safe HTTP transmission
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  // Send the request to OpenStreetMap's Nominatim API
  const res = await fetch(url);

  // Parse the JSON response
  const data = await res.json();

  // If no results are found, return null
  if (data.length === 0) return null;

  // Extract latitude and longitude from the first result
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}
