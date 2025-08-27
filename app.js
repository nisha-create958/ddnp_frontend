const API_BASE = "https://ddnp-backend.onrender.com";

let nuclearData = [];

// Load all nuclei from backend
fetch(`${API_BASE}/api/nuclei`)
  .then(res => res.json())
  .then(json => {
    nuclearData = json;
    drawChart();
  });

function drawChart() {
  let z = nuclearData.map(d => parseInt(d.Z));
  let n = nuclearData.map(d => parseInt(d.N));
  let colors = nuclearData.map(d => d.M_exp ? parseFloat(d.M_exp) : null);

  // Color scale (like NNDC)
  let trace = {
    x: n,
    y: z,
    mode: "markers",
    type: "scatter",
    marker: {
      size: 8,
      symbol: "circle",
      color: colors,
      colorscale: "Jet",
      showscale: true,
      colorbar: {
        title: "Mass Excess"
      }
    },
    text: nuclearData.map(d => `Z=${d.Z}, N=${d.N}, A=${d.A}`),
    hoverinfo: "text"
  };

  let layout = {
    xaxis: { title: "Neutron Number (N)", titlefont: { size: 16, weight: "bold" }, showgrid: true },
    yaxis: { title: "Proton Number (Z)", titlefont: { size: 16, weight: "bold" }, showgrid: true },
    margin: { t: 30, r: 30, l: 50, b: 50 },
    plot_bgcolor: "#fff",
    paper_bgcolor: "#fff",
    showlegend: false
  };

  Plotly.newPlot("chartArea", [trace], layout);

  // Click handler
  document.getElementById("chartArea").on("plotly_click", function(event) {
    let point = event.points[0].pointIndex;
    showInfo(nuclearData[point]);
  });
}

// Display details inside floating infoBox
function showInfo(nucleus) {
  let box = document.getElementById("infoBox");
  box.style.display = "block";
  box.innerHTML = `
    <table>
      <tr><th colspan="2">Isotope Details</th></tr>
      <tr><td>Z</td><td>${nucleus.Z}</td></tr>
      <tr><td>N</td><td>${nucleus.N}</td></tr>
      <tr><td>A</td><td>${nucleus.A}</td></tr>
      <tr><td>Mass Excess (Exp)</td><td>${nucleus.M_exp ?? "Not available"}</td></tr>
      <tr><td>Mass Excess (Theory)</td><td>${nucleus.M_ELMA ?? "Not available"}</td></tr>
      <tr><td>Binding Energy (Exp)</td><td>${nucleus["B.E_exp"] ?? "Not available"}</td></tr>
      <tr><td>Binding Energy (Theory)</td><td>${nucleus["B.E_ELMA"] ?? "Not available"}</td></tr>
    </table>
  `;
}

// Search nucleus by Z, N
function searchNucleus() {
  let z = document.getElementById("zInput").value;
  let n = document.getElementById("nInput").value;

  fetch(`${API_BASE}/api/nuclei/${z}/${n}`)
    .then(res => {
      if (!res.ok) throw new Error("Not found");
      return res.json();
    })
    .then(nucleus => showInfo(nucleus))
    .catch(() => alert("Nucleus not found in dataset"));
}

// Tabs
function openTab(tabName) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
}
document.getElementById("chart").classList.add("active"); // default
