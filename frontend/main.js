let lastDecomposition = null;

const moduleOutputs = {}; // Stores output per module ID
const selectedPrimitives = {};  // Tracks user-selected primitives per module
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

function renderTagList(items, category, moduleId) {
  return items.map(item => {
    const key = `${moduleId}-${category}-${item}`;
    return `<span class="tag selectable" data-key="${key}" data-cat="${category}" data-id="${moduleId}">${item}</span>`;
  }).join('');
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
  "6": "Exporter",
  "7": "Selector"
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
    "Exporter": "💾",
    "Selector": "🧠"
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
    case "Selector":
  return `
    <div style="font-size: 0.8rem; margin-bottom: 0.5rem;">Select primitives to inject:</div>
    <strong>Image Schemas</strong><br>
    <div class="tag-container" data-cat="image_schemas">
      ${["PATH", "CONTAINER", "BALANCE", "SOURCE-PATH-GOAL"].map(p => `<span class="tag selectable" data-key="selector-image_schemas-${p}" data-cat="image_schemas" data-id="selector">${p}</span>`).join('')}
    </div>

    <strong>Functions</strong><br>
    <div class="tag-container" data-cat="functional_primitives">
      ${["Reflect", "Bind", "Cut", "Perceive", "Contain"].map(f => `<span class="tag selectable" data-key="selector-functional_primitives-${f}" data-cat="functional_primitives" data-id="selector">${f}</span>`).join('')}
    </div>

    <strong>Relations</strong><br>
    <div class="tag-container" data-cat="relations">
      ${["X is a mirror of Y", "X contains Y", "X transforms Y"].map(r => `<span class="tag selectable" data-key="selector-relations-${r}" data-cat="relations" data-id="selector">${r}</span>`).join('')}
    </div>
    <button onclick="triggerThis(this)">Inject</button>
  `;
    default:
      return `<div>Unknown module</div>`;
  }
}

// Initialize all systems on page load
window.onload = () => {
  renderKit();
  renderDecompKit();
  updateBlendLabel();
  makeModulesDraggable();
  loadRack(); // If a saved layout exists, it will overwrite default below

  if (!localStorage.getItem("cawRack")) {
    createDefaultModules();
  }

document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("selectable")) return;

  const key = e.target.getAttribute("data-key");
  const cat = e.target.getAttribute("data-cat");
  const modId = e.target.getAttribute("data-id");

  e.target.classList.toggle("selected");

  if (!selectedPrimitives[modId]) {
    selectedPrimitives[modId] = {
      image_schemas: [],
      functional_primitives: [],
      relations: []
    };
  }

  const item = key.split(`${modId}-${cat}-`)[1];
  const list = selectedPrimitives[modId][cat];
  const index = list.indexOf(item);

  if (index === -1) {
    list.push(item);
  } else {
    list.splice(index, 1);
  }
});

  setupWiring(); // Enable wire drawing
};
function createDefaultModules() {
  const spacing = 240;
  const top = 100;

  const input = addNewModule("Enter Concept", `${top}px`, `${spacing * 0}px`, "Input");
  const decomp = addNewModule("Decomposer", `${top}px`, `${spacing * 1}px`, "Decomposer");
  const gen = addNewModule("Generator", `${top}px`, `${spacing * 2}px`, "Generator");
  const viewer = addNewModule("Viewer", `${top}px`, `${spacing * 3}px`, "Viewer");

  // Optional: wire them automatically in the future
}

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

function getConnectionFrom(toId) {
  const conn = connections.find(c => c.to === toId);
  return conn ? conn.from : null;
}

function getAllInputsTo(moduleId) {
  return connections
    .filter(c => c.to === moduleId)
    .map(c => c.from);
}

function triggerModule(moduleId) {
  const module = document.querySelector(`.module[data-id="${moduleId}"]`);
  if (!module) return;

  const type = module.getAttribute("data-type");
  const label = module.querySelector("p").textContent;

  switch (type) {
    case "Input": {
      const inputVal = module.querySelector("input").value;
      moduleOutputs[moduleId] = inputVal;
      triggerNextModules(moduleId);
      break;
    }

     case "Decomposer": {
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
        const parsed = JSON.parse(data.decomposition);
        moduleOutputs[moduleId] = parsed;
        module.querySelector("button").textContent = "Decompose";

        // 🧩 Render output
        const body = module.querySelector(".module-body");
        const existing = module.querySelector(".decomp-output");
        if (existing) existing.remove();

        const div = document.createElement("div");
        div.className = "decomp-output";
        div.style = "margin-top: 0.5rem; text-align: left; font-size: 0.85rem; white-space: pre-wrap; color: #ccc;";
        div.innerHTML = `
  <strong>Image Schemas:</strong>
  <div class="tag-container">${renderTagList(parsed.image_schemas, "image_schemas", moduleId)}</div>
  <strong>Functions:</strong>
  <div class="tag-container">${renderTagList(parsed.functional_primitives, "functional_primitives", moduleId)}</div>
  <strong>Archetype:</strong> ${parsed.archetype}<br>
  <strong>Emotion:</strong> ${parsed.emotion}<br>
  <strong>Frames:</strong><br>
    &nbsp;&nbsp;Nature: ${parsed.frames.nature}<br>
    &nbsp;&nbsp;Technology: ${parsed.frames.technology}<br>
    &nbsp;&nbsp;Myth: ${parsed.frames.myth}<br>
    &nbsp;&nbsp;Design: ${parsed.frames.design}<br>
  <strong>Relations:</strong>
  <div class="tag-container">${renderTagList(parsed.relations, "relations", moduleId)}</div>
`;

        body.appendChild(div);

        triggerNextModules(moduleId);
      });
      break;
    }

    case "Generator": {
  const inputIds = getAllInputsTo(moduleId);
  if (inputIds.length === 0) return alert(`${label} needs decomposed input.`);

  // Check that all input modules have outputs
  const decompositions = inputIds.map(id => moduleOutputs[id]);
  if (decompositions.some(d => !d)) {
    alert(`${label} is waiting on decomposition modules to finish.`);
    return;
  }

  module.querySelector("button").textContent = "Generating...";

  // Handle 1-input case
  if (inputIds.length === 1) {
    const id = inputIds[0];
    const full = moduleOutputs[id];
    const selected = selectedPrimitives[id];

    const genInput = selected
      ? {
          ...full,
          image_schemas: selected.image_schemas?.length ? selected.image_schemas : full.image_schemas,
          functional_primitives: selected.functional_primitives?.length ? selected.functional_primitives : full.functional_primitives,
          relations: selected.relations?.length ? selected.relations : full.relations
        }
      : full;

    fetch('http://127.0.0.1:5000/remix_from_decomposition', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept: "Generated", first: genInput })
    })
      .then(res => res.json())
      .then(data => handleGeneratorResponse(data, moduleId));
  }

  // Handle 2-input case
  else if (inputIds.length === 2) {
    const [id1, id2] = inputIds;
    const full1 = moduleOutputs[id1];
    const full2 = moduleOutputs[id2];
    const sel1 = selectedPrimitives[id1];
    const sel2 = selectedPrimitives[id2];

    const first = sel1
      ? {
          ...full1,
          image_schemas: sel1.image_schemas?.length ? sel1.image_schemas : full1.image_schemas,
          functional_primitives: sel1.functional_primitives?.length ? sel1.functional_primitives : full1.functional_primitives,
          relations: sel1.relations?.length ? sel1.relations : full1.relations
        }
      : full1;

    const second = sel2
      ? {
          ...full2,
          image_schemas: sel2.image_schemas?.length ? sel2.image_schemas : full2.image_schemas,
          functional_primitives: sel2.functional_primitives?.length ? sel2.functional_primitives : full2.functional_primitives,
          relations: sel2.relations?.length ? sel2.relations : full2.relations
        }
      : full2;

    fetch('http://127.0.0.1:5000/remix_from_decomposition', {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        concept: `${label}`,
        first,
        second,
        blend: 50
      })
    })
      .then(res => res.json())
      .then(data => handleGeneratorResponse(data, moduleId));
  } else {
    alert("Only 1 or 2 decomposition inputs supported.");
  }

  break;
}

    case "Viewer": {
      const incoming = getInputFromConnected(moduleId);
      const box = module.querySelector(".viewer-box");
      box.textContent = incoming ? JSON.stringify(incoming, null, 2) : "No data";
      moduleOutputs[moduleId] = incoming;
      break;
    }

    case "Exporter": {
      const exportData = getInputFromConnected(moduleId);
      if (!exportData) return alert(`${label} has no data`);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${label.replace(/\s+/g, "_")}.json`;
      a.click();
      break;
    }

    case "Selector": {
  const selected = selectedPrimitives["selector"];
  if (!selected || Object.values(selected).every(arr => arr.length === 0)) {
    alert("No primitives selected.");
    return;
  }

  const output = {
    image_schemas: selected.image_schemas || [],
    functional_primitives: selected.functional_primitives || [],
    relations: selected.relations || [],
    archetype: "User-Injected",
    emotion: "Neutral",
    frames: {
      nature: "Injected",
      technology: "Injected",
      myth: "Injected",
      design: "Injected"
    }
  };

  moduleOutputs[moduleId] = output;
  triggerNextModules(moduleId);
  break;
}

    default:
      console.log(`Unhandled module type: ${type}`);
  }

  // Final fallback — in case module completes without breaking
  if (!["Decomposer", "Generator"].includes(type)) {
    triggerNextModules(moduleId);
  }
}

function handleGeneratorResponse(data, moduleId) {
  const module = document.querySelector(`.module[data-id="${moduleId}"]`);
  const body = module.querySelector(".module-body");

  const inputIds = getAllInputsTo(moduleId);
  const selectedStrings = inputIds.map(id => {
    const selected = selectedPrimitives[id];
    if (!selected) return "";

    const formatted = [
      `🔹 Image Schemas: ${selected.image_schemas?.join(', ') || "—"}`,
      `🔹 Functions: ${selected.functional_primitives?.join(', ') || "—"}`,
      `🔹 Relations: ${selected.relations?.join(', ') || "—"}`
    ];
    return `From Module ${id}:\n` + formatted.join("\n");
  }).join("\n\n");

  const existing = body.querySelector(".generator-output");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.className = "generator-output";
  div.style = "margin-top:0.5rem; font-style:italic; white-space: pre-wrap; font-size: 0.9rem;";
  div.innerHTML = `
🧠 Selected Primitives Used:
${selectedStrings}

💡 Metaphor:
${data.metaphor}
  `;

  body.appendChild(div);
  moduleOutputs[moduleId] = data;
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

function getFilteredOrFull(moduleId) {
  const selected = selectedPrimitives[moduleId];
  if (!selected) return moduleOutputs[moduleId];  // fall back

  // Only use if at least one field has non-empty selection
  const hasSelection = Object.values(selected).some(arr => arr && arr.length);
  return hasSelection ? selected : moduleOutputs[moduleId];
}


console.log("JS Loaded"); 