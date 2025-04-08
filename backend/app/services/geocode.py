# app/services/geocode.py

import aiohttp  # For making async HTTP requests
import logging
from app.config import OPENCAGE_API_KEY  # Your OpenCage API key stored securely

# Set up logging to help track issues during development or debugging
logger = logging.getLogger(__name__)

# Asynchronously fetch latitude and longitude for a given address
async def geocode_address(address: str):
    try:
        # Create an async session to call the OpenCage API
        async with aiohttp.ClientSession() as session:
            url = "https://api.opencagedata.com/geocode/v1/json"
            params = {
                "q": address,         # The address to search for
                "key": OPENCAGE_API_KEY  # Your API key
            }
            
            # Send GET request to the API
            async with session.get(url, params=params) as resp:
                # If API request fails, return an error
                if resp.status != 200:
                    return None, f"Geocoding failed: HTTP {resp.status}"

                # Parse the JSON response
                result = await resp.json()

                # If we received valid results, extract the coordinates
                if result["results"]:
                    geometry = result["results"][0]["geometry"]
                    return (geometry["lat"], geometry["lng"]), None  # Success: return coordinates
                return None, "Invalid address"  # Address not found

    except Exception as e:
        # Catch any unexpected errors during the process
        return None, f"Geocoding error: {str(e)}"
