import pandas as pd

df = pd.read_csv("backend/data/BRAZIL_EXP_COMPLETE_01.csv", sep=";",
                 dtype={"CO_NCM": str}
            )
df["CO_NCM"]

df["CO_NCM_0"] = df["CO_NCM"].apply(lambda x: str(x)[:2])
df["CO_NCM_1"] = df["CO_NCM"].apply(lambda x: str(x)[:4])
df["CO_NCM_2"] = df["CO_NCM"].apply(lambda x: str(x)[:6])


df.head()
with open("backend/data/EXP_COMPLETE_01_NCM.csv", "w") as f:
    f.write(df.to_csv(sep=";", index=0))

