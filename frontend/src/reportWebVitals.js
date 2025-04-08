// reportWebVitals.js

// This function helps measure and report performance metrics of your React app
// It uses the "web-vitals" library to track things like:
// CLS (Cumulative Layout Shift), FID (First Input Delay), FCP (First Contentful Paint),
// LCP (Largest Contentful Paint), TTFB (Time to First Byte)

const reportWebVitals = onPerfEntry => {
  // Check if a function was passed in
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Dynamically import the web-vitals package
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Call each web vital function and pass the callback to report results
      getCLS(onPerfEntry);   // Measures layout shifts
      getFID(onPerfEntry);   // Measures input delay
      getFCP(onPerfEntry);   // Measures when first content is shown
      getLCP(onPerfEntry);   // Measures when main content is visible
      getTTFB(onPerfEntry);  // Measures backend response time
    });
  }
};

export default reportWebVitals;
