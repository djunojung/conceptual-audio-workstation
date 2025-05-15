let lastDecomposition = null;

const moduleOutputs = {}; // Stores output per module ID

// Generate Metaphor
async function generateMetaphor() {
  const object1 = document.getElementById('object1').value;
  const object2 = document.getElementById('object2').value;

  const sliders = {
    organic_synthetic: document.getElementById('slider1').value,
    static_dynamic: document.getElementById('slider2').value,
    poetic_literal: document.getElementById('slider3').value,
    concrete_abstract: document.getElementById('slider4').value
  };

  const responseElement = document.getElementById('metaphorText');
  responseElement.textContent = "Generating metaphor...";

  try {
    const response = await fetch('http://127.0.0.1:5000/generate_metaphor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ object1, object2, sliders })
    });

    const data = await response.json();
    responseElement.textContent = data.metaphor;
  } catch (error) {
    responseElement.textContent = "Error generating metaphor. See console.";
    console.error(error);
  }
}

// Decompose Concept
async function decomposeConcept() {
  const concept = document.getElementById("decomposeInput").value;
  const resultBox = document.getElementById("decompositionResult");
  resultBox.innerHTML = "Analyzing...";

  try {
    const response = await fetch('http://127.0.0.1:5000/decompose_concept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept })
    });

    const data = await response.json();
    renderDecomposition(data);
  } catch (error) {
    resultBox.textContent = "Error: " + error.message;
    console.error(error);
  }
}

// Render Decomposition Output
function renderDecomposition(data) {
  const resultBox = document.getElementById("decompositionResult");
  const d = JSON.parse(data.decomposition);
  lastDecomposition = d;

  resultBox.innerHTML = `
    <div class="schema-section">
      <h4>🧩 Image Schemas</h4>
      <div class="tag-container">
        ${d.image_schemas.map(s => `<span class="tag">${s}</span>`).join('')}
      </div>
    </div>

    <div class="function-section">
      <h4>⚙️ Functional Primitives</h4>
      <div class="tag-container">
        ${d.functional_primitives.map(f => `<span class="tag func">${f}</span>`).join('')}
      </div>
    </div>

    <div class="archetype-section">
      <h4>🎭 Archetypal Role</h4>
      <p class="archetype">${d.archetype}</p>
    </div>

    <div class="emotion-section">
      <h4>💓 Emotional Tone</h4>
      <p class="emotion">${d.emotion}</p>
    </div>

    <div class="frames-section">
      <h4>🌍 Cultural Frames</h4>
      <ul>
        <li><strong>Nature:</strong> ${d.frames.nature}</li>
        <li><strong>Technology:</strong> ${d.frames.technology}</li>
        <li><strong>Myth:</strong> ${d.frames.myth}</li>
        <li><strong>Design:</strong> ${d.frames.design}</li>
      </ul>
    </div>

    <div class="relations-section">
      <h4>🔗 Relational Skeletons</h4>
      <div class="tag-container">
        ${d.relations.map(r => `<span class="tag relation">${r}</span>`).join('')}
      </div>
    </div>
  `;
}

// Remix From Single Decomposition
async function remixFromDecomposition() {
  const concept = document.getElementById("decomposeInput").value;
  const resultBox = document.getElementById("remixResult");
  resultBox.textContent = "Composing from deep structure...";

  try {
    const response = await fetch('http://127.0.0.1:5000/remix_from_decomposition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept })
    });

    const data = await response.json();
    resultBox.textContent = data.metaphor;
  } catch (error) {
    resultBox.textContent = "Error remixing metaphor.";
    console.error(error);
  }
}

// Save Metaphor
function saveMetaphor() {
  const current = document.getElementById("metaphorText").textContent;
  if (!current || current.includes("Awaiting") || current.includes("Error")) return;

  const saved = JSON.parse(localStorage.getItem("conceptKit") || "[]");
  saved.push(current);
  localStorage.setItem("conceptKit", JSON.stringify(saved));
  renderKit();
}

// Render Saved Metaphors
function renderKit() {
  const list = document.getElementById("metaphorList");
  const saved = JSON.parse(localStorage.getItem("conceptKit") || "[]");
  if (!list) return;

  list.innerHTML = "";
  saved.forEach((m, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="saved-metaphor">${m}</div>
      <button onclick="deleteMetaphor(${i})">🗑️</button>
    `;
    list.appendChild(li);
  });
}

function deleteMetaphor(index) {
  const saved = JSON.parse(localStorage.getItem("conceptKit") || "[]");
  saved.splice(index, 1);
  localStorage.setItem("conceptKit", JSON.stringify(saved));
  renderKit();
}

function clearKit() {
  localStorage.removeItem("conceptKit");
  renderKit();
}

// Save Decomposition
function saveDecomposition() {
  const concept = document.getElementById("decomposeInput").value;
  if (!concept || !lastDecomposition) return;

  const saved = JSON.parse(localStorage.getItem("decompKit") || "[]");
  saved.push({ concept, parsed: lastDecomposition });
  localStorage.setItem("decompKit", JSON.stringify(saved));
  renderDecompKit();
}

// Render Saved Decompositions
function renderDecompKit() {
  const list = document.getElementById("decompList");
  const saved = JSON.parse(localStorage.getItem("decompKit") || "[]");
  if (!list) return;

  list.innerHTML = "";
  saved.forEach((item, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" class="decompCheck" value="${i}">
      <strong>${item.concept}</strong>
      <button onclick="viewDecomp(${i})">🔍</button>
      <button onclick="deleteDecomp(${i})">🗑️</button>
    `;
    list.appendChild(li);
  });
}

function viewDecomp(index) {
  const saved = JSON.parse(localStorage.getItem("decompKit") || "[]");
  const item = saved[index];
  if (!item) return;

  document.getElementById("decomposeInput").value = item.concept;
  lastDecomposition = item.parsed;
  document.getElementById("decompositionResult").textContent =
    JSON.stringify(item.parsed, null, 2);
}

function deleteDecomp(index) {
  const saved = JSON.parse(localStorage.getItem("decompKit") || "[]");
  saved.splice(index, 1);
  localStorage.setItem("decompKit", JSON.stringify(saved));
  renderDecompKit();
}

function clearDecomps() {
  localStorage.removeItem("decompKit");
  renderDecompKit();
}

// Combine Two Decompositions
async function combineSelectedDecomps() {
  const checkboxes = document.querySelectorAll('.decompCheck:checked');
  const selectedIndexes = Array.from(checkboxes).map(cb => parseInt(cb.value));
  const saved = JSON.parse(localStorage.getItem("decompKit") || "[]");

  if (selectedIndexes.length !== 2) {
    alert("Select exactly two decompositions to combine.");
    return;
  }

  const [first, second] = selectedIndexes.map(i => saved[i]);
  if (!first || !second) return;

  const blend = parseInt(document.getElementById("blendSlider").value);
  document.getElementById("hybridMetaphor").textContent = "Synthesizing metaphor...";

  try {
    const gptResponse = await fetch('http://127.0.0.1:5000/remix_from_decomposition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: `${first.concept} + ${second.concept}`,
        first: first.parsed,
        second: second.parsed,
        blend
      })
    });

    const data = await gptResponse.json();
    document.getElementById("hybridMetaphor").textContent = data.metaphor;
  } catch (err) {
    document.getElementById("hybridMetaphor").textContent = "Error generating hybrid metaphor.";
    console.error(err);
  }
}

// Update blend slider label
function updateBlendLabel() {
  const val = document.getElementById("blendSlider").value;
  document.getElementById("blendValue").textContent = val;
}

// Enable draggable modules
function makeDraggable(module) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

function updateAllWirePaths() {
  const canvasRect = document.getElementById("canvas").getBoundingClientRect();

  connections.forEach(conn => {
    const fromPort = document.querySelector(`.module[data-id="${conn.from}"] .port.output`);
    const toPort = document.querySelector(`.module[data-id="${conn.to}"] .port.input`);
    if (!fromPort || !toPort) return;

    const x1 = fromPort.getBoundingClientRect().left - canvasRect.left + 6;
    const y1 = fromPort.getBoundingClientRect().top - canvasRect.top + 6;
    const x2 = toPort.getBoundingClientRect().left - canvasRect.left + 6;
    const y2 = toPort.getBoundingClientRect().top - canvasRect.top + 6;

    conn.path.setAttribute("d", `M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`);
  });
}

  module.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('port')) return;
    isDragging = true;
    offsetX = e.clientX - module.getBoundingClientRect().left;
    offsetY = e.clientY - module.getBoundingClientRect().top;
    module.style.zIndex = 10;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    module.style.left = (e.clientX - offsetX) + 'px';
    module.style.top = (e.clientY - offsetY) + 'px';
    updateAllWirePaths();  // 👈 add this
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    module.style.zIndex = 1;
    saveRack();
  });
}


function makeModulesDraggable() {
  const modules = document.querySelectorAll('.module');
  modules.forEach(makeDraggable);
}

let moduleCount = 1;

function addNewModule(label = null, top = null, left = null, type = null) {
  const canvas = document.getElementById("canvas");
  const module = document.createElement("div");
  module.className = "module";

  const id = moduleCount++;
  const moduleLabel = label || `Module ${id}`;
  const typeOptions = {
  "1": "Input",
  "2": "Decomposer",
  "3": "Generator",
  "4": "Mixer",
  "5": "Viewer",
  "6": "Exporter"
};

let moduleType = type;
if (!moduleType) {
  const choice = prompt(
    "Choose module type:\n" +
    "1 = Input\n" +
    "2 = Decomposer\n" +
    "3 = Generator\n" +
    "4 = Mixer\n" +
    "5 = Viewer\n" +
    "6 = Exporter", "1"
  );
  moduleType = typeOptions[choice] || "Input";
}


  const posTop = top || `${50 + id * 20}px`;
  const posLeft = left || `${50 + id * 20}px`;

  module.style.top = posTop;
  module.style.left = posLeft;
  module.setAttribute("data-id", id);
  module.setAttribute("data-type", moduleType);

  const icon = getTypeIcon(moduleType);

  module.innerHTML = `
    <div class="port input"></div>
    <div class="port output"></div>
    <div class="module-header">
      <span class="type-label">${icon} ${moduleType}</span>
      <p ondblclick="editLabel(this)">${moduleLabel}</p>
    </div>
    <div class="module-body">
      ${getModuleUI(moduleType)}
    </div>
  `;

  canvas.appendChild(module);
  makeDraggable(module);
  saveRack();
}

// ✅ Define below or above addNewModule
function getTypeIcon(type) {
  const icons = {
    "Input": "🔤",
    "Decomposer": "🧩",
    "Generator": "🧠",
    "Mixer": "🎚️",
    "Viewer": "👁️",
    "Exporter": "💾"
  };
  return icons[type] || "❓";
}

function triggerThis(btn) {
  const moduleId = btn.closest(".module").getAttribute("data-id");
  triggerModule(moduleId);
}

function getModuleUI(type) {
  switch (type) {
    case "Input":
      return `<input type="text" placeholder="Enter concept">
              <button onclick="triggerThis(this)">Send</button>`;
    case "Decomposer":
      return `<button onclick="triggerThis(this)">Decompose</button>`;
    case "Generator":
      return `<button onclick="triggerThis(this)">Generate Metaphor</button>`;
    case "Mixer":
      return `<input type="range" min="0" max="100" value="50">`;
    case "Viewer":
      return `<div class="viewer-box">No data yet</div>`;
    case "Exporter":
      return `<button onclick="triggerThis(this)">Export</button>`;
    default:
      return `<div>Unknown module</div>`;
  }
}

// Initialize all systems on page load
window.onload = () => {
  renderKit();
  renderDecompKit();
  updateBlendLabel();
  makeModulesDraggable(); // initial ones
  loadRack(); // 🔁 load saved modules
  setupWiring();
};


function saveRack() {
  const modules = document.querySelectorAll('.module');
  const layout = [];

  modules.forEach(module => {
    layout.push({
      id: module.getAttribute("data-id"),
      label: module.querySelector("p").textContent,
      top: module.style.top,
      left: module.style.left,
      type: module.getAttribute("data-type")
    });
  });

  const savedConnections = connections.map(conn => ({
    from: conn.from,
    to: conn.to
  }));

  const fullSave = {
    modules: layout,
    connections: savedConnections
  };

  localStorage.setItem("cawRack", JSON.stringify(fullSave));
}

function loadRack() {
  const raw = localStorage.getItem("cawRack");
  if (!raw) return;

  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    // Backward compatibility (module array only)
    parsed.forEach(mod => {
      addNewModule(mod.label, mod.top, mod.left, mod.type);
    });
  } else {
    parsed.modules.forEach(mod => {
      addNewModule(mod.label, mod.top, mod.left, mod.type);
    });

    // Delay wiring until DOM is updated
    setTimeout(() => {
      parsed.connections.forEach(conn => {
        drawWireById(conn.from, conn.to);
      });
    }, 100);
  }
}


function exportRack() {
  const raw = localStorage.getItem("cawRack");
  if (!raw) {
    alert("No rack data to export.");
    return;
  }

  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "conceptual-audio-workstation.cawrack.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importRack(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      localStorage.setItem("cawRack", JSON.stringify(parsed));
      location.reload(); // Rebuild from scratch
    } catch (err) {
      alert("Invalid .cawrack.json file.");
      console.error(err);
    }
  };
  reader.readAsText(file);
}

function editLabel(pElement) {
  const newLabel = prompt("Rename module:", pElement.textContent);
  if (newLabel) {
    pElement.textContent = newLabel;
    saveRack();
  }
}

function triggerDecomposition(btn) {
  alert("Decomposition logic will run here.");
}

function triggerGeneration(btn) {
  alert("Generation logic will run here.");
}

function exportFromModule(btn) {
  alert("Export logic will run here.");
}

let connections = [];
let isDraggingWire = false;
let tempWire = null;
let sourcePort = null;

function triggerModule(moduleId) {
  const module = document.querySelector(`.module[data-id="${moduleId}"]`);
  if (!module) return;

  const type = module.getAttribute("data-type");
  const label = module.querySelector("p").textContent;

  switch (type) {
    case "Input":
  const inputVal = module.querySelector("input").value;
  moduleOutputs[moduleId] = inputVal;
  triggerNextModules(moduleId); // 🔁 trigger connected modules
  break;

    case "Decomposer":
  const concept = getInputFromConnected(moduleId);
  if (!concept) return alert(`${label} has no input`);

  module.querySelector("button").textContent = "Working...";
  fetch('http://127.0.0.1:5000/decompose_concept', {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept })
  })
  .then(res => res.json())
  .then(data => {
    moduleOutputs[moduleId] = JSON.parse(data.decomposition); // 🎯 don't forget to parse it
    module.querySelector("button").textContent = "Decompose";
    triggerNextModules(moduleId); // 🔁 continue the flow
  });
  return;


    case "Generator":
  const genInput = getInputFromConnected(moduleId);
  if (!genInput) return alert(`${label} needs decomposed input`);

  module.querySelector("button").textContent = "Generating...";
  fetch('http://127.0.0.1:5000/remix_from_decomposition', {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ concept: "Generated", first: genInput })
  })
  .then(res => res.json())
  .then(data => {
    module.querySelector("button").textContent = "Generate Metaphor";
    module.querySelector("button").insertAdjacentHTML("afterend", `<div style="margin-top:0.5rem; font-style:italic;">${data.metaphor}</div>`);
    moduleOutputs[moduleId] = data;
    triggerNextModules(moduleId); // 🔁 continue the flow
  });
  return;


    case "Viewer":
      const incoming = getInputFromConnected(moduleId);
      const box = module.querySelector(".viewer-box");
      box.textContent = incoming ? JSON.stringify(incoming, null, 2) : "No data";
      moduleOutputs[moduleId] = incoming;
      break;

    case "Exporter":
      const exportData = getInputFromConnected(moduleId);
      if (!exportData) return alert(`${label} has no data`);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label.replace(/\s+/g, "_")}.json`;
      a.click();
      break;

    default:
      console.log(`Unhandled module type: ${type}`);
  }

  // Pass to next modules
  triggerNextModules(moduleId);
}

function setupWiring() {
  const canvas = document.getElementById("canvas");
  const wireLayer = document.getElementById("wireLayer");

  canvas.addEventListener("mousedown", (e) => {
    if (!e.target.classList.contains("port") || !e.target.classList.contains("output")) return;

    isDraggingWire = true;
    sourcePort = e.target;

    tempWire = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempWire.setAttribute("class", "wire");
    wireLayer.appendChild(tempWire);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDraggingWire || !tempWire || !sourcePort) return;

    const canvasRect = canvas.getBoundingClientRect();
    const x1 = sourcePort.getBoundingClientRect().left - canvasRect.left + 6;
    const y1 = sourcePort.getBoundingClientRect().top - canvasRect.top + 6;
    const x2 = e.clientX - canvasRect.left;
    const y2 = e.clientY - canvasRect.top;

    tempWire.setAttribute("d", `M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`);
  });

  canvas.addEventListener("mouseup", (e) => {
    if (!isDraggingWire || !sourcePort || !tempWire) return;

    isDraggingWire = false;

    if (e.target.classList.contains("port") && e.target.classList.contains("input")) {
      const targetPort = e.target;

      const canvasRect = canvas.getBoundingClientRect();
      const x1 = sourcePort.getBoundingClientRect().left - canvasRect.left + 6;
      const y1 = sourcePort.getBoundingClientRect().top - canvasRect.top + 6;
      const x2 = targetPort.getBoundingClientRect().left - canvasRect.left + 6;
      const y2 = targetPort.getBoundingClientRect().top - canvasRect.top + 6;

      tempWire.setAttribute("d", `M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`);

      connections.push({
        from: sourcePort.parentElement.getAttribute("data-id"),
        to: targetPort.parentElement.getAttribute("data-id"),
        path: tempWire
      });

      tempWire = null;
      sourcePort = null;
    } else {
      // Not dropped on valid input — cancel wire
      wireLayer.removeChild(tempWire);
      tempWire = null;
      sourcePort = null;
    }
  });
}

function drawWireById(fromId, toId) {
  const fromModule = document.querySelector(`.module[data-id="${fromId}"] .port.output`);
  const toModule = document.querySelector(`.module[data-id="${toId}"] .port.input`);

  if (!fromModule || !toModule) return;

  const canvas = document.getElementById("canvas");
  const canvasRect = canvas.getBoundingClientRect();
  const wireLayer = document.getElementById("wireLayer");

  const x1 = fromModule.getBoundingClientRect().left - canvasRect.left + 6;
  const y1 = fromModule.getBoundingClientRect().top - canvasRect.top + 6;
  const x2 = toModule.getBoundingClientRect().left - canvasRect.left + 6;
  const y2 = toModule.getBoundingClientRect().top - canvasRect.top + 6;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("class", "wire");
  path.setAttribute("d", `M${x1},${y1} C${x1+50},${y1} ${x2-50},${y2} ${x2},${y2}`);
  wireLayer.appendChild(path);

  connections.push({
    from: fromId,
    to: toId,
    path
  });
}

function getInputFromConnected(moduleId) {
  const conn = connections.find(c => c.to === moduleId);
  return conn ? moduleOutputs[conn.from] : null;
}

function triggerNextModules(fromId) {
  connections
    .filter(conn => conn.from === fromId)
    .forEach(conn => triggerModule(conn.to));
}

document.addEventListener("contextmenu", function (e) {
  if (e.target.classList.contains("wire")) {
    e.preventDefault(); // Prevent right-click menu

    const confirmed = confirm("Delete this wire?");
    if (!confirmed) return;

    // Remove from DOM
    e.target.remove();

    // Remove from connections array
    connections = connections.filter(conn => conn.path !== e.target);

    // Save updated layout
    saveRack();
  }
});

console.log("JS Loaded");