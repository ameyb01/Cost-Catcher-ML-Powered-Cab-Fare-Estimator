import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import './styles/App.css';

import { providerLogos, providerNames, cabAnimations } from './constants';
import PriceBreakdown from './components/PriceBreakdown';
import RideMap from './components/RideMap';

function App() {
  // === State variables to store inputs and results ===
  const [ridesData, setRidesData] = useState(null);
  const [error, setError] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [cabType, setCabType] = useState('Economy');
  const [ws, setWs] = useState(null);
  const [isWsReady, setIsWsReady] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  // === WebSocket connection setup ===
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8000/ws/prices');

    websocket.onopen = () => {
      setIsWsReady(true);
      sendRequest(websocket); // Send initial request once socket is open
    };

    websocket.onmessage = (event) => {
      try {
        const result = JSON.parse(event.data);
        if (result?.results) {
          const timestamp = Date.now();
          setRidesData({ ...result, timestamp });
          setLastUpdated(timestamp);
          setError(null);
        }

        // Save coordinates to show map
        if (result.pickup_coords && result.dropoff_coords) {
          setPickupCoords([result.pickup_coords.lat, result.pickup_coords.lng]);
          setDropoffCoords([result.dropoff_coords.lat, result.dropoff_coords.lng]);
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
        setError('Error parsing price data');
      }
    };

    websocket.onerror = () => {
      setError('WebSocket connection failed');
      setIsWsReady(false);
    };

    websocket.onclose = () => {
      setError('WebSocket connection closed');
      setIsWsReady(false);
    };

    setWs(websocket);
    return () => websocket.close(); // Cleanup on unmount
  }, []);

  // === Trigger price request when user updates pickup/dropoff or cab type ===
  useEffect(() => {
    if (ws && isWsReady) {
      sendRequest(ws);
    }
  }, [pickupAddress, dropoffAddress, cabType]);

  // === Send data to backend WebSocket ===
  const sendRequest = (websocket) => {
    websocket.send(
      JSON.stringify({
        category: 'ride',
        pickup: pickupAddress,
        dropoff: dropoffAddress,
        cabType: cabType,
      })
    );
  };

  // === Toggle price breakdown visibility for each provider ===
  const toggleBreakdown = (providerName) => {
    setExpandedProviders((prev) => ({
      ...prev,
      [providerName]: !prev[providerName],
    }));
  };

  // === Check if any valid price exists ===
  const hasValidPrices =
    ridesData?.results?.some((r) => r.category === 'ride' && r.price !== null);

  // === Time since last WebSocket message received ===
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return null;
    const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
    return `Last updated: ${seconds}s ago`;
  };

  // === If connection fails or backend sends an error ===
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="App">
      <h1>Cost Catcher - Ride Price Comparison</h1>

      <div className="tab-content">
        {/* === Address and cab type input form === */}
        <div className="address-inputs">
          <h3>Enter Ride Details</h3>
          <div>
            <label>Pickup Address: </label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g., 123 Main St, City"
            />
          </div>
          <div>
            <label>Drop-off Address: </label>
            <input
              type="text"
              value={dropoffAddress}
              onChange={(e) => setDropoffAddress(e.target.value)}
              placeholder="e.g., 456 Oak St, City"
            />
          </div>
          <div>
            <label>Cab Type: </label>
            <select value={cabType} onChange={(e) => setCabType(e.target.value)}>
              <option value="Economy">Economy</option>
              <option value="Quickest">Quickest (under 2 mins)</option>
              <option value="WaitAndSave">Wait and Save (10-15 mins)</option>
              <option value="Minivan">Minivan (5+ seats)</option>
              <option value="BlackSUV">Black SUV</option>
            </select>
          </div>
          <div className="note">
            Note: For best results, enter addresses in the format "Street Address, City, State ZIP".
          </div>
        </div>

        {/* === Lottie animation based on selected cab type === */}
        <div className="cab-animation">
          <Lottie animationData={cabAnimations[cabType]} loop={true} style={{ width: 150, height: 150 }} />
        </div>

        {/* === Ride prices section === */}
        {ridesData ? (
          <div className="category">
            <h2>Rides</h2>

            {/* Display distance in miles */}
            {ridesData.distance_km && (
              <div className="distance-info">
                Approximate Distance: {(ridesData.distance_km * 0.621371).toFixed(2)} miles
              </div>
            )}

            {/* Last updated timestamp */}
            {getTimeSinceUpdate() && (
              <div className="last-updated">
                🕒 {getTimeSinceUpdate()}
              </div>
            )}

            {/* Provider price cards */}
            <div>
              {hasValidPrices ? (
                ridesData.results
                  .filter((r) => r.category === 'ride')
                  .map((r) => (
                    <div key={r.provider} className="provider">
                      <img
                        src={providerLogos[r.provider]}
                        alt={`${providerNames[r.provider]} logo`}
                        className={
                          ridesData.cheapest?.ride?.provider === r.provider
                            ? 'cheapest-logo'
                            : ''
                        }
                      />
                      {r.price !== null ? `$${r.price.toFixed(2)}` : 'N/A'}
                      {r.error && (
                        <div style={{ color: 'red', fontSize: '12px' }}>{r.error}</div>
                      )}
                      {r.breakdown && (
                        <div>
                          <button
                            onClick={() => toggleBreakdown(r.provider)}
                            className="breakdown-toggle"
                          >
                            {expandedProviders[r.provider] ? 'Hide Breakdown' : 'Show Breakdown'}
                          </button>
                          {expandedProviders[r.provider] && (
                            <PriceBreakdown breakdown={r.breakdown} />
                          )}
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div style={{ fontStyle: 'italic', color: '#888' }}>
                  No ride prices available
                </div>
              )}
            </div>

            {/* Cheapest + Savings Summary */}
            <div className="cheapest">
              {ridesData.cheapest?.ride ? (
                `Cheapest: ${providerNames[ridesData.cheapest.ride.provider]} at $${ridesData.cheapest.ride.price.toFixed(2)}`
              ) : (
                'No ride prices available'
              )}
            </div>

            <div className="savings">
              {ridesData.savings?.ride > 0
                ? `You save $${ridesData.savings.ride.toFixed(2)} by choosing the cheapest!`
                : 'No savings available'}
            </div>

            {/* Ride Route Map */}
            {pickupCoords && dropoffCoords && (
              <div className="map-wrapper">
                <RideMap pickupCoords={pickupCoords} dropoffCoords={dropoffCoords} />
              </div>
            )}
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}

export default App;
