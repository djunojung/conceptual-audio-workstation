let lastDecomposition = null;

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
  });

  document.addEventListener('mouseup', () => {
  isDragging = false;
  module.style.zIndex = 1;
  saveRack(); // 👈 save layout when done dragging
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
  const moduleType = type || prompt("Choose module type:\nInput, Decomposer, Generator, Mixer, Viewer, Exporter", "Input");

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


function getModuleUI(type) {
  switch (type) {
    case "Input":
      return `<input type="text" placeholder="Enter concept">`;
    case "Decomposer":
      return `<button onclick="triggerDecomposition(this)">Decompose</button>`;
    case "Generator":
      return `<button onclick="triggerGeneration(this)">Generate Metaphor</button>`;
    case "Mixer":
      return `<input type="range" min="0" max="100" value="50">`;
    case "Viewer":
      return `<div class="viewer-box">No data yet</div>`;
    case "Exporter":
      return `<button onclick="exportFromModule(this)">Export</button>`;
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

  localStorage.setItem("cawRack", JSON.stringify(layout));
}

function loadRack() {
  const raw = localStorage.getItem("cawRack");
  if (!raw) return;

  const modules = JSON.parse(raw);
  modules.forEach(mod => {
    addNewModule(mod.label, mod.top, mod.left, mod.type);
  });
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


console.log("JS Loaded");