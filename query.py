import pandas as pd
from pathlib import Path
ROOTFILE = "./static/data/ssh_data_viz.csv"
SLASH8_FOLDER = Path("./static/data/slash8")
locations = ["australia", "brazil", "censys", "germany", "japan", "stanford1",
        "stanford64"]
ASN_FILE = "./static/data/asn.csv"
def get_as_name(asn):
    df = pd.read_csv(ASN_FILE)
    ## parse ASN
    asn_string = '{}/8'.format(asn.zfill(3))
    line = df[df["Prefix"] == asn_string]
    return line.iloc[0]["Designation"]

def read_original(filename):
    df = pd.read_csv(filename, dtype={"australia": int, "brazil": int,
        "censys": int, "germany": int, "japan": int, "stanford1": int,
        "stanford64": int})
    for col in locations:
        df[col] = df[col]/df[col] == 1
        df[col] = df[col].astype(int)
    return df

def aggregate(df, groupby_col):
    agg_dict = {}
    for d1 in locations:
        agg_dict[d1] = sum
    for i in range(len(locations)):
        for j in range(i+1, len(locations)):
            d1 = locations[i]
            d2 = locations[j]
            union = "{}-{}-union".format(d1, d2)
            intersection = "{}-{}-intersection".format(d1, d2)
            
            
            df[union] = df[d1] | df[d2]
            df[union].astype(int)
            agg_dict[union] = sum
            df[intersection] = df[d1] & df[d2] # 1 if only both are 1
            df[intersection].astype(int)
            agg_dict[intersection] = sum
    grouped = df.groupby(groupby_col).agg(agg_dict)
    return grouped
    
def groupby_slash16(df, slash8):
    # filter for a specific slash8 and groupby slash16
    df = df[df["slash8"] == slash8]
    grouped = aggregate(df, "slash16")
    return grouped

def groupby_slash24(df, slash16):
    # filter for specific slash16 and groupby slash24
    df = df[df["slash16"] == slash16]
    grouped = aggregate(df, "slash24")
    return grouped

def show_slash32(df, slash24):
    ## renders all the IPS in a particular slash32 subset of the slash24 data
    df = df[df["slash24"] == slash24]
    ## javascript will do custom colors based on which things can see what
    return df



