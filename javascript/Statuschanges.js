function getStatus() {
    // Parse the Data
    d3.json("https://it2wi1.if-lab.de/rest/ft_ablauf").then(function(data, error) {
        if (error) {
            console.log(error);
        } else {
            const statusArray = getMotorData(data);

            updateGraph(statusArray);
        }
    });
}

// Create main graph (called after page loads)
function updateGraph(statusArray) {
    d3.select("#Statuschange").html(null);
    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    var data = [{ key: "Hochregallager", count: statusArray[0].reduce(reducer), details: statusArray[0] },
        { key: "Bearbeitungsstation", count: statusArray[1].reduce(reducer), details: statusArray[1] },
        { key: "Sortierstrecke", count: statusArray[2].reduce(reducer), details: statusArray[2] },
        { key: "Sauggreifer", count: statusArray[3].reduce(reducer), details: statusArray[3] }
    ]
    console.log(data)
        // set the dimensions and margins of the graph
    var StatuschangeDiv = document.getElementById("Statuschange")
    console.log(StatuschangeDiv);
    console.log(StatuschangeDiv.getBoundingClientRect().width);

    var margin = { top: 10, right: 10, bottom: 30, left: 40 },
        width = StatuschangeDiv.getBoundingClientRect().width - margin.left - margin.right,
        height = width + margin.left + margin.right - margin.top - margin.bottom;

    console.log(width);
    console.log(height);
    // append the svg object to the body of the page
    const svg = d3.select("#Statuschange")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        //.attr("style", "outline: thin solid black;")
        .attr("style", "box-shadow: 0 0  2pt 1pt black;")
        .style("background", "white")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.2);

    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)

    // Update X Axis
    x.domain(data.map(d => d.key))
    xAxis.call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-10)")
        .style("text-anchor", "middle")
        .style("font-size", Math.round(width / 30) + "px");

    // Add Y axis
    const y = d3.scaleLinear()
        .range([height, 0]);

    const yAxis = svg.append("g")
        .attr("class", "YAxis");

    // Update Y Axis
    y.domain([0, d3.max(data, d => d.count) + 50])
    yAxis.transition().duration(1000).call(d3.axisLeft(y))

    // Create the u variable
    var u = svg.selectAll("rect")
        .data(data)


    u
        .join("rect") // Add a new rect for each new elements
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "#69b3a2")
        .on("click", function(m, d) {
            updateSubGraph(d.key, d);
        });

    u.join("text")
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d.key) + x.bandwidth() / 2; })
        .attr("y", function(d) { return y(d.count) - 05; })
        .style("font-size", Math.round(width / 25) + "px")
        .text(function(d) { return d.count; });


}

// Create sub graph (called by click on bar in main table)
function updateSubGraph(name, status) {
    var keys = [];
    var data = [];
    console.log(name)
    console.log(status)
    if (name === "Hochregallager") {
        keys = ["1 -Referenztaster horizontal", "2 - Referenztaster vertikal", "3 - Referenztaster Ausleger vorne", "4 - Referenztaster Ausleger hinten", "5 - Lichtschranke innen", "6 - Lichtschranke aussen", "7 - H-horizontal", "8 - H-vertikal"]
        for (var i = keys.length - 1; i >= 0; i--) {
            data.unshift({ key: i + 1, count: status.details[i], name: keys[i] })
        }
    } else if (name === "Bearbeitungsstation") {
        keys = ["1 - B-Referenzschalter Drehkranz (Pos. Sauger)", "2 - B-Referenzschalter Drehkranz (Pos. Foerderband)", "3 - B-Lichtschranke Ende Foerderband", "4 - B-Referenzschalter Drehkranz (Pos. Saege)", "5 - B-Referenzschalter Sauger (Pos. Drehkranz)", "6 - B-Referenzschalter Ofenschieber Innen", "7 - B-Referenzschalter Ofenschieber Aussen", "8 - B-Referenzschalter Sauger (Pos. Brennofen)", "9 - B-Lichtschranke Brennofen", "10 - B-Motor Drehkranz im Uhrzeigersinn", "11 - B-Motor Drehkranz gegen Uhrzeigersinn", "12 - B-Motor Foerderband vorwaerts", "13 - B-Motor Saege", "14 - B-Motor Ofenschieber Einfahren", "15 - B-Motor Ofenschieber Ausfahren", "16 - B-Motor Sauger zum Ofen", "17 - B-Motor Sauger zum Drehkranz"]
        for (var i = keys.length - 1; i >= 0; i--) {
            data.unshift({ key: i + 1, count: status.details[i], name: keys[i] })
        }
    } else if (name === "Sortierstrecke") {
        keys = ["1 - S-Lichtschranke Eingang", "2 - S-Lichtschranke nach Farbsensor", "3 - S-Lichtschranke weiss", "4 - S-Lichtschranke rot", "5 - S-Lichtschranke blau", "6 - S-Motor Foerderband"]
        for (var i = keys.length - 1; i >= 0; i--) {
            data.unshift({ key: i + 1, count: status.details[i], name: keys[i] })
        }
    } else {
        keys = ["1 - V-Referenzschalter vertikal", "2 - V-Referenzschalter horizontal", "3 - V-Referenzschalter drehen", "4 - V-vertikal", "5 - V-horizontal", "6 - V-drehen"]
        for (var i = keys.length - 1; i >= 0; i--) {
            data.unshift({ key: i + 1, count: status.details[i], name: keys[i] })
        }
    }
    // delete current content of div
    d3.select("#Subgraph").html(null);

    // set the dimensions and margins of the graph
    var StatuschangeDiv = document.getElementById("Subgraph")
    console.log(StatuschangeDiv);
    console.log(StatuschangeDiv.getBoundingClientRect().width);

    var margin = { top: 10, right: 10, bottom: 30, left: 40 },
        width = StatuschangeDiv.getBoundingClientRect().width - margin.left - margin.right,
        height = StatuschangeDiv.getBoundingClientRect().height - margin.top - margin.bottom;

    console.log(width);
    console.log(height);
    // append the svg object to the body of the page
    var subsvg = d3.select("#Subgraph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("style", "outline: thin solid black;")
        .attr("class", "Statussub")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.2);

    var xAxis = subsvg.append("g")
        .attr("transform", `translate(0,${height})`)

    // Update X Axis
    x.domain(data.map(d => d.key))
    xAxis.call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(0,0)rotate(-10)")
        .style("text-anchor", "middle")
        .style("font-size", Math.round(width / 30) + "px");

    // Add Y axis
    var y = d3.scaleLinear()
        .range([height, 0]);

    var yAxis = subsvg.append("g")
        .attr("class", "YAxis");

    // Update Y Axis
    y.domain([0, d3.max(data, d => d.count) + 50])
    yAxis.transition().duration(1000).call(d3.axisLeft(y))

    // Create the u variable
    var u = subsvg.selectAll("rect")
        .data(data)


    u
        .join("rect") // Add a new rect for each new elements
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.count))
        .attr("fill", "#69b3a2")

    u.join("text")
        .attr("text-anchor", "middle")
        .attr("x", function(d) { return x(d.key) + x.bandwidth() / 2; })
        .attr("y", function(d) { return y(d.count) - 05; })
        .style("font-size", Math.round(width / 25) + "px")
        .text(function(d) { return d.count; });

    d3.select("#SubgraphInfo")
        .style("font-size", Math.round(document.getElementById("Subgraph").getBoundingClientRect().width / 30) + "px")
        .html('<h4>Legende</h4>' + keys.join('<br/>'));
}


function getMotorData(data) {
    statusArray = data[0].werte;
    counterArray = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0]
    ];
    console.log(data[0]);
    for (var entry of data) {
        //Hochregallager
        if (entry.werte["Referenztaster horizontal"] != statusArray["Referenztaster horizontal"]) {
            counterArray[0][0]++;
        }
        if (entry.werte["Referenztaster vertikal"] != statusArray["Referenztaster vertikal"]) {
            counterArray[0][1]++;
        }
        if (entry.werte["Referenztaster Ausleger vorne"] != statusArray["Referenztaster Ausleger vorne"]) {
            counterArray[0][2]++;
        }
        if (entry.werte["Referenztaster Ausleger hinten"] != statusArray["Referenztaster hinten"]) {
            counterArray[0][3]++;
        }
        if (entry.werte["Lichtschranke innen"] != statusArray["Lichtschranke innen"]) {
            counterArray[0][4]++;
        }
        if (entry.werte["Lichtschranke aussen"] != statusArray["Lichtschranke aussen"]) {
            counterArray[0][5]++;
        }
        if (entry.werte["H-horizontal"] != statusArray["H-horizontal"]) {
            counterArray[0][6]++;
        }
        if (entry.werte["H-vertikal"] != statusArray["H-vertikal"]) {
            counterArray[0][7]++;
        }

        //Bearbeitungsstation
        if (entry.werte["B-Referenzschalter Drehkranz (Pos. Sauger)"] != statusArray["B-Referenzschalter Drehkranz (Pos. Sauger)"]) {
            counterArray[1][0]++;
        }
        if (entry.werte["B-Referenzschalter Drehkranz (Pos. Foerderband)"] != statusArray["B-Referenzschalter Drehkranz (Pos. Foerderband)"]) {
            counterArray[1][1]++;
        }
        if (entry.werte["B-Lichtschranke Ende Foerderband"] != statusArray["B-Lichtschranke Ende Foerderband"]) {
            counterArray[1][2]++;
        }
        if (entry.werte["B-Referenzschalter Drehkranz (Pos. Saege)"] != statusArray["B-Referenzschalter Drehkranz (Pos. Saege)"]) {
            counterArray[1][3]++;
        }
        if (entry.werte["B-Referenzschalter Sauger (Pos. Drehkranz)"] != statusArray["B-Referenzschalter Sauger (Pos. Drehkranz)"]) {
            counterArray[1][4]++;
        }
        if (entry.werte["B-Referenzschalter Ofenschieber Innen"] != statusArray["B-Referenzschalter Ofenschieber Innen"]) {
            counterArray[1][5]++;
        }
        if (entry.werte["B-Referenzschalter Ofenschieber Aussen"] != statusArray["B-Referenzschalter Ofenschieber Aussen"]) {
            counterArray[1][6]++;
        }
        if (entry.werte["B-Referenzschalter Sauger (Pos. Brennofen)"] != statusArray["B-Referenzschalter Sauger (Pos. Brennofen)"]) {
            counterArray[1][7]++;
        }
        if (entry.werte["B-Lichtschranke Brennofen"] != statusArray["B-Lichtschranke Brennofen"]) {
            counterArray[1][8]++;
        }
        if (entry.werte["B-Motor Drehkranz im Uhrzeigersinn"] != statusArray["B-Motor Drehkranz im Uhrzeigersinn"]) {
            counterArray[1][9]++;
        }
        if (entry.werte["B-Motor Drehkranz gegen Uhrzeigersinn"] != statusArray["B-Motor Drehkranz gegen Uhrzeigersinn"]) {
            counterArray[1][10]++;
        }
        if (entry.werte["B-Motor Foerderband vorwaerts"] != statusArray["B-Motor Foerderband vorwaerts"]) {
            counterArray[1][11]++;
        }
        if (entry.werte["B-Motor Saege"] != statusArray["B-Motor Saege"]) {
            counterArray[1][12]++;
        }
        if (entry.werte["B-Motor Ofenschieber Einfahren"] != statusArray["B-Motor Ofenschieber Einfahren"]) {
            counterArray[1][13]++;
        }
        if (entry.werte["B-Motor Ofenschieber Ausfahren"] != statusArray["B-Motor Ofenschieber Ausfahren"]) {
            counterArray[1][14]++;
        }
        if (entry.werte["B-Motor Sauger zum Ofen"] != statusArray["B-Motor Sauger zum Ofen"]) {
            counterArray[1][15]++;
        }
        if (entry.werte["B-Motor Sauger zum Drehkranz"] != statusArray["B-Motor Sauger zum Drehkranz"]) {
            counterArray[1][16]++;
        }
        if (entry.werte["B-Leuchte Ofen"] != statusArray["B-Leuchte Ofen"]) {
            counterArray[1][17]++;
        }

        //Sortierstrecke
        if (entry.werte["S-Lichtschranke Eingang"] != statusArray["S-Lichtschranke Eingang"]) {
            counterArray[2][0]++;
        }
        if (entry.werte["S-Lichtschranke nach Farbsensor"] != statusArray["S-Lichtschranke nach Farbsensor"]) {
            counterArray[2][1]++;
        }
        if (entry.werte["S-Lichtschranke weiss"] != statusArray["S-Lichtschranke weiss"]) {
            counterArray[2][2]++;
        }
        if (entry.werte["S-Lichtschranke rot"] != statusArray["S-Lichtschranke rot"]) {
            counterArray[2][3]++;
        }
        if (entry.werte["S-Lichtschranke blau"] != statusArray["S-Lichtschranke blau"]) {
            counterArray[2][4]++;
        }
        if (entry.werte["S-Motor Foerderband"] != statusArray["S-Motor Foerderband"]) {
            counterArray[2][5]++;
        }

        //Vakuum-Sauggreifer
        if (entry.werte["V-Referenzschalter vertikal"] != statusArray["V-Referenzschalter vertikal"]) {
            counterArray[3][0]++;
        }
        if (entry.werte["V-Referenzschalter horizontal"] != statusArray["V-Referenzschalter horizontal"]) {
            counterArray[3][1]++;
        }
        if (entry.werte["V-Referenzschalter drehen"] != statusArray["V-Referenzschalter drehen"]) {
            counterArray[3][2]++;
        }
        if (entry.werte["V-vertikal"] != statusArray["V-vertikal"]) {
            counterArray[3][3]++;
        }
        if (entry.werte["V-horizontal"] != statusArray["V-horizontal"]) {
            counterArray[3][4]++;
        }
        if (entry.werte["V-drehen"] != statusArray["V-drehen"]) {
            counterArray[3][5]++;
        }
    }
    console.log(counterArray)
    return counterArray;
}
getStatus()
window.addEventListener("resize", getStatus);
