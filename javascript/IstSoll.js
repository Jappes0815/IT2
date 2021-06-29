function compareIstSoll() {
    var urls = ["https://it2wi1.if-lab.de/rest/ft_prod_ist", "https://it2wi1.if-lab.de/rest/ft_prod_soll"]
    var promises = [];
    urls.forEach(function(url) {
        promises.push(d3.json(url))
    });
    console.log(promises)
    Promise.all(promises)
        .then((result) => empfangeDaten(result), function(error) {
            console.log(error);
        });
}

function showGraph(results, errors) {
    // List of subgroups = header of the csv files = soil condition here
    const subgroups = ["soll", "nichtSoll", "error"];

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    const groups = results.map(d => d.name)

    // set the dimensions and margins of the graph
    var StatuschangeDiv = document.getElementById("IstSoll")
    d3.select("#IstSoll").html(null);
    console.log(StatuschangeDiv);
    console.log(StatuschangeDiv.getBoundingClientRect().width);

    // set the dimensions and istSollmargins of the graph
    var IstSollmargin = { top: 10, right: 30, bottom: 30, left: 50 },
        width = StatuschangeDiv.getBoundingClientRect().width - IstSollmargin.left - IstSollmargin.right,
        height = width + IstSollmargin.left + IstSollmargin.right - IstSollmargin.top - IstSollmargin.bottom;

    // append the istSollsvg object to the body of the page
    var svg = d3.select("#IstSoll")
        .append("svg")
        .attr("width", width + IstSollmargin.left + IstSollmargin.right)
        .attr("height", height + IstSollmargin.top + IstSollmargin.bottom)
        .attr("style", "box-shadow: 0 0  2pt 1pt black;")
        .style("background", "white")
        .append("g")
        .attr("transform", `translate(${IstSollmargin.left},${IstSollmargin.top})`)
        .on("click", function() {
            d3.select("#SubgraphInfo")
                .html('<h4>Detailansicht</h4><p>Bitte tippen Sie auf die Werte der Graphen, um eine detaillierte Aufschlüsselung zu erhalten.</p>')
            IstSollSubTable(errors)
        });

    // Add X axis
    const x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])

    var xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)

    xAxis.call(d3.axisBottom(x))
        .selectAll("Text")
        .attr("transform", "translate(0,0)rotate(-15)")
        .style("text-anchor", "middle")
        .style("font-size", Math.round(width / 30) + "px");

    // Add Y axis
    const y = d3.scaleLinear()
        .range([height, 0]);

    const yAxis = svg.append("g")
        .attr("class", "YAxis");

    // Update Y Axis
    y.domain([0, d3.max(results, d => d.soll + d.nichtSoll + d.error)])
    yAxis.transition().duration(1000).call(d3.axisLeft(y))

    // color palette = one color per subgroup
    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#4daf4a', '#ffa500', '#e41a1c'])

    //stack the data? --> stack per subgroup
    const stackedData = d3.stack()
        .keys(subgroups)
        (results)
        // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.name))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .attr("stroke", "grey")
}



function IstSollSubTable(data) {
    var chart = document.getElementById("Subgraph");
    var width = chart.getBoundingClientRect().width;
    var height = chart.getBoundingClientRect().height;
    console.log(width)
    console.log(height)
    d3.select("#Subgraph").html(null);
    var valueFunc = function(data) { return data.error; }
    var textFunc = function(data) { return data.date; }
    var columns = ["Datum", "Fehler"];
    drawIstSollTable(data, "#Subgraph", { width: width, height: height }, valueFunc, textFunc, columns);
}

function drawIstSollTable(data, tableid, dimensions, valueFunc, textFunc, columns) {
    console.log(data)
    var sortValueAscending = function(a, b) { return valueFunc(a) - valueFunc(b) }
    var sortValueDescending = function(a, b) { return valueFunc(b) - valueFunc(a) }
    var sortNameAscending = function(a, b) { return textFunc(a).localeCompare(textFunc(b)); }
    var sortNameDescending = function(a, b) { return textFunc(b).localeCompare(textFunc(a)); }
    var metricAscending = true;
    var nameAscending = true;

    var width = dimensions.width + "px";
    var height = dimensions.height + "px";
    var twidth = (dimensions.width - 25) + "px";
    var divHeight = (dimensions.height - 30) + "px";

    var outerTable = d3.select(tableid).append("table").attr("width", width)
        .attr("style", "outline: thin solid black;")
        .attr("class", "IstSollsub");

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
                return { column: column, text: textFunc(d), value: valueFunc(d) };
            });
        }).enter().append("td")
        .text(function(d) {
            if (d.column === columns[0]) return d.text;
            else if (d.column === columns[1]) return d.value;
        })
        .on("click", function(i, d) {
            d3.select("#SubgraphInfo")
                .html('<h4>' + d.text + ': <br>' + d.value + '</h4>')
        })
        .style("font-size", Math.round(dimensions.width / 30) + "px");
}

function empfangeDaten(result) {
    ist = result[0];
    soll = result[1];
    shiftcount = 0;
    console.log(ist)
    console.log(soll)

    results = [{ name: "Schneiden", soll: 0, nichtSoll: 0, error: 0, fullname: "Rotationswelzschneiden" },
        { name: "H & A", soll: 0, nichtSoll: 0, error: 0, fullname: "Haerten und Anlassen" },
        { name: "B & V", soll: 0, nichtSoll: 0, error: 0, fullname: "Bohren und Verguetung" },
        { name: "Montage", soll: 0, nichtSoll: 0, error: 0, fullname: "Montage" },
        { name: "Handling", soll: 0, nichtSoll: 0, error: 0, fullname: "Handling" },
        { name: "Justieren", soll: 0, nichtSoll: 0, error: 0, fullname: "Justieren" },
        { name: "Pruefung", soll: 0, nichtSoll: 0, error: 0, fullname: "Pruefung (Stichprobentest)" },
        { name: "S & V", soll: 0, nichtSoll: 0, error: 0, fullname: "Schmiedung und Verguetung" }
    ];
    errors = [];


    // Rotate through jsons
    for (var i = 0; i < ist.length; i++) {
        // Check if dates are synchronized 
        while (ist[i].datum != soll[i].datum) {
            if (ist[i].datum > soll[i].datum) {
                soll.shift();
                shiftcount++;
            } else if (ist[i].datum < soll[i].datum) {
                ist.shift();
                shiftcount++;
            }
        }

        // Check values of json entry
        var errorcount = 0;
        var sollcount = 0;
        var nichtSollcount = 0;

        if (ist[i].werte["Automatisiertes Hochregallager"] == "error") {
            errorcount = 1;
            errors.unshift({
                date: ist[i].datum,
                error: ist[i].werte["Produktionsablauf"] + ": Fehler im Automatisierten Hochlager!"
            })
        }
        if (ist[i].werte["Vakuum-Sauggreifer"] == "error") {
            errorcount = 1;
            errors.unshift({
                date: ist[i].datum,
                error: ist[i].werte["Produktionsablauf"] + ": Fehler im Vakuum-Sauggreifer!"
            })
        }
        if (ist[i].werte["Brennofen "] == "error") {
            errorcount = 1;
            errors.unshift({
                date: ist[i].datum,
                error: ist[i].werte["Produktionsablauf"] + ": Fehler im Brennofen!"
            })
        }
        if (ist[i].werte["Saege"] == "error") {
            errorcount = 1;
            errors.unshift({
                date: ist[i].datum,
                error: ist[i].werte["Produktionsablauf"] + ": Fehler in der Saege!"
            })
        }
        if (ist[i].werte["Sortierstrecke mit Farberkennung"] == "error") {
            errorcount = 1;
            errors.unshift({
                date: ist[i].datum,
                error: ist[i].werte["Produktionsablauf"] + ": Fehler in der Sortierstrecke mit Farberkennung!"
            })
        }
        if (errorcount == 0) {
            if (Date.parse('01/01/2000 ' + ist[i].werte["Prozesszeit "]) <= Date.parse('01/01/2000 ' + soll[i].werte["Prozesszeit "])) {
                sollcount++;
            } else {
                nichtSollcount++;
            }
        }

        // Insert Data into results Array
        if (ist[i].werte["Produktionsablauf"] == "Rotationswelzschneiden") {
            results[0].soll += sollcount;
            results[0].nichtSoll += nichtSollcount;
            results[0].error += errorcount;
        } else if (ist[i].werte["Produktionsablauf"] == "Haerten und Anlassen") {
            results[1].soll += sollcount;
            results[1].nichtSoll += nichtSollcount;
            results[1].error += errorcount;
        } else if (ist[i].werte["Produktionsablauf"] == "Bohren und Verguetung") {
            results[2].soll += sollcount;
            results[2].nichtSoll += nichtSollcount;
            results[2].error += errorcount;
        } else if (ist[i].werte["Produktionsablauf"] == "Montage") {
            results[3].soll += sollcount;
            results[3].nichtSoll += nichtSollcount;
            results[3].error += errorcount;
        } else if (ist[i].werte["Produktionsablauf"] == "Handling") {
            results[4].soll += sollcount;
            results[4].nichtSoll += nichtSollcount;
            results[4].error += errorcount;
        } else if (ist[i].werte["Produktionsablauf"] == "Justieren") {
            results[5].soll += sollcount;
            results[5].nichtSoll += nichtSollcount;
            results[5].error += errorcount;
        } else if (ist[i].werte["Produktionsablauf"] == "Pruefung (Stichprobentest)") {
            results[6].soll += sollcount;
            results[6].nichtSoll += nichtSollcount;
            results[6].error += errorcount;
        } else if (ist[i].werte["Produktionsablauf"] == "Schmiedung und Verguetung") {
            results[7].soll += sollcount;
            results[7].nichtSoll += nichtSollcount;
            results[7].error += errorcount;
        }
    }
    console.log(results);
    console.log(errors);
    showGraph(results, errors);
}

compareIstSoll();
window.addEventListener("resize", compareIstSoll);