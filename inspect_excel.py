
import pandas as pd

file_path = "LOAD_Consolidation_Masterdata_ROUTE_READY_WITH_TRUCKS.xlsx"
df = pd.read_excel(file_path)
print(df.head())
print(df.columns)
