# app/api/routes.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import asyncio
from app.services.pricing import compare_prices
from app.services.geocode import geocode_address
from app.utils.distance import haversine_distance

# Create an API router to handle endpoints
router = APIRouter()

# WebSocket endpoint for sending live price updates
@router.websocket("/ws/prices")
async def prices_websocket(websocket: WebSocket):
    await websocket.accept()  # Accept the WebSocket connection
    request = None

    try:
        while True:
            try:
                # Wait for input from client (with timeout so we can keep sending updates)
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                request = json.loads(data)
            except asyncio.TimeoutError:
                # If no message is received in time, just continue to next iteration
                pass
            except Exception as e:
                print("❌ Failed to parse WebSocket message:", e)

            if request is None:
                # Wait briefly before checking again
                await asyncio.sleep(0.5)
                continue

            # Extract user input from frontend message
            pickup = request.get("pickup")
            dropoff = request.get("dropoff")
            cab_type = request.get("cabType") or "Economy"
            category = request.get("category", "ride")

            try:
                # Get predicted prices for all providers
                results = await compare_prices(category, pickup, dropoff, cab_type)

                # Find the cheapest option among the returned prices
                valid_prices = [r for r in results if r.get("price") is not None]
                cheapest = min(valid_prices, key=lambda r: r["price"], default=None)

                # Calculate the potential savings between cheapest and most expensive
                savings = round(
                    max([r["price"] for r in valid_prices], default=0) -
                    min([r["price"] for r in valid_prices], default=0),
                    2
                ) if len(valid_prices) >= 2 else 0

                # Calculate coordinates and distance between pickup and dropoff
                pickup_coords, dropoff_coords = None, None
                distance_km = None
                if pickup and dropoff and pickup.lower() != dropoff.lower():
                    pickup_coords, pickup_err = await geocode_address(pickup)
                    dropoff_coords, dropoff_err = await geocode_address(dropoff)
                    if not (pickup_err or dropoff_err):
                        distance_km = haversine_distance(*pickup_coords, *dropoff_coords)

                print("🔁 Sending updated prices!")

                # Send the updated pricing information and coordinates to the client
                await websocket.send_json({
                    "category": category,
                    "results": results,
                    "cheapest": {"ride": cheapest} if cheapest else {"ride": None},
                    "savings": {"ride": savings},
                    "pickup_coords": {"lat": pickup_coords[0], "lng": pickup_coords[1]} if pickup_coords else None,
                    "dropoff_coords": {"lat": dropoff_coords[0], "lng": dropoff_coords[1]} if dropoff_coords else None,
                    "distance_km": round(distance_km, 2) if distance_km else None
                })

            except Exception as inner_e:
                import traceback
                print("❌ Error inside pricing loop:")
                traceback.print_exc()

            # Wait 15 seconds before sending the next update
            await asyncio.sleep(15)

    except WebSocketDisconnect:
        print("👋 Client disconnected")

    except Exception as outer_e:
        import traceback
        print("❌ WebSocket crashed:")
        traceback.print_exc()
