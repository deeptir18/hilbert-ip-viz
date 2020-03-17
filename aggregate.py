import sys
import os
import pandas as pd
import ipaddress
from netaddr import *
import pprint
from pathlib import Path
import tqdm
import multiprocessing
## basically we want something that preserves the "diff stuff"
## maybe manually start with the diff between two places?
## so the dataframe shows -- at a /8 level, what is the difference between
## two of the locations
locations = ["australia", "brazil", "censys", "germany", "japan", "stanford1",
        "stanford64"]
def ip2int(ip):
    """
    Convert an IP string to int
    """
    return int(ipaddress.ip_address(ip))

def main():
    df = pd.read_csv(sys.argv[1], dtype={"australia": int, "brazil": int,
        "censys": int, "germany": int, "japan": int, "stanford1": int,
        "stanford64": int})
    for col in locations:
        df[col] = df[col]/df[col] == 1
        df[col] = df[col].astype(int)

    outfolder = Path(sys.argv[2])
    ## iterate through each slash8s and make a separate filtered file
    for slash8 in tqdm.tqdm(df.slash8.unique()):
        filtered = df[df["slash8"] == slash8]
        slash8_prefix = slash8.split(".")[0]
        filename = outfolder / "{}.csv".format(slash8_prefix)
        filtered.to_csv(filename, index = False)
        
def process():
    # group by /8
    df = pd.read_csv(sys.argv[1], dtype={"australia": int, "brazil": int,
        "censys": int, "germany": int, "japan": int, "stanford1": int,
        "stanford64": int})
    ## we want to have a count for each country, where the 
    ## filter by slash8
    for col in locations:
        df[col] = df[col]/df[col] == 1
        df[col] = df[col].astype(int)
    print(df)
    ## now create a diff column
    agg_dict = {}
    for d1 in locations:
        agg_dict[d1] = sum
    for i in range(len(locations)):
        for j in range(i+1, len(locations)):
            d1 = locations[i]
            d2 = locations[j]
            union = "{}-{}-union".format(d1, d2)
            intersection = "{}-{}-intersection".format(d1, d2)
            df[union] = (df[d1] + df[d2])/(df[d1] + df[d2]) == 1
            df[union].astype(int)
            agg_dict[union] = sum

            df[intersection] = df[d1]*df[d2] # 1 if only both are 1
            agg_dict[intersection] = sum

    #grouped = df.groupby("slash8").agg({"australia": sum, "brazil": sum, "germany": sum,
    #    "japan": sum, "stanford1": sum,
    #    "stanford64": sum, "censys": sum})
    #pd["slash8int"] = pd.apply(grouped.slash8, ip2int)
    grouped = df.groupby("slash8", "ASN").agg(agg_dict)
    #grouped["slash16int"] = pd.apply(grouped.slash16, ip2int)
    #grouped.to_csv("slash16groups.csv")
    grouped.to_csv("slash8groups.csv")
    #grouped.to_csv("slash24groups.csv")



if __name__ == '__main__':
    main()
