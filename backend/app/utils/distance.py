# app/utils/distance.py
import math

# This function calculates the great-circle distance between two points 
# on the Earth using the Haversine formula.
# It takes the latitude and longitude of both points in decimal degrees.

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of the Earth in kilometers

    # Convert latitude and longitude differences to radians
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    # Haversine formula to calculate the distance between two points on a sphere
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2

    # Return the distance in kilometers
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
