/**
 * Maestro degli Impasti - Pronto Soccorso Impasti (Troubleshooting)
 * Diagnostica scientifica dei problemi più comuni e rimedi della Teoria del Maestro
 */

const TROUBLESHOOTER_DATA = [
  {
    id: "appiccicoso_colla",
    category: "Lavorazione & Impasto",
    problem: "L'impasto sembra una colla informe e si attacca a mani e ciotola",
    severity: "Molto comune",
    icon: "alert-triangle",
    symptom: "L'impasto si lacera, non si stacca dalle dita e sembra liquido o viscido anche dopo aver impastato a lungo.",
    scientificCause: "Mancato sviluppo della maglia glutinica o temperatura dell'impasto salita sopra i 27°C, che scioglie i ponti disolfuro delle proteine. Spesso causato dall'aver aggiunto troppa acqua tutta insieme all'inizio invece che a filo.",
    quickFix: "NON aggiungere pugni di farina asciutta (sbilanceresti la ricetta!). Fai un 'riposo tecnico' di 10 minuti coprendo l'impasto con una ciotola rovesciata. Inumidisci le mani con acqua o un velo d'olio e fai 3 pieghe slap-and-fold. Il glutine si formerà spontaneamente per rilassamento.",
    prevention: "Nelle ricette con idratazione sopra il 65%, versa prima solo il 60% dell'acqua. Solo quando l'impasto è incordato e sodo, versa l'acqua rimanente a filo, un cucchiaio alla volta."
  },
  {
    id: "elastico_ritiro",
    category: "Stesura & Formatura",
    problem: "Quando allargo il panetto della pizza, torna indietro come un elastico",
    severity: "Comunissimo",
    icon: "move",
    symptom: "Allarghi il disco, ma si ritira immediatamente verso il centro, oppure se tiri si strappa creando buchi.",
    scientificCause: "Glutine troppo tenace o panetto ancora freddo di frigorifero. Il reticolo di glutina non ha completato la fase di rilassamento viscoso (appretto insufficiente).",
    quickFix: "Fermati immediatamente! Se continui a tirare romperai la maglia. Copri il panetto con la ciotola o una pellicola e aspetta 20-30 minuti a temperatura ambiente. Gli enzimi rilasseranno la tensione e si stenderà con la pressione di un dito.",
    prevention: "Non stendere mai impasti freddi di frigo. Tira fuori i panetti almeno 2-3 ore prima della cottura e rispetta i tempi di appretto consigliati dal calcolatore."
  },
  {
    id: "non_lievita",
    category: "Fermentazione",
    problem: "L'impasto non cresce: dopo 3 ore è ancora un mattone",
    severity: "Grave",
    icon: "clock",
    symptom: "Nessun aumento di volume, assenza di bolle d'aria visibili, impasto compatto e pesante.",
    scientificCause: "Lievito inibito o distrutto. Le cause tipiche: acqua usata sopra i 38°C (i lieviti muoiono a 45°C), contatto diretto prolungato tra sale puro e lievito prima dell'acqua, oppure ambiente troppo freddo (<18°C).",
    quickFix: "Crea una cella di lievitazione naturale: metti l'impasto nel forno SPENTO con la LUCE ACCESA (la lampadina genera una temperatura costante di 26-28°C ideale per riattivare i lieviti). Se dopo 1 ora non dà cenni, il lievito era morto: puoi usarlo come 'pasta di riporto' per un nuovo impasto unendo altro lievito attivo.",
    prevention: "Usa sempre acqua a temperatura ambiente (o fredda d'estate) e inserisci sempre il sale alla fine, mai a diretto contatto con il cubetto di lievito."
  },
  {
    id: "panetti_liquefatti",
    category: "Fermentazione",
    problem: "I panetti si sono spiaccicati e fusi insieme in una massa molle",
    severity: "Medio",
    icon: "layers",
    symptom: "I panetti hanno perso la forma sferica, sono piatti, pieni di bollicine fitte traslucide e quando provi a prenderli con la spatola si allungano come gomma liquida.",
    scientificCause: "Sovralievitazione e sovramaturazione. L'attività enzimatica ha degradato completamente il glutine (proteolisi) e i lieviti hanno terminato gli zuccheri fermentabili.",
    quickFix: "Raccogli delicatamente la massa con un tarocco unto. NON cercare di fare pizze tonde al volo. Versala direttamente in una teglia ben oliata, allargala delicatamente con le dita unte, metti pomodorini, origano e sale: trasformerai un fallimento in una splendida focaccia ad alta idratazione!",
    prevention: "Se la temperatura della tua cucina è elevata (>24°C), riduci la quantità di lievito del 30% usando il nostro calcolatore o sposta l'impasto in frigorifero a 4°C per frenare la fermentazione."
  },
  {
    id: "crosta_pallida_dura",
    category: "Cottura",
    problem: "La pizza esce dal forno bianca, pallida o secca come un biscotto",
    severity: "Comune nei forni di casa",
    icon: "sun",
    symptom: "Manca la doratura tipica, il cornicione non si gonfia ed è duro da masticare, sapore piatto.",
    scientificCause: "I forni domestici arrivano a 250°C (contro i 450°C del forno a legna o fornetto). Senza abbastanza zuccheri o grassi, a 250°C la reazione di Maillard (doratura) è lentissima e la pizza si disidrata prima di colorire.",
    quickFix: "Per cuocere pizze tonde nel forno di casa: preriscalda la teglia o una pietra refrattaria per almeno 45 minuti sul ripiano più alto, vicinissima al grill. Inforna con il grill al massimo per irradiare calore infernale dall'alto.",
    prevention: "Se usi il forno di casa standard, aggiungi all'impasto il 2-3% di olio extravergine d'oliva e mezzo cucchiaino di malto d'orzo o miele: doneranno doratura ambrata e manterranno la mollica morbida."
  },
  {
    id: "focaccia_secca",
    category: "Cottura",
    problem: "La focaccia è asciutta, dura e sembra una schiacciata biscottata",
    severity: "Comune",
    icon: "droplet",
    symptom: "Manca la sofficità umida interna, i buchi sono secchi e la superficie è friabile come un cracker.",
    scientificCause: "Cottura a temperatura troppo bassa e prolungata (asciuga tutta l'acqua), oppure mancata emulsione della salamoia prima dell'infornata.",
    quickFix: "Spennella subito la focaccia appena sfornata con un mix caldo di acqua tiepida e olio EVO e coprila per 5 minuti con un canovaccio pulito per intrappolare il vapore residuo.",
    prevention: "La salamoia nei fori è l'anima della vera focaccia ligure: versa un'emulsione abbondante di acqua e olio EVO prima di infornare, e cuoci sempre alla massima temperatura possibile (230-250°C)."
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { TROUBLESHOOTER_DATA };
}
