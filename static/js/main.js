function renderLegend() {
    d3.selectAll("#legend svg").remove();
              
    var ordinal = d3.scaleOrdinal()
        .domain(["both", get_current_left(),   get_current_right(), "neither"])
  .range(["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4"])
    
    var svg = d3.select("#legend").append("svg");

    svg.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform");

    var legendOrdinal = d3.legendColor()
        .scale(ordinal).orient("horizontal").shapeWidth(70);

    svg.select(".legendOrdinal")
    .call(legendOrdinal);
}

function renderSingleLegend() {
    d3.selectAll("#smalllegend svg").remove();
    var ordinal = d3.scaleOrdinal()

  .domain(["neither"])
  .range(["#f4cae4"])
    
    var svg = d3.select("#smalllegend").append("svg");

    svg.append("g")
    .attr("class", "legendOrdinal")

    var legendOrdinal = d3.legendColor()
        .scale(ordinal);

    svg.select(".legendOrdinal")
    .call(legendOrdinal);
    
}

// event loop
$(document).ready(function(){
        // update which diffs are displayed
        $('#left_radio').change(function(){
            updateDiff();
        });
        $('#right_radio').change(function(){
            updateDiff();
        });
});

function hoverASN(d) {
    if (d == null) {
        return;
    }
    basequery="http://127.0.0.1:8001/asn";
    basequery = basequery.concat("?num=", d.start);
    d3.json(basequery,
        function(ret) {
            if (ret != null) {
                $("#ASN").val(ret.name);
            }
    })
}

function updateDiff() {
    diffString = get_current_left();
    diffString = diffString.concat(" and ", get_current_right());
    $("#diffs").val(diffString);
    renderslash8s();
    
}

function get_current_left() {
    return $("input[name='locA']:checked").val();
}

function get_current_right() {
    return $("input[name='locB']:checked").val();
}

function hilbertDemo(hilbertID) {
    const hilbertOrder = 4;
    const hilbertLength = Math.pow(4, hilbertOrder);
    updateDiff();
}

locations = ['australia', 'brazil', 'censys', 'germany', 'japan', 'stanford1', 'stanford64'];
function parseSlash(d, obj) {
    locations.forEach(function(loc) {
        obj[loc] = +d[loc];
    });
    locations.forEach(function(loc1) {
        locations.forEach(function(loc2) {
            if (loc1 == loc2) {
                return;
            }
            if (loc1 > loc2) {
                return;
            }
            keyname = loc1.concat("-", loc2);
            intersection = keyname.concat("-intersection");
            union = keyname.concat("-union");
            obj[union] = +d[union];
            obj[intersection] = +d[intersection];
        });
    });
    return obj;
}

function iou(intersection, union) { 
    return 1.0 - intersection/union
}

function divergingColorScale(d, l1, l2, slash) {
    var keyname;
    if (l1 > l2) {
        keyname = l2.concat("-", l1);
    } else {
        keyname = l1.concat("-", l2);
    }

    // if the two things equal each other -- just display fraction over 256
    if (l1 == l2) {
        var denom = 256;
        if (slash == 8) {
            denom = 256*256*256;
        } else if (slash == 16) {
            denom = 256*256;
        }
        return heatmapScale(d[l1]/(denom));
    }
    intersection = keyname.concat("-", "intersection");
    union = keyname.concat("-", "union")
    // global color scale defined in slider.js
    if (d[union] == 0) {
        return '#f4cae4'
    } else {
        return heatmapScale(iou(d[intersection], d[union]))
    }
}
// todo: loc is a window variable?
function getColor8(d) {
    return divergingColorScale(d,get_current_left(), get_current_right(), 8); 
}
function getColor16(d) {
    return divergingColorScale(d,get_current_left(),get_current_right(), 16); 
}
function getColor24(d) {
    return divergingColorScale(d,get_current_left(),get_current_right(), 24); 
}

// display custom colors based on if the two locations have seen or not
// #b3e2cd
// #fdcdac
// #cbd5e8
// #f4cae4
function getColor32(d) {
    if ((d[get_current_left()] == 1) && (d[get_current_right()] == 1)) {
        return "#b3e2cd";
    } else if (d[get_current_left()] == 1) {
        return "#fdcdac";
    } else if (d[get_current_right()] == 1) {
        return "#cbd5e8";
    } else {
        return "#f4cae4";
    }
}

function renderSlash32(slash24_pt) {
    document.getElementById("slash32div").style.display = "block";
    // remember to hide the legend
    renderLegend();
    $("#slash24").val(slash24_pt.slash24);
    function getslash32(d) {
        return d.ip.split(".")[3];
    }

    function parse24s(data) {
        var ret = [];
        data.forEach(function(d) {
            obj = {start: getslash32(d), length: 1, ip: d.ip, name: d.ip};
            locations.forEach(function(loc) {
                obj[loc] = +d[loc];
            });
            ret.push(obj);
        });
        return ret;
    }
    basequery="http://127.0.0.1:8001/slash32";
    basequery = basequery.concat("?slash24=", slash24_pt.slash24);
    console.log(basequery);

    d3.csv(basequery, function(ipd) {
        const myChart = HilbertChart();
        myChart()
            .margin(90)
            .hilbertOrder(32 / 8)
            .data(parse24s(ipd))
            .rangeLabel(getslash32)
            .rangeColor(getColor32)
            .showRangeTooltip(false)
            .valFormatter(function(d) { 
                pref = slash24_pt.slash24.split(".").slice(0, 3)
                pref.push(d);
                return pref.join(".");
            })
            (document.getElementById('hilbert-chart4'));
    });
}


function renderSlash24(slash16_pt) {
    function displaySlash24(d) {
        pref = slash16_pt.slash16.split(".").slice(0, 2);
        pref.push(d);
        ret = pref.join(".");
        ret = ret.concat("/24");
        return ret;
    }
    document.getElementById("slash24div").style.display = "block";
    document.getElementById("slash32div").style.display = "none";
    $("#slash16").val(slash16_pt.slash16);
    function getslash24(d) {
        return d.slash24.split(".")[2];
    }
    function parse16s(data) {
    var ret = [];
    data.forEach(function(d) {
        obj = {start: getslash24(d), length: 1, slash24: d.slash24};
        obj = parseSlash(d, obj);
        ret.push(
            obj
        )
    });
    return ret;
    }
    basequery="http://127.0.0.1:8001/slash24";
    basequery = basequery.concat("?slash16=", slash16_pt.slash16);
    console.log(basequery);
    d3.csv(basequery, function(ipd) {
        const myChart = HilbertChart();
        myChart()
            .margin(90)
            .hilbertOrder(32 / 8)
            .data(parse16s(ipd))
            .rangeLabel(getslash24)
            .rangeColor(getColor24)
            .showRangeTooltip(false)
            .valFormatter(displaySlash24)
            .onRangeClick(renderSlash32)
            (document.getElementById('hilbert-chart3'));
    });

}

function getASName(range) {
    if (range == null) {
        return null;
    }
    return ASName(range.start);
}

function ASName(num) {
    // query for name
    basequery="http://127.0.0.1:8001/asn";
    basequery = basequery.concat("?num=", num);
    d3.json(basequery,
        function(ret) {
            console.log("RESP", ret, ret.name);
            ASN = ret.name;
            return ASN;
    })
}

function renderSlash16(slash8_pt) {
    // query for the slash8
    function displaySlash16(d) {
        pref = slash8_pt.slash8.split(".").slice(0, 1);
        pref.push(d);
        ret = pref.join(".");
        ret = ret.concat(".0.0/16");
        return ret;

    }
    // make sure the div displays
    document.getElementById("slash16div").style.display = "block";
    document.getElementById("slash24div").style.display = "none";
    document.getElementById("slash32div").style.display = "none";
    // update the text to say which slash8 is being shown
    $("#slash8").val(slash8_pt.slash8);
    function getslash16(d) {
        return d.slash16.split(".")[1];
    }
    function parse16s(data) {
    console.log(data);
    var ret = [];
    data.forEach(function(d) {
        obj = {start: getslash16(d), length: 1, slash16: d.slash16};
        obj = parseSlash(d, obj);
        ret.push(
            obj
        )
    });
    return ret;
    }
    basequery="http://127.0.0.1:8001/slash16";
    basequery = basequery.concat("?slash8=", slash8_pt.slash8);
    console.log(basequery);

    d3.csv(basequery,
        function(ipd) {
            console.log('Finally got response');
            const myChart = HilbertChart();
            myChart()
                .margin(90)
                .hilbertOrder(32 / 8)
                .data(parse16s(ipd))
                .rangeLabel(function(d) { return d.slash16.split(".")[1] })
                .showRangeTooltip(false)
                .valFormatter(displaySlash16)
                .rangeColor(getColor16)
                .onRangeClick(renderSlash24)
            (document.getElementById('hilbert-chart2'));
    });
    /*d3.csv("static/data/slash16groups.csv", function(ipd) {
    });*/
    
}
function renderslash8s() {
    function displaySlash8(d) {
        ret = String(d).concat(".0.0.0/8");
        return ret;
    }
    // make sure the div displays
    document.getElementById("slash16div").style.display = "none";
    document.getElementById("slash24div").style.display = "none";
    document.getElementById("slash32div").style.display = "none";
    function getslash8(d) {
       return d.slash8.split(".")[0];
    }
    function parse8s(data) {
        var ret = [];
        data.forEach(function(d) {
            obj = {start: getslash8(d), length: 1, slash8: d.slash8};
            obj = parseSlash(d, obj);
            ret.push(obj);
        });
        return ret;
    }
    d3.csv("/static/data/slash8groups.csv", function(ipd) {
        const myChart = HilbertChart();
        myChart()
            .margin(90)
            .hilbertOrder(32 / 8)
            .data(parse8s(ipd))
            .rangeLabel(function(d) { return d.slash8.split(".")[0] })
            .rangeColor(getColor8)
                .showRangeTooltip(false)
            .valFormatter(displaySlash8)
            .onRangeClick(renderSlash16)
            .onRangeHover(hoverASN)
            (document.getElementById('hilbert-chart'));
    });
    
}
