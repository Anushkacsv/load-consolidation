
import json

with open('src/data/dataset.json', 'r') as f:
    data = json.load(f)

# Group by assigned_truck_id and maybe planned_departure_time to identify a "shipment"
shipments = {}
for curr in data:
    shipment_key = (curr.get('assigned_truck_id'), curr.get('planned_departure_time'))
    if shipment_key not in shipments:
        shipments[shipment_key] = {
            'distance': curr.get('distance_km', 0),
            'rate': curr.get('carrier_cost_per_km', 0),
            'orders': 0
        }
    shipments[shipment_key]['orders'] += 1

total_shipment_cost = sum(s['distance'] * s['rate'] for s in shipments.values())
num_shipments = len(shipments)
avg_cost_per_shipment = total_shipment_cost / num_shipments if num_shipments > 0 else 0

print(f"Number of Shipments: {num_shipments}")
print(f"Total Logistics Cost: {total_shipment_cost}")
print(f"Average Cost Per Shipment: {avg_cost_per_shipment}")
print(f"Average Orders Per Shipment: {len(data)/num_shipments if num_shipments > 0 else 0}")
