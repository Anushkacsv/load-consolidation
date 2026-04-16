
import pandas as pd
import json

file_path = "LOAD_Consolidation_Masterdata_ROUTE_READY_WITH_TRUCKS.xlsx"
df = pd.read_excel(file_path)

# Convert all datetime columns to string
for col in df.columns:
    if pd.api.types.is_datetime64_any_dtype(df[col]):
        df[col] = df[col].dt.strftime('%Y-%m-%d')

data = df.to_dict(orient='records')
with open('src/data/dataset.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Converted Excel to src/data/dataset.json")
