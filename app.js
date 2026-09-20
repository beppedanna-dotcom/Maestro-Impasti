/**
 * Maestro degli Impasti - Controller Principale dell'Applicazione
 * Gestione Tab, Calcolatore Reattivo, Timer Web Audio, Scuola e Diario
 */

// Stato Applicazione
const AppState = {
  activeTab: "calculator",
  experienceMode: "beginner", // 'beginner' | 'pro'
  selectedCategory: "pizza",  // 'pizza' | 'focaccia' | 'pane'
  selectedRecipeId: "pizza_classica",
  selectedMethod: "direct",   // 'direct' | 'biga' | 'poolish'
  prefermentPct: 50,
  selectedYeastType: "fresh",
  selectedOvenId: "home_standard",
  suggestedRecipeId: "pizza_teglia_romana",
  showAdvanced: false,
  timer: {
    intervalId: null,
    remainingSeconds: 0,
    title: "",
    runningStep: null,
    audioContext: null
  }
};

// Inizializzazione al caricamento del DOM
document.addEventListener("DOMContentLoaded", () => {
  DoughStorage.init();
  initRecipeSelectors();
  initTroubleshooter();
  initJournal();
  if (typeof MaestroAgent !== "undefined") {
    MaestroAgent.init();
  }
  
  // Imposta la ricetta iniziale e calcola
  selectCategory(AppState.selectedCategory);
  applyRecipeDefaults(AppState.selectedRecipeId);
  updateCalculator();
  loadAcademyRecipe(AppState.selectedRecipeId);

  // Inizializza icone Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // Registrazione Service Worker per PWA e installazione su Android
  if ("serviceWorker" in navigator && (window.location.protocol === "https:" || window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then(reg => console.log("[PWA] Service Worker registrato:", reg.scope))
        .catch(err => console.log("[PWA] Service Worker fallito:", err));
    });
  }
});

// ==========================================
// GESTIONE NAVIGAZIONE & TAB
// ==========================================
function switchTab(tabId) {
  AppState.activeTab = tabId;

  // Mostra solo la tab attiva
  document.querySelectorAll(".tab-content").forEach(el => {
    el.classList.add("hidden");
    el.classList.remove("block");
  });

  const target = document.getElementById(`tab-${tabId}`);
  if (target) {
    target.classList.remove("hidden");
    target.classList.add("block");
  }

  // Aggiorna navbar desktop
  document.querySelectorAll(".nav-tab").forEach(btn => {
    btn.classList.remove("bg-stone-700/80", "text-white", "shadow-sm");
    btn.classList.add("text-stone-400");
  });
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) {
    activeNav.classList.remove("text-stone-400");
    activeNav.classList.add("bg-stone-700/80", "text-white", "shadow-sm");
  }

  // Aggiorna navbar mobile
  document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.remove("text-stone-400");
      btn.classList.add("text-amber-500");
    } else {
      btn.classList.remove("text-amber-500");
      btn.classList.add("text-stone-400");
    }
  });

  if (tabId === "academy") {
    loadAcademyRecipe(AppState.selectedRecipeId);
  } else if (tabId === "journal") {
    renderJournal();
  } else if (tabId === "troubleshooter") {
    if (window.MaestroAgent) MaestroAgent.updateContextPill();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) lucide.createIcons();
}

function initRecipeSelectors() {
  const academySelect = document.getElementById("academy-recipe-changer");
  if (academySelect && typeof RECIPES_DATA !== "undefined") {
    academySelect.innerHTML = "";
    RECIPES_DATA.forEach(recipe => {
      const option = document.createElement("option");
      option.value = recipe.id;
      option.textContent = `${recipe.name} (${recipe.category.toUpperCase()})`;
      academySelect.appendChild(option);
    });
    academySelect.value = AppState.selectedRecipeId;
  }
}

function onRecipeChange(recipeId) {
  const recipe = (typeof RECIPES_DATA !== "undefined" ? RECIPES_DATA : []).find(r => r.id === recipeId);
  if (recipe) {
    selectCategory(recipe.category);
    selectStyleRecipe(recipeId);
  }
}

// ==========================================
// GESTIONE LIVELLO ESPERIENZA (PRINCIPIANTE VS PRO)
// ==========================================
function setExperienceMode(mode) {
  AppState.experienceMode = mode;

  const btnBeginner = document.getElementById("btn-mode-beginner");
  const btnPro = document.getElementById("btn-mode-pro");
  const badgeLevel = document.getElementById("badge-experience-level");
  const descEl = document.getElementById("experience-mode-desc");
  const waterTempCard = document.getElementById("pro-water-temp-card");
  const prefermentPctRow = document.getElementById("preferment-percentage-row");

  if (mode === "pro") {
    if (btnPro) {
      btnPro.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-white text-stone-900 shadow-sm";
    }
    if (btnBeginner) {
      btnBeginner.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-stone-500 hover:text-stone-800";
    }
    if (badgeLevel) {
      badgeLevel.textContent = "Pizzaiolo PRO";
      badgeLevel.className = "text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.2 rounded-full border border-blue-200";
    }
    if (descEl) {
      descEl.textContent = "Modalità Esperto: sbloccati pre-fermenti (Biga/Poolish), Regola del 55 e parametri avanzati";
    }

    // Mostra card calcolo temperatura acqua
    if (waterTempCard) waterTempCard.classList.remove("hidden");

    // Mostra slider pre-fermento se metodo non è diretto
    if (prefermentPctRow && AppState.selectedMethod !== "direct") {
      prefermentPctRow.classList.remove("hidden");
    }

    // Apri opzioni avanzate se chiuse
    if (!AppState.showAdvanced) {
      toggleAdvancedParams();
    }
  } else {
    // Beginner Mode
    if (btnBeginner) {
      btnBeginner.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-white text-stone-900 shadow-sm";
    }
    if (btnPro) {
      btnPro.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-stone-500 hover:text-stone-800";
    }
    if (badgeLevel) {
      badgeLevel.textContent = "Semplice";
      badgeLevel.className = "text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.2 rounded-full border border-green-200";
    }
    if (descEl) {
      descEl.textContent = "Principiante: dosaggi perfetti e intuitivi senza complicazioni";
    }

    if (waterTempCard) waterTempCard.classList.add("hidden");
  }

  updateCalculator();
  if (window.lucide) lucide.createIcons();
}

// ==========================================
// SELETTORE CATEGORIA & SOTTOMENU STILI
// ==========================================
function selectCategory(cat) {
  AppState.selectedCategory = cat;

  // Aggiorna stile bottoni categorie
  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.classList.remove("bg-amber-50", "border-amber-500", "text-amber-950", "shadow-sm");
    btn.classList.add("bg-white", "border-stone-200", "text-stone-700");
  });

  const activeBtn = document.getElementById(`cat-btn-${cat}`);
  if (activeBtn) {
    activeBtn.classList.remove("bg-white", "border-stone-200", "text-stone-700");
    activeBtn.classList.add("bg-amber-50", "border-amber-500", "text-amber-950", "shadow-sm");
  }

  renderStylesSubmenu();

  // Se la ricetta corrente non appartiene a questa categoria, seleziona la prima
  const currentRecipe = RECIPES_DATA.find(r => r.id === AppState.selectedRecipeId);
  if (!currentRecipe || currentRecipe.category !== cat) {
    const firstInCat = RECIPES_DATA.find(r => r.category === cat);
    if (firstInCat) {
      selectStyleRecipe(firstInCat.id);
    }
  }
}

function renderStylesSubmenu() {
  const container = document.getElementById("styles-submenu-container");
  if (!container) return;

  container.innerHTML = "";
  const recipesInCat = RECIPES_DATA.filter(r => r.category === AppState.selectedCategory);

  recipesInCat.forEach(recipe => {
    const isSelected = recipe.id === AppState.selectedRecipeId;
    const card = document.createElement("button");
    card.type = "button";
    card.onclick = () => selectStyleRecipe(recipe.id);
    card.className = isSelected
      ? "p-2.5 rounded-xl border text-left transition flex flex-col justify-between bg-amber-100/70 border-amber-500 text-amber-950 shadow-sm ring-1 ring-amber-500 cursor-pointer"
      : "p-2.5 rounded-xl border text-left transition flex flex-col justify-between bg-stone-50/80 border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer";

    card.innerHTML = `
      <div class="flex items-center justify-between w-full">
        <span class="font-bold text-xs text-stone-900">${recipe.name}</span>
        <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded ${isSelected ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-600'}">${recipe.difficulty}</span>
      </div>
      <p class="text-[10px] text-stone-500 mt-1 leading-snug line-clamp-2">${recipe.tagline}</p>
    `;

    container.appendChild(card);
  });
}

function selectStyleRecipe(recipeId) {
  AppState.selectedRecipeId = recipeId;
  const recipe = RECIPES_DATA.find(r => r.id === recipeId) || RECIPES_DATA[0];

  // Aggiorna badge titolo
  const titleBadge = document.getElementById("current-recipe-badge");
  if (titleBadge) {
    titleBadge.textContent = recipe.name;
  }

  // Ridisegna sottomenu per mostrare stato attivo
  renderStylesSubmenu();

  applyRecipeDefaults(recipeId);
  updateCalculator();

  // Sincronizza selettore nella Scuola
  const academySelect = document.getElementById("academy-recipe-changer");
  if (academySelect) {
    academySelect.value = recipeId;
  }
  loadAcademyRecipe(recipeId);
}

// ==========================================
// SELETTORE METODO (DIRETTO, BIGA, POOLISH)
// ==========================================
function setDoughMethod(methodId) {
  AppState.selectedMethod = methodId;

  // Aggiorna stile bottoni metodi
  document.querySelectorAll(".method-btn").forEach(btn => {
    btn.classList.remove("bg-amber-50", "border-amber-500", "text-amber-900", "shadow-sm");
    btn.classList.add("bg-white", "border-stone-200", "text-stone-700");
  });

  const activeBtn = document.getElementById(`method-btn-${methodId}`);
  if (activeBtn) {
    activeBtn.classList.remove("bg-white", "border-stone-200", "text-stone-700");
    activeBtn.classList.add("bg-amber-50", "border-amber-500", "text-amber-900", "shadow-sm");
  }

  const methodData = (typeof DOUGH_METHODS !== "undefined" ? DOUGH_METHODS[methodId] : null);
  const badgeEl = document.getElementById("method-difficulty-badge");
  const titleEl = document.getElementById("method-explanation-title");
  const textEl = document.getElementById("method-explanation-text");
  const prefermentRow = document.getElementById("preferment-percentage-row");

  if (methodData) {
    if (badgeEl) badgeEl.textContent = methodData.badge;
    if (titleEl) titleEl.textContent = `Cosa ottieni con ${methodData.name}:`;
    if (textEl) textEl.textContent = `${methodData.whatYouGet} ${methodData.proTip}`;

    // Imposta default %
    if (methodId === "biga") {
      AppState.prefermentPct = 50;
      if (prefermentRow) {
        prefermentRow.classList.remove("hidden");
        document.getElementById("input-preferment-pct").value = 50;
        document.getElementById("display-preferment-pct").textContent = "50%";
        document.getElementById("label-preferment-pct-title").textContent = "% Farina nella Biga";
      }
    } else if (methodId === "poolish") {
      AppState.prefermentPct = 30;
      if (prefermentRow) {
        prefermentRow.classList.remove("hidden");
        document.getElementById("input-preferment-pct").value = 30;
        document.getElementById("display-preferment-pct").textContent = "30%";
        document.getElementById("label-preferment-pct-title").textContent = "% Farina nel Poolish";
      }
    } else {
      if (prefermentRow) prefermentRow.classList.add("hidden");
    }
  }

  updateCalculator();
  loadAcademyRecipe(AppState.selectedRecipeId);
  if (window.lucide) lucide.createIcons();
}

function onPrefermentPctChange(val) {
  AppState.prefermentPct = parseInt(val) || 50;
  const display = document.getElementById("display-preferment-pct");
  if (display) display.textContent = `${AppState.prefermentPct}%`;
  updateCalculator();
}

// ==========================================
// REGOLA DEI 55 / CALCOLO TEMPERATURA ACQUA
// ==========================================
function updateWaterTempCalc() {
  const roomTemp = parseInt(document.getElementById("input-room-temp").value) || 21;
  const flourTemp = parseInt(document.getElementById("pro-flour-temp")?.value) || 20;
  const kneadingType = document.getElementById("pro-kneading-type")?.value || "hand";

  const result = DoughCalculator.calculateWaterTemp({
    roomTemp,
    flourTemp,
    targetDoughTemp: 24,
    kneadingType
  });

  const resEl = document.getElementById("pro-water-temp-res");
  const adviceEl = document.getElementById("pro-water-temp-advice");
  if (resEl) resEl.textContent = `${result.waterTemp}°C`;
  if (adviceEl) adviceEl.textContent = result.advice;
}

function syncFromSlider(type, val) {
  const num = parseFloat(val);
  if (type === 'panetti') {
    const slider = document.getElementById("input-num-panetti");
    if (slider) slider.value = num;
    const input = document.getElementById("input-num-panetti-val");
    if (input) input.value = num;
  } else if (type === 'weight') {
    const slider = document.getElementById("input-weight-panetto");
    if (slider) slider.value = num;
    const input = document.getElementById("input-weight-panetto-val");
    if (input) input.value = num;
  } else if (type === 'hydration') {
    const slider = document.getElementById("input-hydration");
    if (slider) slider.value = num;
    const input = document.getElementById("input-hydration-val");
    if (input) input.value = num;
  }
  updateCalculator();
}

function syncFromInput(type, val) {
  let num = parseFloat(val);
  if (isNaN(num)) return;
  if (type === 'panetti') {
    const slider = document.getElementById("input-num-panetti");
    if (slider) slider.value = num;
    const input = document.getElementById("input-num-panetti-val");
    if (input) input.value = num;
  } else if (type === 'weight') {
    const slider = document.getElementById("input-weight-panetto");
    if (slider) slider.value = num;
    const input = document.getElementById("input-weight-panetto-val");
    if (input) input.value = num;
  } else if (type === 'hydration') {
    const slider = document.getElementById("input-hydration");
    if (slider) slider.value = num;
    const input = document.getElementById("input-hydration-val");
    if (input) input.value = num;
  }
  updateCalculator();
}

function applyRecipeDefaults(recipeId) {
  const recipe = RECIPES_DATA.find(r => r.id === recipeId) || RECIPES_DATA[0];

  const numEl = document.getElementById("input-num-panetti");
  const numValEl = document.getElementById("input-num-panetti-val");
  if (numEl) numEl.value = recipe.defaultPieces;
  if (numValEl) numValEl.value = recipe.defaultPieces;

  const weightEl = document.getElementById("input-weight-panetto");
  const weightValEl = document.getElementById("input-weight-panetto-val");
  if (weightEl) weightEl.value = recipe.defaultDoughWeight;
  if (weightValEl) weightValEl.value = recipe.defaultDoughWeight;

  const hydroEl = document.getElementById("input-hydration");
  const hydroValEl = document.getElementById("input-hydration-val");
  if (hydroEl) hydroEl.value = recipe.defaultHydration;
  if (hydroValEl) hydroValEl.value = recipe.defaultHydration;

  document.getElementById("input-salt-pct").value = recipe.defaultSalt;
  document.getElementById("input-oil-pct").value = recipe.defaultOil;
  document.getElementById("input-room-temp").value = recipe.defaultRoomTemp;
  document.getElementById("input-room-hours").value = recipe.defaultTotalHours - recipe.defaultFridgeHours;
  document.getElementById("input-fridge-hours").value = recipe.defaultFridgeHours;
}

function setYeastType(type) {
  AppState.selectedYeastType = type;

  // Aggiorna stile bottoni
  document.querySelectorAll(".yeast-tab-btn").forEach(btn => {
    btn.classList.remove("bg-amber-50", "border-amber-500", "text-amber-900", "shadow-sm");
    btn.classList.add("bg-white", "border-stone-200", "text-stone-700");
  });

  const activeBtn = document.getElementById(`yeast-btn-${type}`);
  if (activeBtn) {
    activeBtn.classList.remove("bg-white", "border-stone-200", "text-stone-700");
    activeBtn.classList.add("bg-amber-50", "border-amber-500", "text-amber-900", "shadow-sm");
  }

  updateCalculator();
}

function toggleAdvancedParams() {
  AppState.showAdvanced = !AppState.showAdvanced;
  const panel = document.getElementById("advanced-params-panel");
  const text = document.getElementById("advanced-toggle-text");
  
  if (panel) {
    panel.classList.toggle("hidden", !AppState.showAdvanced);
  }
  if (text) {
    text.textContent = AppState.showAdvanced
      ? "Nascondi opzioni avanzate"
      : "Mostra opzioni avanzate (Sale %, Olio %, Malto %)";
  }
}

function updateCalculator() {
  const recipe = RECIPES_DATA.find(r => r.id === AppState.selectedRecipeId) || RECIPES_DATA[0];

  // Lettura valori input (da input numerico o slider)
  const numPanetti = parseInt(document.getElementById("input-num-panetti-val")?.value || document.getElementById("input-num-panetti")?.value) || 1;
  const weightPanetto = parseInt(document.getElementById("input-weight-panetto-val")?.value || document.getElementById("input-weight-panetto")?.value) || 260;
  const hydration = parseInt(document.getElementById("input-hydration-val")?.value || document.getElementById("input-hydration")?.value) || 65;
  const saltPct = parseFloat(document.getElementById("input-salt-pct").value) || 2.5;
  const oilPct = parseFloat(document.getElementById("input-oil-pct").value) || 0;
  const sugarPct = parseFloat(document.getElementById("input-sugar-pct").value) || 0;
  const roomTemp = parseInt(document.getElementById("input-room-temp").value) || 21;
  const roomHours = parseInt(document.getElementById("input-room-hours").value) || 8;
  const fridgeHours = parseInt(document.getElementById("input-fridge-hours").value) || 0;

  // Aggiornamento labels reattive e sync input diretti
  const lblPanetti = document.getElementById("label-num-panetti");
  if (lblPanetti) lblPanetti.textContent = numPanetti;
  const lblWeight = document.getElementById("label-weight-panetto");
  if (lblWeight) lblWeight.textContent = `${weightPanetto}g`;
  const lblHydro = document.getElementById("label-hydration");
  if (lblHydro) lblHydro.textContent = `${hydration}%`;

  const lblRoomTemp = document.getElementById("label-room-temp");
  if (lblRoomTemp) lblRoomTemp.textContent = `${roomTemp}°C`;
  const lblRoomHours = document.getElementById("label-room-hours");
  if (lblRoomHours) lblRoomHours.textContent = `${roomHours} ore`;
  const lblFridgeHours = document.getElementById("label-fridge-hours");
  if (lblFridgeHours) lblFridgeHours.textContent = `${fridgeHours} ore`;

  const numValEl = document.getElementById("input-num-panetti-val");
  if (numValEl && document.activeElement !== numValEl) numValEl.value = numPanetti;
  const weightValEl = document.getElementById("input-weight-panetto-val");
  if (weightValEl && document.activeElement !== weightValEl) weightValEl.value = weightPanetto;
  const hydroValEl = document.getElementById("input-hydration-val");
  if (hydroValEl && document.activeElement !== hydroValEl) hydroValEl.value = hydration;

  // Badge difficoltà idratazione
  const badgeDiff = document.getElementById("badge-difficolta-idro");
  if (badgeDiff) {
    if (hydration < 65) {
      badgeDiff.textContent = "Facile da stendere";
      badgeDiff.className = "text-[11px] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-800";
    } else if (hydration <= 72) {
      badgeDiff.textContent = "Media complessità";
      badgeDiff.className = "text-[11px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800";
    } else {
      badgeDiff.textContent = "Alta idratazione (richiede pieghe)";
      badgeDiff.className = "text-[11px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-800";
    }
  }

  // Calcolo totale peso target
  const targetTotalWeight = numPanetti * weightPanetto;

  // Esecuzione calcolo matematico
  const calcResult = DoughCalculator.calculate({
    targetTotalWeight,
    hydration,
    salt: saltPct,
    oil: oilPct,
    sugar: sugarPct,
    roomHours,
    fridgeHours,
    tempC: roomTemp,
    yeastType: AppState.selectedYeastType
  });

  // Renderizzazione risultati principali
  document.getElementById("res-total-weight").textContent = `${calcResult.actualTotalWeight} g`;
  document.getElementById("res-flour").textContent = `${calcResult.flour} g`;
  document.getElementById("res-water").textContent = `${calcResult.water} g`;
  document.getElementById("res-hydration-label").textContent = `${calcResult.hydration}`;
  document.getElementById("res-salt").textContent = `${calcResult.salt} g`;

  // Lievito con etichetta
  const yeastLabels = {
    fresh: "Fresco",
    dry: "Secco",
    solid: "Madre Solida",
    licoli: "Licoli"
  };
  document.getElementById("res-yeast-type-label").textContent = yeastLabels[calcResult.yeastType] || "Fresco";
  document.getElementById("res-yeast").textContent = `${calcResult.yeast} g`;

  // Olio e Zucchero opzionali
  const oilRow = document.getElementById("res-oil-row");
  if (oilRow) {
    oilRow.classList.toggle("hidden", calcResult.oil <= 0);
    document.getElementById("res-oil").textContent = `${calcResult.oil} g`;
  }

  const sugarRow = document.getElementById("res-sugar-row");
  if (sugarRow) {
    sugarRow.classList.toggle("hidden", calcResult.sugar <= 0);
    document.getElementById("res-sugar").textContent = `${calcResult.sugar} g`;
  }

  // Nota su lievito madre
  const noteBox = document.getElementById("sourdough-note-box");
  const noteText = document.getElementById("sourdough-note-text");
  if (noteBox && noteText) {
    if (calcResult.sourdoughAdvice) {
      noteBox.classList.remove("hidden");
      noteText.textContent = calcResult.sourdoughAdvice;
    } else {
      noteBox.classList.add("hidden");
    }
  }

  // Aggiornamento consigli farina
  if (recipe && recipe.flourRecommendation) {
    document.getElementById("flour-rec-type").textContent = recipe.flourRecommendation.type;
    document.getElementById("flour-rec-w").textContent = recipe.flourRecommendation.w;
    document.getElementById("flour-rec-prot").textContent = recipe.flourRecommendation.protein;
    document.getElementById("flour-rec-notes").textContent = recipe.flourRecommendation.notes;
  }

  // Scomposizione Pre-fermento (Biga o Poolish)
  const prefermentResult = DoughCalculator.calculatePreferment(calcResult, AppState.selectedMethod, AppState.prefermentPct);
  const breakdownCard = document.getElementById("preferment-breakdown-card");

  if (prefermentResult && breakdownCard) {
    breakdownCard.classList.remove("hidden");
    const breakdownTitle = document.getElementById("breakdown-title");
    const prepName = document.getElementById("breakdown-prep-name");
    const prepTemp = document.getElementById("breakdown-prep-temp");
    
    if (breakdownTitle) breakdownTitle.textContent = `Scomposizione con ${prefermentResult.preferment.name} (${AppState.prefermentPct}%)`;
    if (prepName) prepName.textContent = prefermentResult.method === "biga" ? "Biga (45% idro)" : "Poolish (100% idro)";
    if (prepTemp) prepTemp.textContent = prefermentResult.method === "biga" ? "16-18°C (16-24h)" : "20-22°C (8-16h)";

    // Fase 1
    const prefFlour = document.getElementById("breakdown-pref-flour");
    const prefWater = document.getElementById("breakdown-pref-water");
    const prefHydro = document.getElementById("breakdown-pref-hydro");
    const prefYeast = document.getElementById("breakdown-pref-yeast");
    const prefNote = document.getElementById("breakdown-pref-note");

    if (prefFlour) prefFlour.textContent = `${prefermentResult.preferment.flour} g`;
    if (prefWater) prefWater.textContent = `${prefermentResult.preferment.water} g`;
    if (prefHydro) prefHydro.textContent = `${prefermentResult.preferment.hydration}`;
    if (prefYeast) prefYeast.textContent = `${prefermentResult.preferment.yeast} g`;
    if (prefNote) prefNote.textContent = `${prefermentResult.preferment.tempAdvice} ${prefermentResult.preferment.prepNote}`;

    // Fase 2
    const refFlour = document.getElementById("breakdown-ref-flour");
    const refWater = document.getElementById("breakdown-ref-water");
    const refSalt = document.getElementById("breakdown-ref-salt");
    const refOil = document.getElementById("breakdown-ref-oil");
    const refNote = document.getElementById("breakdown-ref-note");

    if (refFlour) refFlour.textContent = `${prefermentResult.refresh.flour} g`;
    if (refWater) refWater.textContent = `${prefermentResult.refresh.water} g`;
    if (refSalt) refSalt.textContent = `${prefermentResult.refresh.salt} g`;
    if (refOil) refOil.textContent = `${prefermentResult.refresh.oil} g`;
    if (refNote) refNote.textContent = prefermentResult.refresh.prepNote;
  } else if (breakdownCard) {
    breakdownCard.classList.add("hidden");
  }

  // Se in Pro Mode, calcola la temperatura dell'acqua
  if (AppState.experienceMode === "pro") {
    updateWaterTempCalc();
  }

  // Aggiornamento Consulente Forno
  updateOvenAdvisor();

  if (window.MaestroAgent) {
    MaestroAgent.updateContextPill();
  }
}

// ==========================================
// GESTIONE SELEZIONE FORNO & CONSULENTE
// ==========================================
function setOvenType(ovenId) {
  AppState.selectedOvenId = ovenId;

  // Aggiorna stile bottoni forno
  document.querySelectorAll(".oven-tab-btn").forEach(btn => {
    btn.classList.remove("bg-amber-50", "border-amber-500", "text-amber-900", "shadow-sm");
    btn.classList.add("bg-white", "border-stone-200", "text-stone-700");
  });

  const activeBtn = document.getElementById(`oven-btn-${ovenId}`);
  if (activeBtn) {
    activeBtn.classList.remove("bg-white", "border-stone-200", "text-stone-700");
    activeBtn.classList.add("bg-amber-50", "border-amber-500", "text-amber-900", "shadow-sm");
  }

  const oven = (typeof OVENS_DATA !== "undefined" ? OVENS_DATA : []).find(o => o.id === ovenId);
  const tempLabel = document.getElementById("label-selected-oven-temp");
  if (tempLabel && oven) {
    tempLabel.textContent = `Max ${oven.maxTemp}`;
  }

  updateOvenAdvisor();
  loadAcademyRecipe(AppState.selectedRecipeId);
}

function updateOvenAdvisor() {
  const oven = (typeof OVENS_DATA !== "undefined" ? OVENS_DATA : []).find(o => o.id === AppState.selectedOvenId) || (typeof OVENS_DATA !== "undefined" ? OVENS_DATA[0] : null);
  if (!oven) return;

  const card = document.getElementById("oven-advisor-card");
  const nameEl = document.getElementById("oven-advisor-name");
  const tempEl = document.getElementById("oven-advisor-temp");
  const badgeEl = document.getElementById("oven-advisor-badge");
  const warningBox = document.getElementById("oven-warning-box");
  const warningTitle = document.getElementById("oven-warning-title");
  const warningMsg = document.getElementById("oven-warning-msg");
  const suggestionBox = document.getElementById("oven-suggestion-box");
  const suggestionText = document.getElementById("oven-suggestion-text");
  const switchLabel = document.getElementById("btn-switch-suggested-label");
  const adaptBox = document.getElementById("oven-adapt-box");
  const tipsBox = document.getElementById("oven-tips-box");
  const tipsText = document.getElementById("oven-tips-text");

  if (nameEl) nameEl.textContent = oven.name;
  if (tempEl) tempEl.textContent = `${oven.tagline}`;

  const recipeAdvice = oven.recipesAdvice ? oven.recipesAdvice[AppState.selectedRecipeId] : null;

  if (!recipeAdvice) {
    if (warningBox) warningBox.classList.add("hidden");
    if (badgeEl) {
      badgeEl.textContent = "Compatibile";
      badgeEl.className = "text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800";
    }
    if (tipsText) tipsText.textContent = oven.adviceGeneral || "Preriscalda bene prima di infornare.";
    return;
  }

  // Livello di allerta
  if (recipeAdvice.warningLevel === "high") {
    // Incompatibilità critica (es. Napoletana + Forno di Casa)
    if (card) {
      card.className = "rounded-2xl p-5 shadow-sm border transition-all space-y-3.5 bg-amber-50/50 border-amber-400";
    }
    if (badgeEl) {
      badgeEl.textContent = "❌ Troppo Freddo / Sconsigliato";
      badgeEl.className = "text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300";
    }
    if (warningBox) {
      warningBox.classList.remove("hidden");
      warningBox.className = "p-3.5 rounded-xl border space-y-2.5 bg-amber-100/70 border-amber-300 text-amber-950";
    }
    if (warningTitle) warningTitle.textContent = recipeAdvice.warningTitle;
    if (warningMsg) warningMsg.textContent = recipeAdvice.warningMessage;

    // Suggerimento ricetta alternativa
    if (recipeAdvice.suggestedRecipeId) {
      AppState.suggestedRecipeId = recipeAdvice.suggestedRecipeId;
      if (suggestionBox) suggestionBox.classList.remove("hidden");
      if (suggestionText) suggestionText.textContent = recipeAdvice.suggestionText;
      if (switchLabel) switchLabel.textContent = `Passa a ${recipeAdvice.suggestedRecipeName}`;
    } else {
      if (suggestionBox) suggestionBox.classList.add("hidden");
    }

    // Tasto adattamento ingredienti per forno di casa
    if (AppState.selectedRecipeId === "pizza_napoletana" && oven.id === "home_standard") {
      if (adaptBox) adaptBox.classList.remove("hidden");
    } else {
      if (adaptBox) adaptBox.classList.add("hidden");
    }

    if (tipsText) {
      tipsText.innerHTML = recipeAdvice.homeOvenHacks
        ? `<strong class="text-stone-800 block mb-1">Hacks per cuocere la tonda a 250°C:</strong>` + recipeAdvice.homeOvenHacks.map(h => `• ${h}`).join("<br>")
        : (recipeAdvice.tips || oven.adviceGeneral);
    }

  } else if (recipeAdvice.warningLevel === "medium" || recipeAdvice.warningLevel === "info") {
    if (card) {
      card.className = "rounded-2xl p-5 shadow-sm border transition-all space-y-3.5 bg-amber-50/20 border-amber-200";
    }
    if (badgeEl) {
      badgeEl.textContent = "⚠️ Con Accortezze";
      badgeEl.className = "text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300";
    }
    if (warningBox) {
      warningBox.classList.remove("hidden");
      warningBox.className = "p-3.5 rounded-xl border space-y-2 bg-amber-100/50 border-amber-200 text-amber-900";
    }
    if (warningTitle) warningTitle.textContent = recipeAdvice.warningTitle;
    if (warningMsg) warningMsg.textContent = recipeAdvice.warningMessage;
    if (suggestionBox) suggestionBox.classList.add("hidden");
    if (adaptBox) adaptBox.classList.add("hidden");
    if (tipsText) tipsText.textContent = recipeAdvice.tips || oven.adviceGeneral;

  } else {
    // Perfetto
    if (card) {
      card.className = "rounded-2xl p-5 shadow-sm border transition-all space-y-3.5 bg-green-50/20 border-green-300";
    }
    if (badgeEl) {
      badgeEl.textContent = "✅ Abbinamento Perfetto";
      badgeEl.className = "text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300";
    }
    if (warningBox) warningBox.classList.add("hidden");
    if (suggestionBox) suggestionBox.classList.add("hidden");
    if (adaptBox) adaptBox.classList.add("hidden");
    if (tipsText) tipsText.textContent = recipeAdvice.tips || oven.adviceGeneral;
  }

  if (window.lucide) lucide.createIcons();
}

function applySuggestedRecipe() {
  if (AppState.suggestedRecipeId) {
    onRecipeChange(AppState.suggestedRecipeId);
  }
}

function adaptRecipeForHomeOven() {
  document.getElementById("input-oil-pct").value = "2.5";
  document.getElementById("input-sugar-pct").value = "1.0";
  
  if (!AppState.showAdvanced) {
    toggleAdvancedParams();
  }
  
  updateCalculator();
  alert("Ingredienti aggiornati per Forno di Casa!\nAggiunto il 2.5% di Olio EVO e l'1% di Malto/Miele per non far disidratare l'impasto a 250°C e favorire la doratura.");
}

// ==========================================
// SCUOLA PASSO-PASSO (ACADEMY)
// ==========================================
function startAcademyWithCurrentRecipe() {
  switchTab("academy");
  loadAcademyRecipe(AppState.selectedRecipeId);
}

function loadAcademyRecipe(recipeId) {
  const recipe = RECIPES_DATA.find(r => r.id === recipeId) || RECIPES_DATA[0];
  AppState.selectedRecipeId = recipeId;

  document.getElementById("academy-recipe-title").textContent = `${recipe.name} (${AppState.selectedMethod === 'biga' ? 'Metodo con Biga' : (AppState.selectedMethod === 'poolish' ? 'Metodo con Poolish' : 'Metodo Diretto')})`;
  document.getElementById("academy-recipe-tagline").textContent = recipe.tagline;

  const container = document.getElementById("academy-steps-container");
  if (!container) return;

  container.innerHTML = "";

  // Costruzione della lista dei passi in base al metodo di impasto
  let stepsToRender = [];

  if (AppState.selectedMethod === "biga") {
    // Fase 1: Biga
    stepsToRender.push({
      step: 1,
      title: "1. Preparazione della Biga (16-24 ore prima)",
      durationMinutes: 15,
      hasTimer: false,
      instruction: `Pesa la farina della biga (${AppState.prefermentPct}% del totale), l'acqua fredda (45% sulla farina) e il lievito. Mescola energicamente in una ciotola solo per 2-3 minuti finché non c'è più farina asciutta visibile. NON impastare e non creare maglia glutinica: la biga deve restare sgranata, grezza e a pezzetti. Metti in un contenitore capiente, copri con telo umido o coperchio forato e lascia fermentare a 16-18°C per 16-24 ore.`,
      whyItWorks: "Durante le 18 ore di fermentazione lenta, la proteolisi controllata e la produzione di acidi organici renderanno l'impasto finale incredibilmente estensibile e daranno un cornicione alveolato e croccante con profumi intensi."
    });

    // Fase 2: Chiusura
    stepsToRender.push({
      step: 2,
      title: "2. Chiusura e Rinfresco dell'Impasto",
      durationMinutes: 20,
      hasTimer: false,
      instruction: `Taglia o spezzetta la biga maturata a pezzi nella ciotola. Unisci la farina del rinfresco e circa il 70% dell'acqua rimasta (fredda). Lavora a velocità bassa per sciogliere i pezzetti di biga. Appena si forma una struttura elastica, unisci il sale e la restante acqua a filo poco alla volta. Infine unisci l'olio se previsto.`,
      whyItWorks: "Aggiungere l'acqua fredda gradualmente permette alla biga di incorporarsi senza 'annegare' il glutine."
    });

    // Aggiungi gli step successivi della ricetta (Puntata/Riposo, Staglio, Appretto, Stesura, Cottura)
    const subsequentSteps = recipe.steps.filter(s => s.step >= 3);
    subsequentSteps.forEach((s, idx) => {
      stepsToRender.push({
        ...s,
        step: idx + 3
      });
    });

  } else if (AppState.selectedMethod === "poolish") {
    // Fase 1: Poolish
    stepsToRender.push({
      step: 1,
      title: "1. Preparazione del Poolish (8-14 ore prima)",
      durationMinutes: 10,
      hasTimer: false,
      instruction: `Unisci in parti uguali farina e acqua con il lievito in una caraffa o barattolo alto. Mescola vigorosamente con una forchetta fino a formare una crema priva di grumi. Segna il livello iniziale con un elastico. Copri e lascia riposare a 20-22°C per 8-12 ore. Sarà pronto quando la superficie è colma di bolle fitte e il centro accenna appena a cedere.`,
      whyItWorks: "L'ambiente liquido favorisce la moltiplicazione rapida dei lieviti e la produzione di enzimi che donano alla pizza una scioglievolezza assoluta al morso."
    });

    // Fase 2: Chiusura
    stepsToRender.push({
      step: 2,
      title: "2. Chiusura dell'Impasto con Poolish",
      durationMinutes: 15,
      hasTimer: false,
      instruction: `Versa il poolish attivo nella ciotola, aggiungi l'acqua rimasta e tutta la farina del rinfresco. Inizia a impastare. Appena la massa prende corpo, aggiungi il sale e lavora fino a incordatura perfetta. Unisci l'olio per ultimo se previsto.`,
      whyItWorks: "Il poolish agisce come un inoculo enzimatico potente che riduce notevolmente i tempi di incordatura finale."
    });

    const subsequentSteps = recipe.steps.filter(s => s.step >= 3);
    subsequentSteps.forEach((s, idx) => {
      stepsToRender.push({
        ...s,
        step: idx + 3
      });
    });

  } else {
    // Metodo Diretto Standard
    stepsToRender = [...recipe.steps];
  }

  stepsToRender.forEach((step, idx) => {
    let stepTitle = step.title;
    let stepInstruction = step.instruction;
    let stepDuration = step.durationMinutes;
    let stepWhy = step.whyItWorks;
    let hasTimer = step.hasTimer;

    // Se è il passaggio di cottura, personalizzalo dinamicamente con il forno selezionato
    const isBakingStep = (step.step === recipe.steps.length) || step.title.toLowerCase().includes("cottura");
    if (isBakingStep) {
      const oven = (typeof OVENS_DATA !== "undefined" ? OVENS_DATA : []).find(o => o.id === AppState.selectedOvenId);
      if (oven) {
        stepTitle = `Cottura con ${oven.name} (${oven.maxTemp})`;

        if (oven.id === "home_standard") {
          if (recipe.id === "pizza_napoletana") {
            stepInstruction = `⚠️ COTTURA FORNO DI CASA A 250°C (Tecnica Padella + Grill): La classica tonda a 250°C non svilupperà il cornicione in tempo. Procedi così: 1) Preriscalda il forno al massimo (250-275°C) con il grill acceso e la leccarda sul ripiano più alto. 2) Scalda una padella antiaderente o in ghisa sul fornello a gas finché è rovente. 3) Stendi il panetto, adagialo in padella e condisci velocemente. 4) Cuoci per 90-120 secondi sul gas per cuocere e tostare il fondo. 5) Trasferisci immediatamente la padella (o fai scivolare la pizza) sotto il grill del forno per altri 2-3 minuti per dorare il cornicione.`;
            stepDuration = 5;
            stepWhy = "Nel forno casalingo la potenza termica è insufficiente; la padella rovente trasferisce calore per conduzione sul fondo mentre il grill fornisce l'irraggiamento dall'alto simulando la fiamma viva.";
          } else {
            stepInstruction = `${step.instruction} • Consiglio Forno di Casa: Preriscalda per almeno 40 minuti per stabilizzare la temperatura.`;
          }
        } else if (oven.id === "gas_portable") {
          if (recipe.id === "pizza_napoletana") {
            stepInstruction = `🔥 COTTURA FORNO A GAS (Ooni / Munaciello): Preriscalda a fiamma massima per 20-25 minuti fino a quando il centro della pietra misura 420-440°C. TRUCCO ESSENZIALE: Appena inforni la pizza, ABBASSA SUBITO LA FIAMMA AL MINIMO! Questo eviterà che il cornicione si bruci prima che il fondo sia cotto. Ruota la pizza di 90° ogni 20 secondi con un palino. Cottura totale: 75-90 secondi.`;
            stepDuration = 2;
            stepWhy = "Abbassare la fiamma al minimo riduce l'irraggiamento fiammante e bilancia il tempo di cottura tra la conduzione dal biscotto refrattario e la doratura superiore.";
          }
        } else if (oven.id === "electric_pizza") {
          if (recipe.id === "pizza_napoletana") {
            stepInstruction = `⚡ COTTURA FORNETTO ELETTRICO (Ferrari / Effeuno): Preriscalda la pietra a 400°C. Inforna quando la resistenza superiore è accesa e rovente. Se hai un fornetto a conchiglia rotondo, ruota la pizza di 180° dopo 60 secondi. Tempo totale: circa 90-120 secondi.`;
            stepDuration = 2;
          }
        } else if (oven.id === "wood_fired") {
          if (recipe.id === "pizza_napoletana") {
            stepInstruction = `🪵 COTTURA FORNO A LEGNA: Spazza il piano dalla cenere. Platea a 430°C, fiamma viva e chiara. Inforna con colpo secco di pala. Dopo 40 secondi fai il primo giro. Negli ultimi 5 secondi, alza la pizza verso la volta con la pala per il 'bacio del forno'. Tempo: 60-90 secondi.`;
            stepDuration = 1;
          }
        }
      }
    }

    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4 hover:border-amber-300 transition";

    const btnId = `btn-step-timer-${step.step}`;
    const hasTimerBtn = hasTimer ? `
      <button id="${btnId}" data-step="${step.step}" data-duration="${stepDuration}" onclick="handleStepTimerClick(${step.step}, ${stepDuration}, '${escapeHtml(stepTitle)}')" class="step-timer-button inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs border border-amber-300/80 transition cursor-pointer shadow-sm">
        <i data-lucide="play" class="w-3.5 h-3.5 text-amber-600"></i>
        <span>Avvia Timer (${stepDuration} min)</span>
      </button>
    ` : '';

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-100 pb-3">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
            ${step.step}
          </span>
          <h3 class="font-bold text-stone-900 text-base sm:text-lg font-serif-display">${stepTitle}</h3>
        </div>
        ${hasTimerBtn}
      </div>

      <p class="text-sm text-stone-700 leading-relaxed font-normal">
        ${stepInstruction}
      </p>

      <div class="bg-amber-50/80 border-l-4 border-amber-500 p-3.5 rounded-r-xl text-xs text-amber-950 space-y-1">
        <div class="font-bold flex items-center gap-1.5 text-amber-900">
          <i data-lucide="microscope" class="w-4 h-4 text-amber-600"></i>
          <span>Perché Funziona (La Teoria del Maestro)</span>
        </div>
        <p class="text-stone-700 leading-relaxed italic">
          ${stepWhy}
        </p>
      </div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) {
    lucide.createIcons();
  }
}

// ==========================================
// GESTIONE TIMER E ALLARME AUDIO
// ==========================================
function handleStepTimerClick(stepNumber, minutes, title) {
  // Se questo step ha già il timer attivo, il clic funge da STOP
  if (AppState.timer.intervalId && AppState.timer.runningStep === stepNumber) {
    stopActiveTimer();
    return;
  }
  startStepTimer(stepNumber, minutes, title);
}

function startStepTimer(stepNumber, minutes, title) {
  stopActiveTimer();

  const totalSeconds = minutes * 60;
  AppState.timer.remainingSeconds = totalSeconds;
  AppState.timer.title = title;
  AppState.timer.runningStep = stepNumber;

  // Mostra pill in alto
  const pill = document.getElementById("active-timer-pill");
  if (pill) {
    pill.classList.remove("hidden");
    pill.classList.add("flex");
  }

  // Mostra barra flottante in basso a destra
  const floatingBar = document.getElementById("floating-timer-bar");
  const floatingTitle = document.getElementById("floating-timer-title");
  if (floatingBar) {
    floatingBar.classList.remove("hidden");
    floatingBar.classList.add("flex");
    if (floatingTitle) floatingTitle.textContent = title;
  }

  // Aggiorna stile bottone attivo per mostrare "Ferma Timer"
  const activeBtn = document.getElementById(`btn-step-timer-${stepNumber}`);
  if (activeBtn) {
    activeBtn.className = "step-timer-button inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl text-xs border border-red-300 transition animate-pulse cursor-pointer shadow-sm";
  }

  updateTimerPillDisplay();

  AppState.timer.intervalId = setInterval(() => {
    AppState.timer.remainingSeconds--;
    if (AppState.timer.remainingSeconds <= 0) {
      clearInterval(AppState.timer.intervalId);
      AppState.timer.intervalId = null;
      triggerTimerFinished();
    } else {
      updateTimerPillDisplay();
    }
  }, 1000);
}

function updateTimerPillDisplay() {
  const m = Math.floor(AppState.timer.remainingSeconds / 60);
  const s = AppState.timer.remainingSeconds % 60;
  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  const display = document.getElementById("active-timer-display");
  if (display) display.textContent = timeStr;

  const floatingDisplay = document.getElementById("floating-timer-display");
  if (floatingDisplay) floatingDisplay.textContent = timeStr;

  // Aggiorna il testo del bottone del passo attivo
  if (AppState.timer.runningStep) {
    const activeBtn = document.getElementById(`btn-step-timer-${AppState.timer.runningStep}`);
    if (activeBtn) {
      activeBtn.innerHTML = `<i data-lucide="square" class="w-3.5 h-3.5 fill-current text-red-600"></i> <span>Ferma Timer (${timeStr})</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }
}

function triggerTimerFinished() {
  playTimerBell();

  const modal = document.getElementById("timer-modal");
  const modalTitle = document.getElementById("timer-modal-title");
  const modalDesc = document.getElementById("timer-modal-desc");
  const modalCountdown = document.getElementById("timer-modal-countdown");

  if (modalTitle) modalTitle.textContent = "Fase Completata!";
  if (modalDesc) modalDesc.textContent = `È terminato il tempo per: ${AppState.timer.title}`;
  if (modalCountdown) modalCountdown.textContent = "00:00";
  if (modal) modal.classList.remove("hidden");

  // Nascondi indicatori attivi
  const pill = document.getElementById("active-timer-pill");
  if (pill) {
    pill.classList.add("hidden");
    pill.classList.remove("flex");
  }
  const floatingBar = document.getElementById("floating-timer-bar");
  if (floatingBar) {
    floatingBar.classList.add("hidden");
    floatingBar.classList.remove("flex");
  }

  resetAllStepButtons();
}

function stopActiveTimer() {
  if (AppState.timer.intervalId) {
    clearInterval(AppState.timer.intervalId);
    AppState.timer.intervalId = null;
  }
  AppState.timer.remainingSeconds = 0;
  AppState.timer.runningStep = null;
  AppState.timer.title = "";

  const modal = document.getElementById("timer-modal");
  if (modal) modal.classList.add("hidden");

  const pill = document.getElementById("active-timer-pill");
  if (pill) {
    pill.classList.add("hidden");
    pill.classList.remove("flex");
  }

  const floatingBar = document.getElementById("floating-timer-bar");
  if (floatingBar) {
    floatingBar.classList.add("hidden");
    floatingBar.classList.remove("flex");
  }

  resetAllStepButtons();
}

function resetAllStepButtons() {
  document.querySelectorAll(".step-timer-button").forEach(btn => {
    const duration = btn.getAttribute("data-duration") || "5";
    btn.className = "step-timer-button inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-xl text-xs border border-amber-300/80 transition cursor-pointer shadow-sm";
    btn.innerHTML = `<i data-lucide="play" class="w-3.5 h-3.5 text-amber-600"></i> <span>Avvia Timer (${duration} min)</span>`;
  });
  if (window.lucide) lucide.createIcons();
}

// Suono campanella tramite Web Audio API (senza file audio esterni)
function playTimerBell() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Triplo tocco di campana armonico
    [0, 0.4, 0.8].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime + delay); // Nota La5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + delay + 0.8);

      gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 1.0);
    });
  } catch (e) {
    console.log("Audio non riproducibile:", e);
  }
}

// ==========================================
// PRONTO SOCCORSO (TROUBLESHOOTING)
// ==========================================
function initTroubleshooter() {
  renderTroubleshooter("");
}

function filterTroubleshooter(query) {
  renderTroubleshooter(query.toLowerCase());
}

function renderTroubleshooter(query) {
  const container = document.getElementById("troubleshooter-list");
  if (!container) return;

  const filtered = TROUBLESHOOTER_DATA.filter(item => {
    if (!query) return true;
    return item.problem.toLowerCase().includes(query) ||
           item.symptom.toLowerCase().includes(query) ||
           item.quickFix.toLowerCase().includes(query) ||
           item.category.toLowerCase().includes(query);
  });

  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-2 text-center py-10 text-stone-500">
        <i data-lucide="help-circle" class="w-8 h-8 mx-auto mb-2 text-stone-400"></i>
        Nessun problema trovato con questo termine. Prova parole come 'appiccicoso', 'elastico', 'lievita'.
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl p-5 shadow-sm border border-stone-200 space-y-3.5 flex flex-col justify-between";

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <span class="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md uppercase">
            ${item.category}
          </span>
          <span class="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
            ${item.severity}
          </span>
        </div>

        <h3 class="font-bold text-stone-900 text-base font-serif-display flex items-start gap-2">
          <i data-lucide="${item.icon || 'alert-circle'}" class="w-4 h-4 text-amber-600 mt-1 flex-shrink-0"></i>
          <span>${item.problem}</span>
        </h3>

        <p class="text-xs text-stone-600 mt-2 italic bg-stone-50 p-2 rounded-lg border border-stone-100">
          "${item.symptom}"
        </p>

        <div class="mt-3 text-xs space-y-2">
          <div>
            <strong class="text-stone-800">Causa Scientifica:</strong>
            <span class="text-stone-600 leading-relaxed"> ${item.scientificCause}</span>
          </div>
          <div class="bg-green-50/80 border-l-4 border-green-500 p-2.5 rounded-r-lg text-green-950 font-medium">
            <strong class="text-green-900 flex items-center gap-1"><i data-lucide="zap" class="w-3.5 h-3.5 text-green-600"></i> Come salvarlo subito:</strong>
            ${item.quickFix}
          </div>
        </div>
      </div>

      <div class="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
        <strong class="text-stone-700">Per la prossima volta:</strong> ${item.prevention}
      </div>
    `;

    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// ==========================================
// DIARIO DEGLI IMPASTI
// ==========================================
function initJournal() {
  renderJournal();
}

function renderJournal() {
  const container = document.getElementById("journal-entries-container");
  if (!container) return;

  const entries = DoughStorage.getJournal();
  container.innerHTML = "";

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl p-8 text-center text-stone-500 border border-stone-200">
        <i data-lucide="book" class="w-10 h-10 mx-auto mb-2 text-stone-400"></i>
        <p class="text-sm font-semibold">Nessun impasto salvato nel diario.</p>
        <p class="text-xs text-stone-400 mt-1">Usa il calcolatore e salva i tuoi esperimenti per ricordare ricette e tempi.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  entries.forEach(entry => {
    const stars = "⭐".repeat(entry.rating || 5);
    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3";

    card.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-stone-900 text-base">${entry.recipeName}</h4>
          <span class="text-xs text-amber-500">${stars}</span>
          <span class="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-semibold">Idro ${entry.hydration}%</span>
        </div>
        <p class="text-xs text-stone-600 max-w-2xl">${entry.notes || 'Nessuna nota aggiuntiva.'}</p>
        <div class="text-[11px] text-stone-400">Data infornata: ${entry.date}</div>
      </div>
      <button onclick="deleteJournalItem('${entry.id}')" title="Elimina voce" class="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;

    container.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function openNewJournalModal() {
  document.getElementById("modal-journal-title").value = "Esperimento Pizza";
  document.getElementById("modal-journal-hydro").value = "65";
  document.getElementById("modal-journal-notes").value = "";
  document.getElementById("journal-modal").classList.remove("hidden");
}

function saveCurrentToJournalModal() {
  const recipe = RECIPES_DATA.find(r => r.id === AppState.selectedRecipeId) || RECIPES_DATA[0];
  const hydro = document.getElementById("input-hydration").value;

  document.getElementById("modal-journal-title").value = `${recipe.name}`;
  document.getElementById("modal-journal-hydro").value = hydro;
  document.getElementById("modal-journal-notes").value = `Farina: ${recipe.flourRecommendation.type} (W ${recipe.flourRecommendation.w}). Lievitazione ${document.getElementById("input-room-hours").value}h a temp ambiente + ${document.getElementById("input-fridge-hours").value}h frigo.`;
  document.getElementById("journal-modal").classList.remove("hidden");
}

function closeJournalModal() {
  document.getElementById("journal-modal").classList.add("hidden");
}

function saveJournalEntryConfirm() {
  const title = document.getElementById("modal-journal-title").value.trim() || "Impasto";
  const hydro = parseInt(document.getElementById("modal-journal-hydro").value) || 65;
  const rating = parseInt(document.getElementById("modal-journal-rating").value) || 5;
  const notes = document.getElementById("modal-journal-notes").value.trim();

  DoughStorage.addJournalEntry({
    recipeName: title,
    hydration: hydro,
    rating,
    notes
  });

  closeJournalModal();
  renderJournal();
  switchTab("journal");
}

function deleteJournalItem(id) {
  if (confirm("Vuoi eliminare questo appunto dal diario?")) {
    DoughStorage.deleteJournalEntry(id);
    renderJournal();
  }
}

// Utility per evitare iniezioni HTML semplici
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==========================================
// TOAST NOTIFICA FLOTTANTE
// ==========================================
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  const toastMsg = document.getElementById("toast-message");
  if (!toast) return;
  if (toastMsg) toastMsg.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("flex");

  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
    toast.classList.remove("flex");
  }, 2800);
}

// ==========================================
// TEST SUONERIA TIMER
// ==========================================
function testTimerSound() {
  playTimerBell();
  showToast("🔔 Suoneria del timer testata con successo!");
}

// ==========================================
// COPIA RICETTA FORMATTATA PER WHATSAPP / NOTE
// ==========================================
function copyRecipeToClipboard() {
  const recipe = (typeof RECIPES_DATA !== "undefined" ? RECIPES_DATA : []).find(r => r.id === AppState.selectedRecipeId) || (typeof RECIPES_DATA !== "undefined" ? RECIPES_DATA[0] : null);
  const oven = (typeof OVENS_DATA !== "undefined" ? OVENS_DATA : []).find(o => o.id === AppState.selectedOvenId);

  const numPanetti = document.getElementById("input-num-panetti")?.value || "4";
  const weightPanetto = document.getElementById("input-weight-panetto")?.value || "260";
  const totalWeight = document.getElementById("res-total-weight")?.textContent || "1040 g";
  const flour = document.getElementById("res-flour")?.textContent || "";
  const water = document.getElementById("res-water")?.textContent || "";
  const yeast = document.getElementById("res-yeast")?.textContent || "";
  const yeastType = document.getElementById("res-yeast-type-label")?.textContent || "Fresco";
  const salt = document.getElementById("res-salt")?.textContent || "";
  const hydration = document.getElementById("input-hydration")?.value || "65";
  const oil = document.getElementById("res-oil")?.textContent || "0 g";
  const sugar = document.getElementById("res-sugar")?.textContent || "0 g";
  const roomTemp = document.getElementById("input-room-temp")?.value || "21";
  const roomHours = document.getElementById("input-room-hours")?.value || "8";
  const fridgeHours = document.getElementById("input-fridge-hours")?.value || "0";

  const methodName = AppState.selectedMethod === "biga" ? `Biga (${AppState.prefermentPct}%)` : (AppState.selectedMethod === "poolish" ? `Poolish (${AppState.prefermentPct}%)` : "Diretto");

  let lines = [
    `🍕 *${recipe ? recipe.name.toUpperCase() : 'IMPASTO'}* - Scheda Calcolata`,
    `⚖️ Porzioni: ${numPanetti} panetti da ${weightPanetto}g (Totale ${totalWeight})`,
    `💧 Idratazione: ${hydration}% | Metodo: ${methodName}`,
    `⏳ Lievitazione: ${roomHours}h a T.A. (${roomTemp}°C) ${parseInt(fridgeHours) > 0 ? `+ ${fridgeHours}h in Frigo` : ''}`,
    ``,
    `📋 *DOSI TOTALI:*`,
    `• Farina: ${flour} ${recipe && recipe.flourRecommendation ? `(${recipe.flourRecommendation.type}, W ${recipe.flourRecommendation.w})` : ''}`,
    `• Acqua: ${water}`,
    `• Lievito: ${yeast} (${yeastType})`,
    `• Sale: ${salt}`
  ];

  if (parseFloat(oil) > 0) lines.push(`• Olio EVO: ${oil}`);
  if (parseFloat(sugar) > 0) lines.push(`• Zucchero/Malto: ${sugar}`);

  if (AppState.selectedMethod !== "direct") {
    const prefFlour = document.getElementById("breakdown-pref-flour")?.textContent;
    const prefWater = document.getElementById("breakdown-pref-water")?.textContent;
    const prefYeast = document.getElementById("breakdown-pref-yeast")?.textContent;
    const refFlour = document.getElementById("breakdown-ref-flour")?.textContent;
    const refWater = document.getElementById("breakdown-ref-water")?.textContent;
    const refSalt = document.getElementById("breakdown-ref-salt")?.textContent;

    lines.push(``);
    lines.push(`🥣 *FASE 1 - PRE-FERMENTO (${methodName}):*`);
    lines.push(`• Farina: ${prefFlour} | Acqua: ${prefWater} | Lievito: ${prefYeast}`);
    lines.push(`🥣 *FASE 2 - RINFRESCO:*`);
    lines.push(`• Farina: ${refFlour} | Acqua residua: ${refWater} | Sale: ${refSalt}`);
  }

  if (oven) {
    lines.push(``);
    lines.push(`🔥 Cottura suggerita: ${oven.name} (${oven.maxTemp})`);
  }

  lines.push(``);
  lines.push(`👨‍🍳 *Teoria del Maestro* • Maestro degli Impasti`);

  const textToCopy = lines.join("\n");

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(textToCopy)
      .then(() => showToast("Ricetta copiata negli appunti! 📋"))
      .catch(() => fallbackCopy(textToCopy));
  } else {
    fallbackCopy(textToCopy);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    showToast("Ricetta copiata negli appunti! 📋");
  } catch (err) {
    prompt("Copia la ricetta da qui:", text);
  }
  document.body.removeChild(ta);
}

// ==========================================
// STAMPA SCHEDA DA BANCO A4
// ==========================================
function printRecipeCard() {
  const recipe = (typeof RECIPES_DATA !== "undefined" ? RECIPES_DATA : []).find(r => r.id === AppState.selectedRecipeId) || (typeof RECIPES_DATA !== "undefined" ? RECIPES_DATA[0] : null);
  const oven = (typeof OVENS_DATA !== "undefined" ? OVENS_DATA : []).find(o => o.id === AppState.selectedOvenId);

  const numPanetti = document.getElementById("input-num-panetti")?.value || "4";
  const weightPanetto = document.getElementById("input-weight-panetto")?.value || "260";
  const totalWeight = document.getElementById("res-total-weight")?.textContent || "1040 g";
  const flour = document.getElementById("res-flour")?.textContent || "";
  const water = document.getElementById("res-water")?.textContent || "";
  const yeast = document.getElementById("res-yeast")?.textContent || "";
  const yeastType = document.getElementById("res-yeast-type-label")?.textContent || "Fresco";
  const salt = document.getElementById("res-salt")?.textContent || "";
  const hydration = document.getElementById("input-hydration")?.value || "65";
  const oil = document.getElementById("res-oil")?.textContent || "0 g";
  const sugar = document.getElementById("res-sugar")?.textContent || "0 g";
  const roomTemp = document.getElementById("input-room-temp")?.value || "21";
  const roomHours = document.getElementById("input-room-hours")?.value || "8";
  const fridgeHours = document.getElementById("input-fridge-hours")?.value || "0";
  const saltPct = document.getElementById("input-salt-pct")?.value || "2.5";
  const oilPct = document.getElementById("input-oil-pct")?.value || "0";
  const today = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const methodName = AppState.selectedMethod === "biga" ? `Biga (${AppState.prefermentPct}%)` : (AppState.selectedMethod === "poolish" ? `Poolish (${AppState.prefermentPct}%)` : "Diretto");

  let prefermentHtml = "";
  if (AppState.selectedMethod !== "direct") {
    const prefFlour = document.getElementById("breakdown-pref-flour")?.textContent;
    const prefWater = document.getElementById("breakdown-pref-water")?.textContent;
    const prefYeast = document.getElementById("breakdown-pref-yeast")?.textContent;
    const refFlour = document.getElementById("breakdown-ref-flour")?.textContent;
    const refWater = document.getElementById("breakdown-ref-water")?.textContent;
    const refSalt = document.getElementById("breakdown-ref-salt")?.textContent;
    const refOil = document.getElementById("breakdown-ref-oil")?.textContent;

    prefermentHtml = `
      <div style="margin-top: 14px; border: 1px solid #222; padding: 10px; border-radius: 6px; background: #fafafa;">
        <h4 style="margin: 0 0 6px 0; font-size: 13px; text-transform: uppercase; font-weight: 800;">Scomposizione ${methodName}</h4>
        <div style="display: flex; justify-content: space-between; gap: 15px; font-size: 12px;">
          <div style="flex: 1; border-right: 1px dashed #888; padding-right: 10px;">
            <strong>Fase 1: Pre-fermento</strong><br>
            • Farina: <strong>${prefFlour}</strong><br>
            • Acqua: <strong>${prefWater}</strong><br>
            • Lievito: <strong>${prefYeast}</strong>
          </div>
          <div style="flex: 1;">
            <strong>Fase 2: Rinfresco / Chiusura</strong><br>
            • Farina: <strong>${refFlour}</strong><br>
            • Acqua residua: <strong>${refWater}</strong><br>
            • Sale: <strong>${refSalt}</strong>
            ${parseFloat(oil) > 0 ? `<br>• Olio: <strong>${refOil}</strong>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  const printSheet = document.getElementById("print-sheet");
  if (!printSheet) return;

  printSheet.innerHTML = `
    <div style="border: 2px solid #000; padding: 22px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #000; background: #fff; max-width: 750px; margin: 0 auto;">
      
      <!-- Intestazione -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 12px;">
        <div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;">Maestro degli Impasti</h1>
          <p style="margin: 3px 0 0 0; font-size: 12px; color: #333;">Scheda Tecnica di Produzione da Banco • Teoria del Maestro</p>
        </div>
        <div style="text-align: right; font-size: 11px;">
          <div>Data: <strong>${today}</strong></div>
          <div>Metodo: <strong>${methodName}</strong></div>
        </div>
      </div>

      <!-- Info Ricetta Principale -->
      <div style="margin: 14px 0; padding: 12px; background: #f4f4f4; border: 1px solid #ccc; display: flex; justify-content: space-between; align-items: center; border-radius: 6px;">
        <div>
          <h2 style="margin: 0; font-size: 18px; font-weight: 800;">${recipe ? recipe.name : 'Impasto'}</h2>
          <span style="font-size: 12px; color: #444;">${recipe ? recipe.tagline : ''}</span>
        </div>
        <div style="text-align: right; font-size: 13px;">
          <strong>${numPanetti} panetti</strong> da <strong>${weightPanetto} g</strong><br>
          <span style="font-size: 11px; color: #555;">Peso Totale: <strong>${totalWeight}</strong></span>
        </div>
      </div>

      <!-- Parametri Fondamentali -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; text-align: center;">
        <div style="border: 1px solid #000; padding: 8px; border-radius: 4px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #444;">Idratazione</div>
          <div style="font-size: 17px; font-weight: 900;">${hydration}%</div>
        </div>
        <div style="border: 1px solid #000; padding: 8px; border-radius: 4px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #444;">Temp. Ambiente</div>
          <div style="font-size: 17px; font-weight: 900;">${roomTemp}°C</div>
        </div>
        <div style="border: 1px solid #000; padding: 8px; border-radius: 4px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #444;">Tempo T.A.</div>
          <div style="font-size: 17px; font-weight: 900;">${roomHours} h</div>
        </div>
        <div style="border: 1px solid #000; padding: 8px; border-radius: 4px;">
          <div style="font-size: 10px; text-transform: uppercase; color: #444;">Tempo Frigo</div>
          <div style="font-size: 17px; font-weight: 900;">${fridgeHours} h</div>
        </div>
      </div>

      <!-- Tabella Ingredienti del Fornaio -->
      <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12.5px;">
        <thead>
          <tr style="background: #000; color: #fff;">
            <th style="padding: 7px 10px; text-align: left;">Ingrediente</th>
            <th style="padding: 7px 10px; text-align: right;">% Fornaio</th>
            <th style="padding: 7px 10px; text-align: right;">Peso Reale</th>
            <th style="padding: 7px 10px; text-align: left;">Specifiche & Note</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 7px 10px; font-weight: bold;">🌾 Farina</td>
            <td style="padding: 7px 10px; text-align: right;">100%</td>
            <td style="padding: 7px 10px; text-align: right; font-weight: 900; font-size: 14px;">${flour}</td>
            <td style="padding: 7px 10px; font-size: 11px;">${recipe && recipe.flourRecommendation ? `${recipe.flourRecommendation.type} (W ${recipe.flourRecommendation.w}, Prot. ${recipe.flourRecommendation.protein})` : ''}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 7px 10px; font-weight: bold;">💧 Acqua</td>
            <td style="padding: 7px 10px; text-align: right;">${hydration}%</td>
            <td style="padding: 7px 10px; text-align: right; font-weight: 900; font-size: 14px;">${water}</td>
            <td style="padding: 7px 10px; font-size: 11px;">Temp. consigliata ~16-18°C</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 7px 10px; font-weight: bold;">✨ Lievito (${yeastType})</td>
            <td style="padding: 7px 10px; text-align: right;">-</td>
            <td style="padding: 7px 10px; text-align: right; font-weight: 900; font-size: 14px;">${yeast}</td>
            <td style="padding: 7px 10px; font-size: 11px;">Fermentazione controllata</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 7px 10px; font-weight: bold;">🧂 Sale Marino</td>
            <td style="padding: 7px 10px; text-align: right;">${saltPct}%</td>
            <td style="padding: 7px 10px; text-align: right; font-weight: 900; font-size: 14px;">${salt}</td>
            <td style="padding: 7px 10px; font-size: 11px;">Aggiungere a metà impasto</td>
          </tr>
          ${parseFloat(oil) > 0 ? `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 7px 10px; font-weight: bold;">🫒 Olio Extravergine</td>
            <td style="padding: 7px 10px; text-align: right;">${oilPct}%</td>
            <td style="padding: 7px 10px; text-align: right; font-weight: 900; font-size: 14px;">${oil}</td>
            <td style="padding: 7px 10px; font-size: 11px;">A filo alla fine dell'incordatura</td>
          </tr>` : ''}
          ${parseFloat(sugar) > 0 ? `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 7px 10px; font-weight: bold;">🍯 Malto / Zucchero</td>
            <td style="padding: 7px 10px; text-align: right;">-</td>
            <td style="padding: 7px 10px; text-align: right; font-weight: 900; font-size: 14px;">${sugar}</td>
            <td style="padding: 7px 10px; font-size: 11px;">Nutrimento lieviti e doratura forno</td>
          </tr>` : ''}
        </tbody>
      </table>

      ${prefermentHtml}

      <!-- Cottura e Forno -->
      <div style="margin-top: 14px; border: 1px solid #222; padding: 10px; border-radius: 6px; font-size: 11.5px; background: #fff;">
        <strong>🔥 Indicazioni di Cottura (${oven ? oven.name : 'Forno'}):</strong>
        <div style="margin-top: 3px; color: #222; line-height: 1.4;">
          ${oven && oven.recipesAdvice && oven.recipesAdvice[recipe.id] ? (oven.recipesAdvice[recipe.id].tips || oven.adviceGeneral) : (oven ? oven.adviceGeneral : 'Preriscalda accuratamente il forno.')}
        </div>
      </div>

      <!-- Spazio Note del Pizzaiolo -->
      <div style="margin-top: 16px; border-top: 1px dashed #000; padding-top: 8px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase;">Note del Pizzaiolo (Scrivi qui):</div>
        <div style="height: 45px; border-bottom: 1px dotted #aaa; margin-top: 8px;"></div>
        <div style="height: 25px; border-bottom: 1px dotted #aaa;"></div>
      </div>

      <!-- Footer Stampa -->
      <div style="margin-top: 14px; text-align: center; font-size: 9.5px; color: #666; border-top: 1px solid #ccc; padding-top: 6px;">
        Maestro degli Impasti • Stampato da banco per uso professionale o casalingo • Calcolo scientifico Baker's Math
      </div>

    </div>
  `;

  window.print();
}

// Esportazione funzioni su window per accesso globale
window.syncFromSlider = syncFromSlider;
window.syncFromInput = syncFromInput;
window.copyRecipeToClipboard = copyRecipeToClipboard;
window.printRecipeCard = printRecipeCard;
window.testTimerSound = testTimerSound;
window.showToast = showToast;

