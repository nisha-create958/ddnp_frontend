// Backend URL - Check if this is correct!
const API_BASE = "https://ddnp-backend.onrender.com";
// Uncomment the line below to test with a local backend instead
// const API_BASE = "http://localhost:10000";
console.log("Using API base URL:", API_BASE);

let nuclearData = [];

// Load all nuclei from backend
document.getElementById("chartArea").innerHTML = "<p>Loading nuclear data...</p>";

fetch(`${API_BASE}/api/nuclei`)
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(json => {
    console.log(`Loaded ${json.length} nuclei from backend`);
    nuclearData = json;
    drawChart();
  })
  .catch(error => {
    console.error('Error loading nuclear data:', error);
    document.getElementById("chartArea").innerHTML = `
      <p style="color: red;">Error loading nuclear data: ${error.message}</p>
      <p>Please check:</p>
      <ul>
        <li>Backend is deployed and running</li>
        <li>API_BASE URL is correct</li>
        <li>CORS is enabled on backend</li>
      </ul>
    `;
  });

function drawChart() {
  let z = nuclearData.map(d => parseInt(d.Z));
  let n = nuclearData.map(d => parseInt(d.N));
  
  // Use ELMA theoretical values when experimental data is not available
  let colors = nuclearData.map(d => {
    if (d.M_exp && d.M_exp !== "-") {
      return parseFloat(d.M_exp);
    } else if (d.M_ELMA && d.M_ELMA !== "-") {
      return parseFloat(d.M_ELMA);
    } else {
      return 0; // Default value for missing data
    }
  });

  // Create element symbols for better hover info (like NNDC)
  let elementSymbols = {
    1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 10: 'Ne',
    11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 16: 'S', 17: 'Cl', 18: 'Ar', 19: 'K', 20: 'Ca',
    21: 'Sc', 22: 'Ti', 23: 'V', 24: 'Cr', 25: 'Mn', 26: 'Fe', 27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn',
    31: 'Ga', 32: 'Ge', 33: 'As', 34: 'Se', 35: 'Br', 36: 'Kr', 37: 'Rb', 38: 'Sr', 39: 'Y', 40: 'Zr',
    41: 'Nb', 42: 'Mo', 43: 'Tc', 44: 'Ru', 45: 'Rh', 46: 'Pd', 47: 'Ag', 48: 'Cd', 49: 'In', 50: 'Sn',
    51: 'Sb', 52: 'Te', 53: 'I', 54: 'Xe', 55: 'Cs', 56: 'Ba', 57: 'La', 58: 'Ce', 59: 'Pr', 60: 'Nd',
    61: 'Pm', 62: 'Sm', 63: 'Eu', 64: 'Gd', 65: 'Tb', 66: 'Dy', 67: 'Ho', 68: 'Er', 69: 'Tm', 70: 'Yb',
    71: 'Lu', 72: 'Hf', 73: 'Ta', 74: 'W', 75: 'Re', 76: 'Os', 77: 'Ir', 78: 'Pt', 79: 'Au', 80: 'Hg',
    81: 'Tl', 82: 'Pb', 83: 'Bi', 84: 'Po', 85: 'At', 86: 'Rn', 87: 'Fr', 88: 'Ra', 89: 'Ac', 90: 'Th',
    91: 'Pa', 92: 'U', 93: 'Np', 94: 'Pu', 95: 'Am', 96: 'Cm', 97: 'Bk', 98: 'Cf', 99: 'Es', 100: 'Fm',
    101: 'Md', 102: 'No', 103: 'Lr', 104: 'Rf', 105: 'Db', 106: 'Sg', 107: 'Bh', 108: 'Hs', 109: 'Mt', 110: 'Ds',
    111: 'Rg', 112: 'Cn', 113: 'Nh', 114: 'Fl', 115: 'Mc', 116: 'Lv', 117: 'Ts', 118: 'Og', 119: 'Uue', 120: 'Ubn'
  };

  // Calculate color range for better visualization
  let validColors = colors.filter(c => c !== null && !isNaN(c));
  let minColor = Math.min(...validColors);
  let maxColor = Math.max(...validColors);
  
  // Expand the color range to show more variation (compress the scale)
  // This will make more nuclei visible in different colors instead of black
  let colorRange = maxColor - minColor;
  let expandedMin = minColor + colorRange * 0.1;  // Start from 10% of range
  let expandedMax = minColor + colorRange * 0.7;  // End at 70% of range
  
  console.log(`Original range: ${minColor.toFixed(2)} to ${maxColor.toFixed(2)}`);
  console.log(`Expanded range: ${expandedMin.toFixed(2)} to ${expandedMax.toFixed(2)}`);
  
  // Color scale with better range and custom colorscale
  let trace = {
    x: n,
    y: z,
    mode: "markers",
    type: "scatter",
    marker: {
      size: 8,
      symbol: "square",
      color: colors,
      colorscale: [
        [0.0, '#000080'],    // Dark blue for most negative (most stable)
        [0.2, '#0000FF'],    // Blue
        [0.4, '#00FFFF'],    // Cyan
        [0.5, '#00FF00'],    // Green
        [0.6, '#FFFF00'],    // Yellow
        [0.8, '#FF8000'],    // Orange
        [1.0, '#FF0000']     // Red for most positive (least stable)
      ],
      cmin: expandedMin,
      cmax: expandedMax,
      showscale: true,
      colorbar: {
        title: "Mass Excess (MeV)",
        titleside: "right",
        thickness: 20,
        len: 0.7
      }
    },
    text: nuclearData.map(d => {
      let symbol = elementSymbols[parseInt(d.Z)] || `Z${d.Z}`;
      let massValue, dataType;
      
      if (d.M_exp && d.M_exp !== "-") {
        massValue = d.M_exp;
        dataType = "Experimental";
      } else if (d.M_ELMA && d.M_ELMA !== "-") {
        massValue = d.M_ELMA;
        dataType = "ELMA Theory";
      } else {
        massValue = "N/A";
        dataType = "No Data";
      }
      
      return `<b>${symbol}-${d.A}</b><br>Z=${d.Z}, N=${d.N}<br>Mass Excess: ${massValue} MeV<br><i>(${dataType})</i>`;
    }),
    hovertemplate: '%{text}<extra></extra>',
    hoverlabel: {
      bgcolor: "rgba(255,255,255,0.9)",
      bordercolor: "#333",
      font: {size: 12}
    }
  };

  let layout = {
    xaxis: { 
      title: "Neutron Number (N)", 
      titlefont: { size: 16, color: "#333" }, 
      showgrid: true,
      gridcolor: "#ddd",
      zeroline: false
    },
    yaxis: { 
      title: "Proton Number (Z)", 
      titlefont: { size: 16, color: "#333" }, 
      showgrid: true,
      gridcolor: "#ddd",
      zeroline: false
    },
    margin: { t: 30, r: 100, l: 60, b: 60 },
    plot_bgcolor: "#fafafa",
    paper_bgcolor: "#fff",
    showlegend: false,
    hovermode: 'closest'
  };

  // Clear any loading text and plot the chart
  document.getElementById("chartArea").innerHTML = "";
  
  // Configuration to remove pan, box select, lasso select, reset, and axes options
  let config = {
    displayModeBar: true,
    modeBarButtonsToRemove: [
      'pan2d',
      'select2d',
      'lasso2d',
      'resetScale2d',
      'autoScale2d',
      'toggleSpikelines',
      'hoverCompareCartesian',
      'hoverClosestCartesian'
    ],
    displaylogo: false
  };
  
  Plotly.newPlot("chartArea", [trace], layout, config);

  // Click handler for chart points
  document.getElementById("chartArea").on('plotly_click', function(data) {
    let pointIndex = data.points[0].pointIndex;
    let point = data.points[0];
    
    // Get the pixel coordinates of the clicked point
    let xPos = point.xaxis.d2p(point.x) + point.xaxis._offset;
    let yPos = point.yaxis.d2p(point.y) + point.yaxis._offset;
    
    showInfo(nuclearData[pointIndex], xPos, yPos);
  });
}

// Display details in info box at the clicked point position
function showInfo(nucleus, x, y) {
  console.log('Showing info for nucleus:', nucleus);
  
  const box = document.getElementById("infoBox");
  if (!box) {
    console.error('Info box element not found!');
    return;
  }
  
  // Get element symbol
  const elementSymbols = {
    1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 10: 'Ne',
    11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 16: 'S', 17: 'Cl', 18: 'Ar', 19: 'K', 20: 'Ca',
    21: 'Sc', 22: 'Ti', 23: 'V', 24: 'Cr', 25: 'Mn', 26: 'Fe', 27: 'Co', 28: 'Ni', 29: 'Cu', 30: 'Zn',
    31: 'Ga', 32: 'Ge', 33: 'As', 34: 'Se', 35: 'Br', 36: 'Kr', 37: 'Rb', 38: 'Sr', 39: 'Y', 40: 'Zr',
    41: 'Nb', 42: 'Mo', 43: 'Tc', 44: 'Ru', 45: 'Rh', 46: 'Pd', 47: 'Ag', 48: 'Cd', 49: 'In', 50: 'Sn',
    51: 'Sb', 52: 'Te', 53: 'I', 54: 'Xe', 55: 'Cs', 56: 'Ba', 57: 'La', 58: 'Ce', 59: 'Pr', 60: 'Nd',
    61: 'Pm', 62: 'Sm', 63: 'Eu', 64: 'Gd', 65: 'Tb', 66: 'Dy', 67: 'Ho', 68: 'Er', 69: 'Tm', 70: 'Yb',
    71: 'Lu', 72: 'Hf', 73: 'Ta', 74: 'W', 75: 'Re', 76: 'Os', 77: 'Ir', 78: 'Pt', 79: 'Au', 80: 'Hg',
    81: 'Tl', 82: 'Pb', 83: 'Bi', 84: 'Po', 85: 'At', 86: 'Rn', 87: 'Fr', 88: 'Ra', 89: 'Ac', 90: 'Th',
    91: 'Pa', 92: 'U', 93: 'Np', 94: 'Pu', 95: 'Am', 96: 'Cm', 97: 'Bk', 98: 'Cf', 99: 'Es', 100: 'Fm'
  };
  
  const symbol = elementSymbols[parseInt(nucleus.Z)] || `Z${nucleus.Z}`;
  
  // Set the content directly, like in the original working code
  box.style.display = "block";
  box.innerHTML = `
    <div class="info-box-header">
      <h4>${symbol}-${nucleus.A} Isotope</h4>
      <button class="info-close-btn" onclick="closeInfoBox()">&times;</button>
    </div>
    <div class="info-box-content">
      <table>
        <tr><th>Property</th><th>Value</th></tr>
        <tr><td>Element Symbol</td><td><strong>${symbol}</strong></td></tr>
        <tr><td>Proton Number (Z)</td><td>${nucleus.Z}</td></tr>
        <tr><td>Neutron Number (N)</td><td>${nucleus.N}</td></tr>
        <tr><td>Mass Number (A)</td><td>${nucleus.A}</td></tr>
        <tr><td>Mass Excess (Exp)</td><td>${nucleus.M_exp && nucleus.M_exp !== "-" ? nucleus.M_exp + " MeV" : "Not available"}</td></tr>
        <tr><td>Mass Excess (ELMA)</td><td>${nucleus.M_ELMA && nucleus.M_ELMA !== "-" ? nucleus.M_ELMA + " MeV" : "Not available"}</td></tr>
        <tr><td>Binding Energy (Exp)</td><td>${nucleus["B.E_exp"] && nucleus["B.E_exp"] !== "-" ? nucleus["B.E_exp"] + " MeV" : "Not available"}</td></tr>
        <tr><td>Binding Energy (ELMA)</td><td>${nucleus["B.E_ELMA"] && nucleus["B.E_ELMA"] !== "-" ? nucleus["B.E_ELMA"] + " MeV" : "Not available"}</td></tr>
      </table>
    </div>
  `;
  
  // Position the info box directly at the clicked point
  // If x and y are provided (from click or search), position the box there
  if (x !== undefined && y !== undefined) {
    const chartArea = document.getElementById("chartArea");
    const chartRect = chartArea.getBoundingClientRect();
    
    // Calculate position, keeping the box within the chart boundaries
    // Position box so its top-left corner is at the point
    let posX = x;
    let posY = y;
    
    // Make sure box stays within chart area
    const boxWidth = 350;
    const boxHeight = 300;
    
    // Adjust if box would go off right edge
    if (posX + boxWidth > chartRect.width) {
      posX = posX - boxWidth;
    }
    
    // Adjust if box would go off bottom edge
    if (posY + boxHeight > chartRect.height) {
      posY = posY - boxHeight;
    }
    
    // Ensure box doesn't go off top or left edges
    posX = Math.max(posX, 0);
    posY = Math.max(posY, 0);
    
    // Apply the position
    box.style.left = `${posX}px`;
    box.style.top = `${posY}px`;
  } else {
    // Default position if no coordinates provided
    box.style.left = "20px";
    box.style.top = "20px";
  }
}

// Close info box function
function closeInfoBox() {
  const box = document.getElementById("infoBox");
  box.style.display = "none";
}

// Search nucleus by Z, N
function searchNucleus() {
  let z = document.getElementById("zInput").value;
  let n = document.getElementById("nInput").value;

  // Validate inputs
  if (!z || !n) {
    showNotFoundDialog("Please enter both Z (proton number) and N (neutron number) values.");
    return;
  }

  // Convert to numbers for comparison
  z = parseInt(z);
  n = parseInt(n);

  // Show loading state
  const searchBtn = document.querySelector('.search-btn');
  const originalText = searchBtn.innerHTML;
  searchBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" opacity=".5" fill="currentColor"/><path d="M20 12h2A10 10 0 0 0 12 2v2a8 8 0 0 1 8 8z" fill="currentColor"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>Searching...';
  searchBtn.disabled = true;

  console.log(`Searching for nucleus with Z=${z}, N=${n}`);
  
  try {
    // Only search in the already loaded data - no API fallback
    if (nuclearData && nuclearData.length > 0) {
      console.log(`Searching in loaded data (${nuclearData.length} nuclei)...`);
      const nucleus = nuclearData.find(item => parseInt(item.Z) === z && parseInt(item.N) === n);
      
      if (nucleus) {
        console.log('Nucleus found in loaded data:', nucleus);
        
        // Make sure the chart tab is active
        openTab('chart');
        
        // Calculate position based on Z and N values
        // Find where this nucleus would be on the chart
        const chartArea = document.getElementById("chartArea");
        const plotlyDiv = chartArea.getElementsByClassName('js-plotly-plot')[0];
        
        if (plotlyDiv && plotlyDiv._fullLayout) {
          const xaxis = plotlyDiv._fullLayout.xaxis;
          const yaxis = plotlyDiv._fullLayout.yaxis;
          
          // Convert Z and N values to pixel positions
          // These are the exact coordinates of the point in the graph
          const xPos = xaxis.d2p(n) + xaxis._offset;
          const yPos = yaxis.d2p(z) + yaxis._offset;
          
          // Show the info at the calculated position
          setTimeout(() => {
            showInfo(nucleus, xPos, yPos);
          }, 100);
        } else {
          setTimeout(() => {
            showInfo(nucleus);
          }, 100);
        }
      } else {
        console.log('Nucleus not found in loaded data');
        showNotFoundDialog(`No data available for nucleus with Z=${z} and N=${n}. Please verify your input values.`);
      }
    } else {
      showNotFoundDialog("Nuclear data not loaded yet. Please wait and try again.");
    }
  } catch (error) {
    console.error('Search error:', error);
    showNotFoundDialog(`Error searching for nucleus: ${error.message}`);
  } finally {
    // Reset button state
    searchBtn.innerHTML = originalText;
    searchBtn.disabled = false;
  }
}

// Show Material-UI style information dialog
function showNotFoundDialog(message) {
  // Create dialog elements
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  
  const dialog = document.createElement('div');
  dialog.className = 'not-found-dialog';
  
  dialog.innerHTML = `
    <div class="dialog-header">
      <span class="material-icons dialog-icon"></span>
      <h3>Information</h3>
    </div>
    <div class="dialog-content">
      <p>${message}</p>
    </div>
    <div class="dialog-actions">
      <button class="dialog-btn dialog-btn-primary" onclick="closeNotFoundDialog()">
        <span class="material-icons"></span>
        OK
      </button>
    </div>
  `;
  
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
  
  console.log("Showing information dialog:", message);
  
  // Show with animation
  setTimeout(() => {
    overlay.classList.add('active');
    dialog.classList.add('active');
  }, 10);
  
  // Store reference for closing
  window.currentInfoDialog = overlay;
  
  // Add keyboard event listener for Escape key
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      closeNotFoundDialog();
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

// Close information dialog
function closeNotFoundDialog() {
  const overlay = window.currentInfoDialog;
  if (overlay) {
    const dialog = overlay.querySelector('.not-found-dialog');
    dialog.classList.remove('active');
    overlay.classList.remove('active');
    
    setTimeout(() => {
      document.body.removeChild(overlay);
      window.currentInfoDialog = null;
    }, 200);
  }
}

// Tabs
function openTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach(el => {
    el.classList.remove("active");
    el.classList.add("hidden");
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  
  // Show selected tab
  const selectedTab = document.getElementById(tabName);
  selectedTab.classList.add("active");
  selectedTab.classList.remove("hidden");
  
  // Add active class to clicked button
  event.target.classList.add("active");
}
// Side Panel Functions
function toggleSidePanel() {
  const sidePanel = document.getElementById('sidePanel');
  const overlay = document.getElementById('sidePanel-overlay');
  const body = document.body;
  
  const isOpen = sidePanel.classList.contains('open');
  
  if (isOpen) {
    // Close panel
    sidePanel.classList.remove('open');
    overlay.classList.remove('active');
    body.classList.remove('side-panel-open');
  } else {
    // Open panel
    sidePanel.classList.add('open');
    overlay.classList.add('active');
    body.classList.add('side-panel-open');
  }
}

// Navigation functions
function navigateTo(section) {
  // Close the side panel first
  toggleSidePanel();
  
  // Add a small delay to let the panel close animation complete
  setTimeout(() => {
    switch(section) {
      case 'dashboard':
        // Redirect to index.html (dashboard/home page)
        window.location.href = 'index.html';
        break;
      case 'blogs':
        // Redirect to blogs page
        window.location.href = 'blogs.html';
        break;
      case 'research':
        // Redirect to research papers page
        window.location.href = 'research-papers.html';
        break;
      default:
        console.log('Unknown navigation target:', section);
    }
  }, 300);
}

// Close side panel when clicking outside (on overlay)
document.addEventListener('click', function(event) {
  const sidePanel = document.getElementById('sidePanel');
  const hamburgerMenu = document.querySelector('.hamburger-menu');
  
  // If side panel is open and click is outside panel and not on hamburger menu
  if (sidePanel.classList.contains('open') && 
      !sidePanel.contains(event.target) && 
      !hamburgerMenu.contains(event.target)) {
    toggleSidePanel();
  }
});

// Close side panel on escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const sidePanel = document.getElementById('sidePanel');
    if (sidePanel.classList.contains('open')) {
      toggleSidePanel();
    }
  }
});

// Set default tab
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("chart").classList.add("active");
  document.getElementById("chart").classList.remove("hidden");
});