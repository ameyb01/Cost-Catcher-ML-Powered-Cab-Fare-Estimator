// src/components/PriceBreakdown.js

import React from 'react';
import '../styles/App.css';

/**
 * Component to show a breakdown of how the final ride price was calculated.
 * 
 * Props:
 * - breakdown: An object containing various parts of the fare calculation,
 *   like base price, distance cost, surge multiplier, etc.
 */
const PriceBreakdown = ({ breakdown }) => {
  // If there's no breakdown data yet, show nothing
  if (!breakdown) return null;

  return (
    <div className="breakdown">
      {/* Show base fare charged for the ride */}
      <div>Base Price: ${breakdown.base_price?.toFixed(2) ?? 'N/A'}</div>

      {/* Show distance-based cost if available */}
      <div>
        Distance: {breakdown.distance_km} km × {breakdown.per_km_rate} = ${breakdown.distance_cost?.toFixed(2)}
      </div>

      {/* Show the multiplier applied based on cab type (e.g., SUV is more expensive) */}
      <div>Cab Type Factor: {breakdown.cab_type_factor}</div>

      {/* Show the surge multiplier if applicable during high-demand hours */}
      <div>Surge Factor: {breakdown.surge_factor}</div>

      {/* Show the time multiplier (e.g., higher fare at night or peak hours) */}
      <div>Time Factor: {breakdown.time_factor}</div>

      {/* Show any random fluctuation added for realistic variation */}
      <div>Fluctuation: ${breakdown.fluctuation?.toFixed(2)}</div>

      {/* Final price shown prominently */}
      <strong>Total: ${breakdown.final_price?.toFixed(2)}</strong>
    </div>
  );
};

export default PriceBreakdown;
