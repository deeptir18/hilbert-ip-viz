from flask import *
import pandas as pd
from io import StringIO
from query import *
app = Flask(__name__,
            template_folder='static/templates')

def make_csv_response(df):
    output = StringIO()
    df.to_csv(output)
    return Response(output.getvalue(), mimetype="text/csv")

@app.route("/asn")
def asn():
    as_number = request.args.get("num")
    name = get_as_name(as_number)
    return jsonify({"name": name})

@app.route('/')
def index():
    """ 
    Displays the index page accessible at '/'
    """
    return render_template('index.html')

@app.route("/slash16")
def slash16():
    slash8 = request.args.get("slash8")
    # load the csv
    ## all of these are cached!
    prefix = slash8.split(".")[0]
    filename = SLASH8_FOLDER / "{}.csv".format(prefix)
    originalCSV = read_original(filename)
    grouped = groupby_slash16(originalCSV, slash8)
    return make_csv_response(grouped)

@app.route("/slash24")
def slash24():
    slash16 = request.args.get("slash16")
    prefix = slash16.split(".")[0]
    filename = SLASH8_FOLDER / "{}.csv".format(prefix)
    # load the csv
    originalCSV = read_original(filename)
    grouped = groupby_slash24(originalCSV, slash16)
    return make_csv_response(grouped)

@app.route("/slash32")
def slash32():
    slash24 = request.args.get("slash24")
    prefix = slash24.split(".")[0]
    filename = SLASH8_FOLDER / "{}.csv".format(prefix)
    # load the csv
    originalCSV = read_original(filename)
    slash32data = show_slash32(originalCSV, slash24)
    return make_csv_response(slash32data)


if __name__ == '__main__':
    app.run(app.run(port = 8001), debug = True)
