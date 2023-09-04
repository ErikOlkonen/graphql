import {loginUser} from "https://erikolkonen.github.io/graphql/login.js";
import {fetchUserData} from "https://erikolkonen.github.io/graphql/fetch.js";
import {logout} from "./logout.js";
import {initialQuery} from "./queries.js";
import { getUserLevelQuery, getUserXPQuery, getAuditRatio, getAuditInfo} from "./queries.js";

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    loginUser(username, password).then(loginSuccess => {

        if (loginSuccess) {

            fetchUserData(initialQuery).then(userDataResponse => {

                const userData = userDataResponse.data.user; // Extract the user array

                const userId = userData[0].id;

                fetchUserData(getUserLevelQuery(userId)).then(userLevelDataResponse => {

                    const levelData = userLevelDataResponse.data.transaction;

                    fetchUserData(getUserXPQuery(userId)).then(userXpResponse => {

                        const count = userXpResponse.data.xpTransaction.aggregate.count;
                        const sum = userXpResponse.data.xpTransaction.aggregate.sum.amount;

                        renderUserData(userData, levelData, count, sum);

                        fetchUserData(getAuditRatio(userId)).then(auditRatioResponse => {

                            const auditDoneXP = auditRatioResponse.data.aggregate_done.aggregate.sum.amount;
                            const auditReceivedXP = auditRatioResponse.data.aggregate_received.aggregate.sum.amount;

                            const roundedReceivedXP = Math.round(auditReceivedXP);
                            const roundedDoneXP = Math.round(auditDoneXP);

                            const ratio = roundedDoneXP / roundedReceivedXP;

                            drawAuditsGraph(roundedDoneXP, roundedReceivedXP, ratio);

                            fetchUserData(getAuditInfo(userId)).then(auditInfoResponse => {

                                // const topAuditsArray = Object.values(auditInfoResponse.data); // Convert the object into an array

                                // console.log(auditInfoResponse.data.done[0].object.name); // malware

                                // console.log(auditInfoResponse.data.done); // (39)

                                drawTopAuditsGraph(auditInfoResponse.data.done);

                            })
                        })
                    })
                })
            });
        }
    });
});

// Add event listener to the log-out button
document.getElementById('logout-button').addEventListener('click', logout);

function drawTopAuditsGraph(topAudits) {

    const container = document.getElementById("graph-container-2")
    container.style.display = "block";

    // Sort the topAudits array by XP points in descending order
    topAudits.sort((a, b) => b.amount - a.amount);

    // Define an array of colors for the bars
    const colors = d3.schemeCategory10; // You can use any color scheme you like

    // Create a color scale
    const colorScale = d3.scaleOrdinal()
        .domain(topAudits.map((audit) => audit.object.name))
        .range(colors);

    // Define the SVG dimensions and margins
    const svgWidth = 1200;
    const svgHeight = 400;
    const margin = { top: 20, right: 20, bottom: 110, left: 60 };

    // Calculate the available width and height for the chart area
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // Select the SVG element
    const svg = d3.select("#top-audits-graph");

    // Set the SVG size
    svg.attr("width", svgWidth).attr("height", svgHeight).style("background-color", "black");

    // Create a group (g) element for the chart and apply margins
    const chart = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create a linear scale for the x-axis (audit names)
    const xScale = d3
        .scaleBand()
        .domain(topAudits.map((topAudits) => topAudits.object.name))
        .range([0, chartWidth])
        .padding(0.1);

    // Create a linear scale for the y-axis (XP points)
    const yScale = d3
        // .scaleLinear()
        .scaleLog() // logarithmic scaling
        // .domain([0, d3.max(topAudits, (audit) => audit.amount)])
        .domain([1500, d3.max(topAudits, (audit) => audit.amount)]) // Start from 1 to avoid log(0)
        .nice()
        .range([chartHeight, 0]);

    // Create the x-axis
    chart
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-45)");

    // Create the y-axis
    // chart.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));
    chart.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale).ticks(4).tickFormat(d3.format(".0s"))); // Format tick labels


    // Create the bars for each audit
    chart
        .selectAll(".bar")
        .data(topAudits)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (audit) => xScale(audit.object.name))
        .attr("y", (audit) => yScale(audit.amount))
        .attr("width", xScale.bandwidth())
        .attr("height", (audit) => chartHeight - yScale(audit.amount))
        .attr("fill", (audit) => colorScale(audit.object.name)); // Set the fill color based on the color scale
}

function drawAuditsGraph(auditDoneXP, auditReceivedXP) {

    const sum = auditDoneXP + auditReceivedXP;

    // Calculate bar heights based on the XP values
    const doneBarWidth  = (auditDoneXP / sum) * 350; // You can adjust the scaling as needed
    const receivedBarWidth = (auditReceivedXP / sum) * 350;
    const auditRatio = (auditDoneXP / auditReceivedXP).toFixed(1); // Calculate audit ratio

    // Format auditDoneXP and auditReceivedXP based on the number of digits
    const formatNumber = (value) => {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(2) + " MB";
        } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + " kB";
        } else {
            return value.toFixed(0) + " B";
        }
    };

    const formattedDoneXP = formatNumber(auditDoneXP);
    const formattedReceivedXP = formatNumber(auditReceivedXP);

    const container = document.getElementById("graph-container")
    container.style.display = "block";

    // Create the SVG bar graph
    const svg = document.getElementById("audit-ratio-graph");
    svg.style.display = "block";

    svg.innerHTML = `
    <text x="10" y="40" class="graph-label" style="font-size: 24px;">Audit Ratio: ${auditRatio}</text>
         <rect x="10" y="50" width="${doneBarWidth}" height="40" fill="blue" />
        <text x="10" y="70" class="graph-label">Done: ${formattedDoneXP}</text>
        <rect x="10" y="110" width="${receivedBarWidth}" height="40" fill="green" />
        <text x="10" y="125" class="graph-label">Received: ${formattedReceivedXP}</text>
    `;
}

function renderUserData(userData, lvlData, count, sum) {
    const userDataDiv = document.getElementById('user-data');

    // Create a table element
    const table = document.createElement('table');
    table.classList.add('user-data-table'); // Add a class for styling

    // Create table header row
    const headerRow = table.insertRow();
    const headerCells = ['ID', 'Username', 'Account Creation Time', 'Level', 'Projects Done', 'XP'];

    headerCells.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });

    // Create table rows and cells for each user
    userData.forEach(user => {
        const row = table.insertRow();

        const idCell = row.insertCell();
        idCell.textContent = user.id;

        const loginCell = row.insertCell();
        loginCell.textContent = user.login;

        const createdAtCell = row.insertCell();
        const createdAtDate = new Date(user.createdAt);
        createdAtCell.textContent = createdAtDate.toLocaleString();

        lvlData.forEach(level => {
            const levelCell = row.insertCell();
            levelCell.textContent = level.amount;
        })

        const projectsDone = row.insertCell();
        projectsDone.textContent = count;

        const xpSum = row.insertCell();
        const xpSumValue = sum / 1000; // Divide by 1000
        xpSum.textContent = xpSumValue.toFixed(0) + " kB"; // Format and add "kB"
    });

    userDataDiv.appendChild(table);
}
