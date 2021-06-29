//get values from server
function getWegstrecken() {
    d3.json("https://it2wi1.if-lab.de/rest/ft_rfid").then(function(data, error) {
        if (error) {
            console.log(error);
        } else {
            var results = []; // Aufbau{ ID:, Farbe:, Typ:, Strecken: [Datum, Station, Priorität] }];
            for (var entry of data) {
                var found = false;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].ID === entry.werte["Numerische ID"]) {
                        results[i].Strecken.unshift({ Datum: entry.datum, Ablauf: entry.werte["Produktionsablauf"], Prioritaet: entry.werte["Prioritaet"] });
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    results.unshift({ ID: entry.werte["Numerische ID"], Farbe: entry.werte["Farbe"], Typ: entry.werte["Typ"], Strecken: [{ Datum: entry.datum, Ablauf: entry.werte["Produktionsablauf"], Prioritaet: entry.werte["Prioritaet"] }] });

                }
            }
            console.log(results);
            updateTable(results);
        }
    });

}


//Create Main Table (After page loading)
function updateTable(data) {
    d3.select("#Wegstrecken").html(null);
    var chart = document.getElementById("Wegstrecken");
    var width = chart.getBoundingClientRect().width;
    var height = width;
    console.log(height)
    var valueFunc = function(data) { return data.Strecken.length; }
    var textFunc = function(data) { return data.ID; }
    var farbFunc = function(data) { return data.Farbe; }
    var typFunc = function(data) { return data.Typ; }
    var columns = ["ID", "Farbe", "Typ", "Strecken"];
    drawTable(data, "#Wegstrecken", { width: width, height: height }, valueFunc, textFunc, farbFunc, typFunc, columns);
}

function drawTable(data, tableid, dimensions, valueFunc, textFunc, farbFunc, typFunc, columns) {

    var sortValueAscending = function(a, b) { return valueFunc(a) - valueFunc(b) }
    var sortValueDescending = function(a, b) { return valueFunc(b) - valueFunc(a) }
    var sortNameAscending = function(a, b) { return textFunc(a).localeCompare(textFunc(b)); }
    var sortNameDescending = function(a, b) { return textFunc(b).localeCompare(textFunc(a)); }
    var metricAscending = true;
    var nameAscending = true;

    var width = dimensions.width + "px";
    var height = dimensions.height + "px";
    var headHeight = dimensions.height / 6;
    var twidth = (dimensions.width - 25) + "px";
    var divHeight = (dimensions.height - headHeight) + "px";

    var outerTable = d3.select(tableid).append("table").attr("width", width)
        .attr("height", height)
        .attr("style", "outline: thin solid black;")
        .attr("style", "box-shadow: 0 0  2pt 1pt black;")
        .style("background", "white");

    outerTable.append("tr").append("td")
        .attr("style", "outline: thin solid black;")
        .append("table").attr("class", "headerTable").attr("width", width)
        .attr("height", headHeight + "px")
        .append("tr").selectAll("th").data(columns).enter()
        .append("th").style("font-size", Math.round(dimensions.width / 18) + "px")
        .append("th").style("text-align", "center")
        .append("th").text(function(column) { return column; })
        .selectAll("th").attr("class", "th")
        .on("click", function(d) {
            // Choose appropriate sorting function.
            if (d === columns[0]) {
                var sort = metricAscending ? sortValueAscending : sortValueDescending;
                metricAscending = !metricAscending;
            } else if (d === columns[1]) {
                var sort = nameAscending ? sortNameAscending : sortNameDescending
                nameAscending = !nameAscending;
            }

            var rows = tbody.selectAll("tr").sort(sort);
        });

    var inner = outerTable.append("tr").append("td")
        .append("div").attr("class", "scroll").attr("width", width).attr("style", "height:" + divHeight + ";")
        .append("table").attr("class", "bodyTable").attr("border", 1).attr("width", twidth).attr("height", height).attr("style", "table-layout:fixed");

    var tbody = inner.append("tbody");
    // Create a row for each object in the data and perform an intial sort.
    var rows = tbody.selectAll("tr").data(data).enter().append("tr").sort(sortValueDescending);
    tbody.selectAll("tr").on("click", function(mouse, data) {
        d3.select("#SubgraphInfo")
            .html('<h4>Detailansicht</h4><p>Bitte tippen Sie auf die Werte der Graphen, um eine detaillierte Aufschlüsselung zu erhalten.</p>')
        updateWegstreckenSubTable(data.Strecken);
    })

    // Create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(d) {
            return columns.map(function(column) {
                return { column: column, text: textFunc(d), value: valueFunc(d), farbe: farbFunc(d), typ: typFunc(d) };
            });
        }).enter().append("td")
        .text(function(d) {
            if (d.column === columns[0]) return d.text;
            else if (d.column === columns[1]) return d.farbe;
            else if (d.column === columns[2]) return d.typ;
            else if (d.column === columns[3]) return d.value;

        })
        .style("font-size", Math.round(dimensions.width / 30) + "px");

}


//Create Sub Table (By clicking a row)
function updateWegstreckenSubTable(data) {
    d3.select("#Subgraph").html(null);
    var chart = document.getElementById("Subgraph");
    var width = chart.getBoundingClientRect().width;
    var height = chart.getBoundingClientRect().height;
    var dateFunc = function(data) { return data.Datum; }
    var stationFunc = function(data) { return data.Ablauf; }
    var prioFunc = function(data) { return data.Prioritaet; }
    var columns = ["Datum", "Station", "Priorität"];
    drawWegstreckenSubTable(data, "#Subgraph", { width: width, height: height }, dateFunc, stationFunc, prioFunc, columns);
}

function drawWegstreckenSubTable(data, tableid, dimensions, dateFunc, stationFunc, prioFunc, columns) {

    var sortValueAscending = function(a, b) { return dateFunc(a) - dateFunc(b) }
    var sortValueDescending = function(a, b) { return dateFunc(b) - dateFunc(a) }
    var sortNameAscending = function(a, b) { return stationFunc(a).localeCompare(stationFunc(b)); }
    var sortNameDescending = function(a, b) { return stationFunc(b).localeCompare(stationFunc(a)); }
    var metricAscending = true;
    var nameAscending = true;

    var width = dimensions.width + "px";
    var height = dimensions.height + "px";
    var twidth = (dimensions.width - 25) + "px";
    var divHeight = (dimensions.height - 30) + "px";

    var outerTable = d3.select(tableid).append("table").attr("width", width)
        .attr("style", "outline: thin solid black;")
        .attr("class", "Wegstreckensub");

    outerTable.append("tr").append("td")
        .attr("style", "outline: thin solid black;")
        .append("table").attr("class", "headerTable").attr("width", twidth)
        .append("tr").selectAll("th").data(columns).enter()
        .append("th").text(function(column) { return column; })
        .selectAll("th").attr("class", "th")
        .on("click", function(d) {
            // Choose appropriate sorting function.
            if (d === columns[0]) {
                var sort = metricAscending ? sortValueAscending : sortValueDescending;
                metricAscending = !metricAscending;
            } else if (d === columns[1]) {
                var sort = nameAscending ? sortNameAscending : sortNameDescending
                nameAscending = !nameAscending;
            }

            var rows = tbody.selectAll("tr").sort(sort);
        });

    var inner = outerTable.append("tr").append("td")
        .append("div").attr("class", "scroll").attr("width", width).attr("style", "height:" + divHeight + ";")
        .append("table").attr("class", "bodyTable").attr("border", 1).attr("width", twidth).attr("height", height).attr("style", "table-layout:fixed");

    var tbody = inner.append("tbody");
    // Create a row for each object in the data and perform an intial sort.
    var rows = tbody.selectAll("tr").data(data).enter().append("tr").sort(sortValueDescending);

    // Create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(d) {
            return columns.map(function(column) {
                return { column: column, date: dateFunc(d), station: stationFunc(d), prio: prioFunc(d) };
            });
        }).enter().append("td")
        .text(function(d) {
            console.log(d.date)
            if (d.column === columns[0]) return d.date;
            else if (d.column === columns[1]) return d.station;
            else if (d.column === columns[2]) return d.prio;

        })
        .on("click", function(i, d) {
            d3.select("#SubgraphInfo")
                .style("font-size", Math.round(document.getElementById("Subgraph").getBoundingClientRect().width / 30) + "px")
                .html('<h4>' + d.date + ':</h4> <br>' + d.station + ' Priorität ' + d.prio + '.')
        })
        .style("font-size", Math.round(dimensions.width / 30) + "px");
}
getWegstrecken();
window.addEventListener("resize", getWegstrecken);
