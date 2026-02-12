
import json

with open('src/data/dataset.json', 'r') as f:
    data = json.load(f)

total_cost = 0
for curr in data:
    total_cost += (curr.get('distance_km', 0) * curr.get('carrier_cost_per_km', 0))

avg_cost = total_cost / len(data)
print(f"Total Cost: {total_cost}")
print(f"Number of Records: {len(data)}")
print(f"Average Cost Per Record: {avg_cost}")

# Check unique shipments
shipments = set()
for curr in data:
    shipments.add(curr.get('assigned_truck_id'))

print(f"Unique Assigned Trucks: {len(shipments)}")
