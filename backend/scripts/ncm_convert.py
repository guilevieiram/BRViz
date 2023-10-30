import json

with open("backend/data/Tabela_NCM_Vigente_20231030.json", 'r') as f:
    js = json.load(f)


noms = js["Nomenclaturas"]

len(noms)

noms[0]


import pandas as pd

df = pd.DataFrame(noms)

dff = df[["Codigo", "Descricao"]].rename(columns={
    "Codigo": "code",
    "Descricao": "description"
})
csv = dff.to_csv(sep=";", index=False)

with open("backend/data/NCM.csv", 'w') as f:
    f.write(csv)


