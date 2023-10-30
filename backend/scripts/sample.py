import random

SAMPLE = 0.01 
FILE_IN = "backend/data/BRAZIL_EXP_COMPLETE_1.csv"
FILE_OUT = "backend/data/BRAZIL_EXP_COMPLETE_2.csv"
#FILE_IN = "backend/data/PAIS.csv"
#FILE_OUT = "backend/data/PAIS_01.csv"

rows = []
with open(FILE_IN, "r", encoding="raw_unicode_escape") as in_file:
    with open(FILE_OUT, "a", encoding="raw_unicode_escape") as out_file:
        header = in_file.readline()
        out_file.write(header)
        while line := in_file.readline():
            if random.random() < SAMPLE:
                out_file.write(line)
        
