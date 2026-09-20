/**
 * Maestro degli Impasti - Gestore Memoria Locale (LocalStorage)
 * Salva ricette personalizzate, dosaggi preferiti e il Diario degli Impasti
 */

const DoughStorage = {
  STORAGE_KEY_RECIPES: "maestro_impasti_custom_recipes",
  STORAGE_KEY_JOURNAL: "maestro_impasti_journal",

  // Inizializza con un esempio se vuoto
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY_JOURNAL)) {
      const initialEntry = [
        {
          id: "journal_1",
          date: new Date().toLocaleDateString("it-IT"),
          recipeName: "Pizza Napoletana Verace",
          rating: 5,
          hydration: 65,
          notes: "Prima infornata riuscita benissimo! Cornicione alto, impasto morbido. Lasciato in frigo per 12h e poi 4h a temperatura ambiente."
        }
      ];
      localStorage.setItem(this.STORAGE_KEY_JOURNAL, JSON.stringify(initialEntry));
    }
  },

  // Recupera il diario degli impasti
  getJournal() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_JOURNAL);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Errore lettura diario:", e);
      return [];
    }
  },

  // Aggiunge una voce al diario
  addJournalEntry(entry) {
    const journal = this.getJournal();
    const newEntry = {
      id: "journal_" + Date.now(),
      date: new Date().toLocaleDateString("it-IT"),
      ...entry
    };
    journal.unshift(newEntry);
    localStorage.setItem(this.STORAGE_KEY_JOURNAL, JSON.stringify(journal));
    return newEntry;
  },

  // Cancella una voce
  deleteJournalEntry(id) {
    let journal = this.getJournal();
    journal = journal.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY_JOURNAL, JSON.stringify(journal));
    return journal;
  },

  // Salva ricetta personalizzata
  saveCustomRecipe(recipe) {
    try {
      const custom = this.getCustomRecipes();
      const newRecipe = {
        ...recipe,
        id: "custom_" + Date.now(),
        isCustom: true
      };
      custom.unshift(newRecipe);
      localStorage.setItem(this.STORAGE_KEY_RECIPES, JSON.stringify(custom));
      return newRecipe;
    } catch (e) {
      console.error("Errore salvataggio ricetta:", e);
      return null;
    }
  },

  getCustomRecipes() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY_RECIPES);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { DoughStorage };
}
