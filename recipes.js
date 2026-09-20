/**
 * Maestro degli Impasti - Database Ricette e Percorsi Didattici
 * Principi di Panificazione Scientifica (Baker's Math)
 */

const RECIPES_DATA = [
  {
    id: "pizza_classica",
    name: "Pizza Classica",
    category: "pizza",
    badge: "Tradizionale & Facile",
    tagline: "Stesura facilissima, fondo croccante e friabile, ideale per tutti i forni",
    difficulty: "Principiante",
    defaultDoughWeight: 240,
    defaultPieces: 4,
    defaultHydration: 60,
    defaultSalt: 2.5,
    defaultOil: 3.0,
    defaultTotalHours: 8,
    defaultRoomTemp: 21,
    defaultFridgeHours: 0,
    flourRecommendation: {
      type: "Farina Tipo 0 o 00 comune",
      w: "220 - 260 W",
      protein: "10.5 - 11.5% proteine",
      notes: "Puoi usare tranquillamente la normale farina da supermercato senza cercare farine forti."
    },
    bakersExplanation: "Con il 60% di idratazione e l'olio d'oliva, l'impasto non appiccica, si stende senza ritirarsi e cuoce croccante anche nel forno di casa.",
    steps: [
      {
        step: 1,
        title: "Impasto Diretto Rapido",
        durationMinutes: 15,
        hasTimer: false,
        instruction: "Sciogli il lievito nell'acqua a temperatura ambiente. Aggiungi la farina e inizia a impastare. Quando la farina è quasi tutta assorbita, aggiungi il sale e l'olio a filo. Lavora finché il panetto è liscio e compatto (circa 8-10 minuti).",
        whyItWorks: "Con il 60% di idratazione il glutine si forma facilmente senza bisogno di autolisi o tecniche complesse."
      },
      {
        step: 2,
        title: "Riposo e Puntata",
        durationMinutes: 120,
        hasTimer: true,
        instruction: "Poni la massa in una ciotola leggermente unta d'olio, copri con pellicola o coperchio e lascia lievitare per circa 2 ore a temperatura ambiente finché non raddoppia di volume.",
        whyItWorks: "Il lievito sviluppa volume e rende la maglia elastica e morbida."
      },
      {
        step: 3,
        title: "Staglio e Formatura Panetti",
        durationMinutes: 10,
        hasTimer: false,
        instruction: "Dividi l'impasto in 4 panetti da circa 240g ciascuno. Arrotondali sul banco con le mani a coppa per formare delle palline lisce. Adagiale su un vassoio spolverato di farina e copri ermeticamente.",
        whyItWorks: "La formatura compatta la maglia; il successivo riposo la rilasserà per una stesura senza resistenza."
      },
      {
        step: 4,
        title: "Appretto Finale",
        durationMinutes: 180,
        hasTimer: true,
        instruction: "Lascia riposare i panetti coperti per 3-4 ore a temperatura ambiente prima della stesura.",
        whyItWorks: "Il glutine perde la rigidità e diventa docile: potrai allargare il disco anche a mattarello se desideri una pizza sottile e scrocchiarella."
      },
      {
        step: 5,
        title: "Stesura e Condimento",
        durationMinutes: 5,
        hasTimer: false,
        instruction: "Stendi con le mani o con il mattarello su piano infarinato fino a uno spessore uniforme di circa 3-4 mm. Condisci con pomodoro, mozzarella ben strizzata e un filo d'olio.",
        whyItWorks: "La percentuale moderata di acqua permette una stesura sottile senza buchi."
      },
      {
        step: 6,
        title: "Cottura Croccante",
        durationMinutes: 7,
        hasTimer: true,
        instruction: "Forno al massimo (250°C statico). Inforna per circa 6-8 minuti su teglia rotonda o leccarda ben calda finché il fondo è dorato e la mozzarella fusa.",
        whyItWorks: "L'olio nell'impasto favorisce la reazione di Maillard anche alle temperature più basse dei forni domestici."
      }
    ]
  },
  {
    id: "pizza_napoletana",
    name: "Pizza Napoletana",
    category: "pizza",
    badge: "Classica & Contemporanea",
    tagline: "Cornicione alveolato, morbida, profumata e digeribile",
    difficulty: "Intermedio",
    defaultDoughWeight: 260, // peso singolo panetto in grammi
    defaultPieces: 4,
    defaultHydration: 65, // %
    defaultSalt: 2.8,     // % sulla farina
    defaultOil: 0,        // % (tradizionale 0, opzionale per forno di casa)
    defaultTotalHours: 16,
    defaultRoomTemp: 21,
    defaultFridgeHours: 8,
    flourRecommendation: {
      type: "Tipo 0 o 00 specifica per pizza",
      w: "280 - 320 W",
      protein: "12 - 13% proteine",
      notes: "Una farina con buon glutine permette lievitazioni di 16-24 ore senza collassare."
    },
    bakersExplanation: "Nella Napoletana l'idratazione al 65% è il perfetto equilibrio tra morbidezza al morso e facilità di stesura con farina W300.",
    steps: [
      {
        step: 1,
        title: "Miscelazione e Autolisi (Opzionale ma raccomandata)",
        durationMinutes: 30,
        hasTimer: true,
        instruction: "Sciogli tutta l'acqua con il 70% della farina. Mescola brevemente con una forchetta o spatola finché non ci sono parti asciutte. Copri e lascia riposare 30 minuti.",
        whyItWorks: "L'autolisi attiva gli enzimi (amilasi e proteasi) che spezzano le catene proteiche e gli amidi. Questo favorisce la formazione spontanea del glutine e rende l'impasto più estensibile senza surriscaldarlo."
      },
      {
        step: 2,
        title: "Chiusura dell'Impasto e Sale",
        durationMinutes: 15,
        hasTimer: false,
        instruction: "Aggiungi il lievito e la restante farina a pioggia. Impasta finché la farina non è assorbita, poi aggiungi il sale con le ultime gocce d'acqua. Lavora energicamente con movimenti di spinta e ripiegamento finché la superficie non diventa liscia.",
        whyItWorks: "Il sale rinforza la maglia glutinica e regola la fermentazione. Va messo verso la fine per non disidratare direttamente le cellule del lievito."
      },
      {
        step: 3,
        title: "Pieghe di Rinforzo & Riposo (Puntata)",
        durationMinutes: 45,
        hasTimer: true,
        instruction: "Fai 2 o 3 serie di pieghe a portafoglio (slap and fold sul banco) a distanza di 15-20 minuti l'una dall'altra. Poi ungi leggermente una ciotola, metti l'impasto a riposare coperto a temperatura ambiente o trasferiscilo in frigo per la maturazione.",
        whyItWorks: "Le pieghe intrappolano ossigeno e allineano le fibre di glutine (gluteneina e gliadina), dando struttura all'impasto per trattenere l'anidride carbonica dei gas di fermentazione."
      },
      {
        step: 4,
        title: "Staglio (Formatura dei Panetti)",
        durationMinutes: 10,
        hasTimer: false,
        instruction: "Rovescia l'impasto sul piano. Taglia porzioni da 260g (per pizze tonde da 30-32cm). Pirlata ogni porzione chiudendo la base sul banco ruotandola tra i palmi per formare una sfera liscia e ben tesa.",
        whyItWorks: "La pirlatura conferisce tensione superficiale alla pallina. Senza tensione, il panetto si allargherebbe piatto anziché gonfiarsi armoniosamente verso l'alto."
      },
      {
        step: 5,
        title: "Appretto (Seconda Lievitazione)",
        durationMinutes: 240, // 4 ore standard a temperatura ambiente
        hasTimer: true,
        instruction: "Metti i panetti in una cassetta di lievitazione o su un vassoio coperto con coperchio ermetico o pellicola trasparente a temperatura ambiente (circa 20-22°C) per 4-6 ore, finché non sono raddoppiati e soffici al tocco.",
        whyItWorks: "Durante l'appretto il glutine precedentemente teso si rilassa (rilassamento viscoso) mentre il lievito produce anidride carbonica. Il panetto diventa estendibile senza ritirarsi come un elastico."
      },
      {
        step: 6,
        title: "Stesura e Condimento",
        durationMinutes: 5,
        hasTimer: false,
        instruction: "Immergi il panetto in abbondante semola rimacinata. Stendi partendo dal centro e spingendo l'aria verso il cornicione con i polpastrelli uniti. Non toccare mai il cornicione per non schiacciare gli alveoli! Condisci con pomodoro San Marzano schiacciato e fiordilatte ben asciugato.",
        whyItWorks: "La semola evita che la pizza si incolli alla pala e conferisce fragranza senza bruciare come farebbe la farina bianca."
      },
      {
        step: 7,
        title: "Cottura ad Alta Temperatura",
        durationMinutes: 5,
        hasTimer: true,
        instruction: "Forno a legna o fornetto elettrico dedicato a 450°C: 60-90 secondi. In forno di casa: preriscalda al massimo (250-275°C) con pietra refrattaria o teglia ribaltata sul ripiano più alto per 40 minuti; cuoci per circa 4-5 minuti sotto il grill.",
        whyItWorks: "La spinta termica istantanea vaporizza l'acqua nell'impasto, gonfiando le bolle d'aria prima che la crosta si indurisca (fenomeno dell'oven spring)."
      }
    ]
  },
  {
    id: "pizza_teglia_romana",
    name: "Pizza in Teglia ad Alta Idratazione",
    category: "pizza",
    badge: "Super Croccante & Leggera",
    tagline: "Fondo croccante 'scrocchiarello', alveolatura ad uovo di piccione, idratazione 75-80%",
    difficulty: "Avanzato",
    defaultDoughWeight: 600, // per teglia standard 30x40cm
    defaultPieces: 1,
    defaultHydration: 78,
    defaultSalt: 2.5,
    defaultOil: 2.5, // olio evo nell'impasto per friabilità
    defaultTotalHours: 24,
    defaultRoomTemp: 20,
    defaultFridgeHours: 20,
    flourRecommendation: {
      type: "Farina Forte Tipo 0 / Manitoba",
      w: "320 - 360 W",
      protein: "13.5 - 14.5% proteine",
      notes: "L'alta idratazione (>75%) richiede farine forti capaci di assorbire e trattenere grandi quantità di acqua."
    },
    bakersExplanation: "Con il 78% di idratazione, l'olio d'oliva aiuta a emulsionare la maglia glutinica donando friabilità e facilitando la doratura nel forno domestico.",
    steps: [
      {
        step: 1,
        title: "Impasto Freddo e Inserimento Acqua in 2 Tempi",
        durationMinutes: 20,
        hasTimer: false,
        instruction: "Usa acqua fredda di frigo (4°C). Mescola tutta la farina con il 60% dell'acqua e il lievito. Solo quando l'impasto ha formato una struttura compatta (incordatura), inizia ad aggiungere la restante acqua a filo, pochissimo alla volta, facendola assorbire completamente prima di versarne altra. Inserisci sale e infine l'olio a filo.",
        whyItWorks: "Aggiungere l'acqua gradualmente (in 'bocche') permette al glutine di svilupparsi prima, altrimenti una grande quantità d'acqua iniziale 'annegherebbe' le proteine impedendo l'incordatura."
      },
      {
        step: 2,
        title: "Pieghe Coil Fold o a Portafoglio",
        durationMinutes: 60,
        hasTimer: true,
        instruction: "Fai 3 giri di pieghe sul banco leggermente unto o direttamente nella ciotola con le mani umide a intervalli di 20 minuti. L'impasto da molliccio diventerà sodo, lucido e pieno di bolle superficiali.",
        whyItWorks: "Il coil fold (sollevamento centrale e ripiegamento su se stesso) rinforza l'impasto senza strappare la maglia glutinica fragile ricca di acqua."
      },
      {
        step: 3,
        title: "Maturazione Lunga in Frigo (24-48 ore)",
        durationMinutes: 1440, // 24h
        hasTimer: false,
        instruction: "Riponi l'impasto in un contenitore oliato con pareti dritte e coperchio, contrassegnando il livello iniziale. Lascia in frigorifero a 4°C per 24 o 48 ore.",
        whyItWorks: "Al freddo l'azione del lievito è rallentata, mentre gli enzimi continuano a digerire amidi e proteine in composti semplici. Risultato: digeribilità massima, profumi complessi e alveolatura spettacolare."
      },
      {
        step: 4,
        title: "Formatura e Appretto a Temperatura Ambiente",
        durationMinutes: 180, // 3 ore
        hasTimer: true,
        instruction: "Tira fuori dal frigo, forma il panetto rettangolare senza sgonfiarlo troppo e lascialo a temperatura ambiente per 3-4 ore a completare la lievitazione in una vaschetta unta.",
        whyItWorks: "L'impasto deve tornare a temperatura ambiente (circa 18-20°C a cuore) prima della stesura, altrimenti il glutine rigido e freddo non si estenderà uniformemente."
      },
      {
        step: 5,
        title: "Stesura a Polpastrello 'Roman Style'",
        durationMinutes: 5,
        hasTimer: false,
        instruction: "Cospargi il banco con abbondante semola rimacinata. Rovescia delicatamente l'impasto. Con la punta delle dita partendo dal fondo verso l'alto, schiaccia creando delle fossette ritmiche per distribuire l'aria in modo omogeneo senza espellerla. Trasferisci in teglia di ferro blu o alluminio unta con un filo d'olio.",
        whyItWorks: "La pressione ritmata a dita piatte distribuisce i gas nelle cellule d'aria (alveoli) senza rompere le pareti interne."
      },
      {
        step: 6,
        title: "Cottura a Doppio Stadio",
        durationMinutes: 15,
        hasTimer: true,
        instruction: "Forno al massimo (250°C statico). Primi 8-10 minuti a contatto con la base del forno (per fare la crosta dorata sotto e dare spinta verticale). Poi trasferisci a metà altezza per altri 6-8 minuti per completare la cottura e asciugare l'umidità interna.",
        whyItWorks: "Il contatto diretto col fondo del forno trasmette calore per conduzione immediata, facendo 'esplodere' la pizza in altezza prima che evapori l'acqua."
      }
    ]
  },
  {
    id: "focaccia_ligure",
    name: "Focaccia Ligure / Genovese",
    category: "focaccia",
    badge: "Morbida Dentro, Croccante Fuori",
    tagline: "I tipici buchi dorati pieni di salamoia saporita di acqua, olio EVO e sale grosso",
    difficulty: "Principiante",
    defaultDoughWeight: 550, // per teglia 30x40cm
    defaultPieces: 1,
    defaultHydration: 68,
    defaultSalt: 2.5,
    defaultOil: 5.0, // olio evo nell'impasto
    defaultTotalHours: 5,
    defaultRoomTemp: 22,
    defaultFridgeHours: 0,
    flourRecommendation: {
      type: "Farina Tipo 0 o 00 di media forza",
      w: "240 - 270 W",
      protein: "11.5 - 12.5% proteine",
      notes: "Una farina di media forza consente una lievitazione rapida in giornata mantenendo morbidezza."
    },
    bakersExplanation: "La focaccia genovese richiede generose dosi di olio extravergine d'oliva e una salamoia (emulsione di acqua, olio e sale) che riempie le fossette durante la cottura.",
    steps: [
      {
        step: 1,
        title: "Impasto Morbido e Idratato",
        durationMinutes: 15,
        hasTimer: false,
        instruction: "Sciogli il lievito nell'acqua tiepida (24°C) con un cucchiaino di malto o miele. Aggiungi la farina e mescola. Unisci il sale e metà dell'olio evo previsto per l'impasto. Lavora finché l'impasto è morbido e setoso.",
        whyItWorks: "Il malto o lo zucchero fornisce nutrimento immediato al lievito e favorisce la tipica doratura ambrata in cottura."
      },
      {
        step: 2,
        title: "Prima Lievitazione in Teglia",
        durationMinutes: 45,
        hasTimer: true,
        instruction: "Ungi generosamente la teglia con olio extravergine. Adagia la massa al centro, rovesciala in modo che sia unta su entrambi i lati. Lascia riposare coperta per 30-45 minuti per far rilassare il glutine.",
        whyItWorks: "Il velo d'olio previene la formazione della pellicina secca e idrata l'esterno dell'impasto."
      },
      {
        step: 3,
        title: "Prima Stesura Dolce",
        durationMinutes: 5,
        hasTimer: false,
        instruction: "Con i polpastrelli allarga delicatamente l'impasto verso i bordi della teglia senza tirarlo violentemente. Se tende a ritirarsi, fermati, aspetta 10 minuti che il glutine si rilassi e poi finisci di coprire gli angoli.",
        whyItWorks: "Forzare un impasto quando il glutine è contratto ne causa lo strappo; attendere qualche minuto ne ripristina la plasticità."
      },
      {
        step: 4,
        title: "Le 'Fossette' Tipiche e la Salamoia Magica",
        durationMinutes: 60,
        hasTimer: true,
        instruction: "Spolvera la superficie con un pizzico di sale fino. Prepara la salamoia: emulsiona 40g di acqua tiepida con 30g di olio EVO e 5g di sale. Affonda decisamente le dita (a mano aperta) nell'impasto toccando il fondo della teglia per creare buchi profondi. Versa subito l'emulsione su tutta la superficie riempiendo i buchi. Lascia lievitare ancora 60-90 minuti.",
        whyItWorks: "La salamoia nei buchi impedisce che la focaccia si asciughi durante la cottura e crea quel contrasto irresistibile tra croccantezza esterna e cuore morbido."
      },
      {
        step: 5,
        title: "Cottura a Calore Forte e Vapore",
        durationMinutes: 15,
        hasTimer: true,
        instruction: "Inforna a 230°C statico per circa 15 minuti finché la superficie non è intensamente dorata e l'olio sfrigola nelle fossette. Appena sfornata, spennella ancora con un velo d'olio e servi calda.",
        whyItWorks: "L'emulsione acquosa sfrigola ad alta temperatura cuocendo l'impasto a vapore nelle cavità e per frittura dorata sui bordi rialzati."
      }
    ]
  },
  {
    id: "pane_casereccio",
    name: "Pane Casereccio a Crosta Spessa",
    category: "pane",
    badge: "Mollica Alveolata & Profumo Rustico",
    tagline: "Pagnotta contadina con farine semi-integrali, crosta scura e friabile",
    difficulty: "Intermedio",
    defaultDoughWeight: 850, // pagnotta singola
    defaultPieces: 1,
    defaultHydration: 70,
    defaultSalt: 2.0,
    defaultOil: 0,
    defaultTotalHours: 18,
    defaultRoomTemp: 20,
    defaultFridgeHours: 12,
    flourRecommendation: {
      type: "Mix Tipo 1 / Tipo 2 (70%) + Manitoba o Semola (30%)",
      w: "260 - 300 W",
      protein: "12.5 - 13.5% proteine",
      notes: "Le farine meno raffinate (Tipo 1 o 2) contengono più crusca e germe, conferendo aromi complessi e un colore ambrato."
    },
    bakersExplanation: "Il 2% di sale è lo standard aureo per il pane italiano: esalta il sapore del grano senza coprirlo e rafforza la tenuta della cupola durante il taglio e la cottura.",
    steps: [
      {
        step: 1,
        title: "Autolisi con Farine Rustiche",
        durationMinutes: 45,
        hasTimer: true,
        instruction: "Unisci tutta la farina con il 90% dell'acqua totale. Mescola fino a quando non c'è più farina asciutta. Copri e lascia riposare 45 minuti a temperatura ambiente.",
        whyItWorks: "La crusca presente nelle farine Tipo 1 e 2 assorbe acqua molto più lentamente rispetto all'amido; l'autolisi prolungata evita che la crusca 'rubi' acqua al glutine durante la lavorazione."
      },
      {
        step: 2,
        title: "Inserimento Lievito e Pieghe di Rinforzo",
        durationMinutes: 90,
        hasTimer: true,
        instruction: "Aggiungi il lievito (o licoli/lievito madre) e l'acqua restante. Lavora brevemente, unisci il sale e chiudi l'impasto. Esegui 3 serie di pieghe a tre (slap & fold o stretch & fold) ogni 30 minuti.",
        whyItWorks: "La piega a tre allunga e allinea le catene proteiche creando una tensione tridimensionale capace di sostenere la pagnotta in altezza."
      },
      {
        step: 3,
        title: "Formatura a Pagnotta (Batard o Boule) e Cestino",
        durationMinutes: 15,
        hasTimer: false,
        instruction: "Rovescia l'impasto, allargalo a rettangolo, piega i lati verso il centro e arrotola stringendo per formare una sfera tesa. Spolvera un cestino da lievitazione (banneton) con farina di riso e semola, adagia la pagnotta con la chiusura rivolta verso l'alto. Sigilla in un sacchetto e metti in frigo per 12-16 ore.",
        whyItWorks: "La farina di riso non contiene glutine e non assorbe umidità, impedendo che l'impasto si attacchi al cestino anche dopo molte ore in frigo."
      },
      {
        step: 4,
        title: "Il Taglio (Scoring) a Freddo",
        durationMinutes: 3,
        hasTimer: false,
        instruction: "Rovescia la pagnotta fredda direttamente su carta forno o sulla paletta. Con una lametta da barba inclinata a 45 gradi, pratica un taglio netto e deciso profondo circa 1 cm lungo tutta la lunghezza.",
        whyItWorks: "Il taglio direziona l'espansione dei gas in un punto controllato, permettendo la formazione della caratteristica 'orecchia' (ear) croccante."
      },
      {
        step: 5,
        title: "Cottura in Pentola di Ghisa (Dutch Oven)",
        durationMinutes: 45,
        hasTimer: true,
        instruction: "Preriscalda la pentola di ghisa con coperchio a 240°C per 40 minuti. Inserisci la pagnotta, chiudi col coperchio e cuoci per 20 minuti. Togli il coperchio, abbassa a 200°C e prosegui per altri 25 minuti per dorare la crosta.",
        whyItWorks: "La pentola chiusa intrappola il vapore rilasciato dall'impasto stesso. Il vapore mantiene morbida la crosta nei primi 20 minuti permettendo al pane di gonfiarsi al massimo prima di caramellare."
      }
    ]
  },
  {
    id: "focaccia_barese",
    name: "Focaccia Barese con Patata e Pomodorini",
    category: "focaccia",
    badge: "Fondo Frutto e Bordo Rustico",
    tagline: "Semola rimacinata, patata lessa nell'impasto, pomodorini schiacciati a mano e olive",
    difficulty: "Principiante",
    defaultDoughWeight: 650,
    defaultPieces: 1,
    defaultHydration: 75,
    defaultSalt: 2.5,
    defaultOil: 4.0,
    defaultTotalHours: 4,
    defaultRoomTemp: 22,
    defaultFridgeHours: 0,
    flourRecommendation: {
      type: "50% Semola Rimacinata di Grano Duro + 50% Farina 0 + Patata Lessa",
      w: "220 - 260 W",
      protein: "12% proteine",
      notes: "La semola regala sapore rustico e croccantezza alla base, mentre gli amidi della patata mantengono la mollica sofficissima per giorni."
    },
    bakersExplanation: "La patata lessa nell'impasto contiene amidi gelatinizzati che trattengono acqua impedendo il raffermamento, tipico segreto delle nonne pugliesi.",
    steps: [
      {
        step: 1,
        title: "Lesso della Patata e Impasto",
        durationMinutes: 30,
        hasTimer: false,
        instruction: "Lessa una patata media (circa 100g), sbucciala e schiacciala ancora calda. Lasciala intiepidire e uniscila alla farina e semola. Sciogli il lievito nell'acqua, impasta fino a creare un composto morbido ed elastico, unendo infine sale e olio.",
        whyItWorks: "La patata agisce come miglioratore naturale, aumentando l'estensibilità della semola rimacinata."
      },
      {
        step: 2,
        title: "Stesura con le Mani in Teglia di Ferro",
        durationMinutes: 10,
        hasTimer: false,
        instruction: "Versa abbondante olio sul fondo di una teglia rotonda (preferibilmente di ferro o alluminio pesante). Poni l'impasto e stendilo con le dita unte facendolo aderire fino ai bordi.",
        whyItWorks: "L'abbondante olio sul fondo frigge letteralmente la base in cottura, conferendole il caratteristico sapore tostato e croccante."
      },
      {
        step: 3,
        title: "Condimento 'Scattato' a Mano",
        durationMinutes: 10,
        hasTimer: false,
        instruction: "Prendi i pomodorini ciliegino o fiaschetto e rompili direttamente con le mani sopra l'impasto, lasciando cadere acqua di vegetazione e semi nelle fossette. Aggiungi olive baresi con nocciolo, origano abbondante, sale grosso e un ultimo generoso giro d'olio.",
        whyItWorks: "L'acqua del pomodoro penetra nelle cavità mantenendo il cuore umido mentre la buccia si caramella sopra."
      },
      {
        step: 4,
        title: "Cottura Focosa",
        durationMinutes: 25,
        hasTimer: true,
        instruction: "Inforna alla massima temperatura (250°C statico) sul piano più basso per i primi 15 minuti, poi sposta a metà altezza per altri 10 minuti finché i pomodorini sono abbrustoliti e il bordo è croccante.",
        whyItWorks: "Il calore dal basso è cruciale per dorare e tostare la semola intrisa d'olio sul fondo."
      }
    ]
  }
];

/**
 * Database dei Forni e Matrice di Compatibilità / Consigli di Cottura
 */
const OVENS_DATA = [
  {
    id: "home_standard",
    name: "Forno di Casa Classico",
    tagline: "Statico o ventilato standard (max 250°C - 275°C)",
    icon: "home",
    maxTemp: "250°C - 275°C",
    type: "domestico",
    adviceGeneral: "Il forno di casa cuoce per irraggiamento e convenzione più lenta. È perfetto per teglie, focacce e pane in pentola!",
    recipesAdvice: {
      pizza_napoletana: {
        compatible: false,
        warningLevel: "high",
        warningTitle: "Attenzione: La vera Napoletana non può cuocere a 250°C!",
        warningMessage: "La Pizza Napoletana Verace richiede 430°C - 480°C per sviluppare il cornicione in 60-90 secondi. Nel forno di casa a 250°C l'impasto impiega 5-7 minuti: l'acqua evapora lentamente e la pizza risulterà inevitabilmente biscottata, dura o gommosa.",
        suggestedRecipeId: "pizza_teglia_romana",
        suggestedRecipeName: "Pizza in Teglia ad Alta Idratazione (Teglia Romana)",
        suggestionText: "La Pizza in Teglia Romana è nata apposta per cuocere a 250°C: otterrai una base croccante 'scrocchiarello' e un interno sofficissimo e alveolato!",
        homeOvenHacks: [
          "Se vuoi fare comunque pizze tonde: aggiungi il 2.5% di Olio EVO e 1% di miele/malto nell'impasto per non far asciugare la pasta.",
          "Tecnica Padella + Grill: cuoci la base per 2 minuti in padella rovente sul fornello a gas, poi sposta subito sotto il grill del forno a massima potenza per 2 minuti.",
          "Preriscalda la leccarda capovolta o la pietra refrattaria per almeno 45 minuti sul ripiano più alto possibile."
        ]
      },
      pizza_teglia_romana: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "Forno Perfetto per la Teglia Romana!",
        warningMessage: "I 250°C del forno di casa sono ideali per la teglia ad alta idratazione.",
        tips: "Inforna i primi 8-10 minuti a contatto diretto con il fondo del forno (per fare il fondo croccante), poi sposta a metà altezza per asciugare l'interno."
      },
      focaccia_ligure: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "Eccellente per la Focaccia Ligure",
        warningMessage: "La salamoia di acqua e olio protegge l'impasto durante i 15 minuti di cottura a 230-250°C.",
        tips: "Usa modalità statica al massimo e versa salamoia abbondante nelle fossette."
      },
      focaccia_barese: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "Ideale per la Focaccia Barese",
        warningMessage: "L'abbondante olio nella teglia di ferro e i pomodorini garantiscono una frittura croccante del fondo anche a 250°C.",
        tips: "Piano basso del forno per i primi 15 minuti, poi sposta a metà altezza."
      },
      pane_casereccio: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "Ottimo con la tecnica della Pentola (Dutch Oven)",
        warningMessage: "Nel forno di casa a 240°C, la pentola di ghisa con coperchio riproduce il calore e il vapore di un forno professionale da panificio.",
        tips: "20 minuti a 240°C con coperchio chiuso, poi togli il coperchio e abbassa a 200°C per 20 minuti per dorare la crosta."
      },
      pizza_classica: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "La Regina del Forno di Casa!",
        warningMessage: "La Pizza Classica con il 60% di idro e il 3% di olio è nata appositamente per cuocere croccante e asciutta a 250°C.",
        tips: "Inforna a 250°C statico o ventilato per circa 6-8 minuti. Ottima anche stesa col mattarello se la ami sottile!"
      }
    }
  },
  {
    id: "electric_pizza",
    name: "Fornetto Elettrico Pizza",
    tagline: "G3 Ferrari, Spice Caliente, Effeuno P134H (400°C - 500°C)",
    icon: "zap",
    maxTemp: "400°C - 500°C",
    type: "specializzato",
    adviceGeneral: "Camera di cottura ribassata e resistenze potenti. Ideale per la pizza napoletana e tonde contemporanee in 90-120 secondi.",
    recipesAdvice: {
      pizza_napoletana: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "Forno Ideale per la Vera Napoletana!",
        warningMessage: "Questo fornetto raggiunge le temperature perfette (390-450°C) per l'effetto 'Oven Spring' immediato.",
        tips: "Preriscalda bene la pietra refrattaria o biscotto per 20-30 min. Se hai un fornetto a conchiglia (es. Ferrari), inforna quando la resistenza superiore è rovente (rossa) e ruota la pizza di 180° a metà cottura (dopo 60-75 secondi)."
      },
      pizza_classica: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "Ottima riuscita nel fornetto",
        warningMessage: "Imposta il fornetto a 350-380°C per una cottura uniforme e croccante in 2-3 minuti.",
        tips: "Non alzare oltre i 400°C per non bruciare l'olio nell'impasto."
      },
      pizza_teglia_romana: {
        compatible: true,
        warningLevel: "info",
        warningTitle: "Adatto per tegliette",
        warningMessage: "Se usi un fornetto a conchiglia rotondo puoi cuocere solo tegliette tonde; se hai un Effeuno puoi cuocere teglie 30x40cm impostando cielo a 300°C e platea a 250°C.",
        tips: "Evita di toccare la resistenza superiore con impasti molto gonfi."
      },
      focaccia_ligure: {
        compatible: true,
        warningLevel: "info",
        warningTitle: "Attenzione a non bruciare la salamoia",
        warningMessage: "Regola la temperatura a 260-280°C per evitare che l'olio bruci prima che l'impasto sia cotto all'interno.",
        tips: "Cottura rapida (8-10 minuti)."
      },
      focaccia_barese: {
        compatible: true,
        warningLevel: "info",
        warningTitle: "Ottima riuscita",
        warningMessage: "I pomodorini e le olive si abbrustoliranno a puntino.",
        tips: "Tieni d'occhio il cielo per non bruciare i pomodorini prima del fondo."
      },
      pane_casereccio: {
        compatible: false,
        warningLevel: "medium",
        warningTitle: "Camera troppo bassa per grandi pagnotte",
        warningMessage: "I fornetti a conchiglia hanno una camera di cottura bassa: una pagnotta da 800g toccando la resistenza brucerebbe subito.",
        suggestedRecipeId: "pizza_napoletana",
        suggestedRecipeName: "Pizza Napoletana Verace",
        suggestionText: "Sfrutta questo fornetto per dare il massimo sulla Pizza Napoletana o cuoci sfilatini/panini bassi.",
        tips: "Se hai un Effeuno con camera alta puoi cuocere il pane; altrimenti usa il forno di casa con pentola in ghisa!"
      }
    }
  },
  {
    id: "gas_portable",
    name: "Forno a Gas per Pizza",
    tagline: "Ooni Koda, Roccbox, Munaciello, Gozney (450°C - 500°C)",
    icon: "flame",
    maxTemp: "450°C - 500°C",
    type: "specializzato",
    adviceGeneral: "Fiamma viva a gas, pietra refrattaria spessa e calore violento. È la regina della pizza napoletana moderna!",
    recipesAdvice: {
      pizza_napoletana: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "Il Regno della Pizza Napoletana!",
        warningMessage: "Con 450°C sulla pietra e fiamma viva a rotolamento, la tua pizza cuocerà in 60-80 secondi con cornicione a canotto.",
        tips: "TRUCCO DEL MAESTRO ESSENZIALE: Preriscalda a fiamma massima per 20-25 min (pietra a 420-440°C). Appena inforni la pizza, ABBASSA LA FIAMMA AL MINIMO! Questo permette al fondo di cuocere senza carbonizzare il cornicione vicino alla fiamma. Ruota la pizza di 90° ogni 20 secondi con un palino."
      },
      pizza_classica: {
        compatible: true,
        warningLevel: "info",
        warningTitle: "Attenzione alla fiamma",
        warningMessage: "Contenendo olio, cuoci a fiamma moderata (350°C) per non bruciare il fondo.",
        tips: "Tieni la fiamma al minimo per una cottura più asciutta e biscottata."
      },
      pizza_teglia_romana: {
        compatible: false,
        warningLevel: "medium",
        warningTitle: "Non adatto a teglie grandi ad alta idratazione",
        warningMessage: "Il calore a gas dall'alto brucerebbe i condimenti prima che l'impasto spesso della teglia si asciughi.",
        suggestedRecipeId: "pizza_napoletana",
        suggestedRecipeName: "Pizza Napoletana Verace",
        suggestionText: "Con questo forno la Pizza Napoletana o la Tonda Romana scrocchiarella sono la scelta regina.",
        tips: "Per la teglia usa sempre il normale forno di casa a 250°C."
      },
      focaccia_ligure: {
        compatible: false,
        warningLevel: "medium",
        warningTitle: "Rischio fiammata con l'olio della salamoia",
        warningMessage: "L'olio abbondante vicino alla fiamma viva del gas può generare fiammate pericolose.",
        tips: "Meglio cuocere la focaccia nel forno di casa a 240°C."
      },
      focaccia_barese: {
        compatible: false,
        warningLevel: "medium",
        warningTitle: "Meglio il forno tradizionale",
        warningMessage: "La focaccia barese richiede tempo per cuocere la patata e la semola senza bruciare i pomodori.",
        tips: "Usa il forno tradizionale sul ripiano inferiore."
      },
      pane_casereccio: {
        compatible: false,
        warningLevel: "high",
        warningTitle: "Non adatto a pagnotte",
        warningMessage: "I forni a gas portatili sono aperti frontalmente e disperdono il vapore necessario per la crosta del pane.",
        tips: "Usa il forno di casa con pentola in ghisa (Dutch Oven)."
      }
    }
  },
  {
    id: "wood_fired",
    name: "Forno a Legna Tradizionale",
    tagline: "Volta refrattaria, legna di faggio/quercia (450°C - 500°C)",
    icon: "trees",
    maxTemp: "450°C - 500°C",
    type: "professionale",
    adviceGeneral: "Il massimo della tradizione. Calore per irraggiamento dalla cupola, conduzione dalla platea e convezione della fiamma viva.",
    recipesAdvice: {
      pizza_napoletana: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "La Tradizione Pura della Vera Pizza Napoletana",
        warningMessage: "Temperatura platea 430°C, fiamma viva sul lato sinistro. Cottura da disciplinare in 60-90 secondi.",
        tips: "Mantieni la fiamma viva chiara e priva di fumo con legna stagionata (faggio o rovere). Spazza la cenere prima di infornare. Alza la pizza sulla pala verso la volta negli ultimi 5 secondi per una doratura perfetta (il 'bacio del forno')."
      },
      pizza_classica: {
        compatible: true,
        warningLevel: "info",
        warningTitle: "Tradizionale",
        warningMessage: "Cuoci con forno non troppo violento (360-380°C).",
        tips: "Gira la pizza a metà cottura."
      },
      pizza_teglia_romana: {
        compatible: false,
        warningLevel: "info",
        warningTitle: "Possibile solo a calore discendente",
        warningMessage: "Puoi cuocere teglie solo quando il forno scende a 280°C senza fiamma viva.",
        tips: "Sposta la brace indietro e usa teglie in ferro pesante."
      },
      focaccia_ligure: {
        compatible: true,
        warningLevel: "info",
        warningTitle: "Ottima a forno moderato (250°C - 280°C)",
        warningMessage: "Cuocere solo a fuoco spento e brace coperta per non bruciare la salamoia.",
        tips: "Chiudi la bocca del forno se hai uno sportello per trattenere l'umidità."
      },
      focaccia_barese: {
        compatible: true,
        warningLevel: "info",
        warningTitle: "Deliziosa a calore dolce",
        warningMessage: "Il profumo della legna esalta l'origano e i pomodorini.",
        tips: "Cuoci lontano dalle braci vive."
      },
      pane_casereccio: {
        compatible: true,
        warningLevel: "none",
        warningTitle: "La Panificazione Antica a Calore Discendente",
        warningMessage: "Il pane si inforna a 'forno spento': si toglie la brace, si pulisce il piano e si infornano le pagnotte a 240°C chiudendo lo sportello.",
        tips: "La massa termica refrattaria rilascerà calore costante per 45-60 minuti creando una crosta spessa e dorata leggendaria."
      }
    }
  }
];

/**
 * Database Metodi di Impasto (Diretto, Biga, Poolish)
 */
const DOUGH_METHODS = {
  direct: {
    id: "direct",
    name: "Impasto Diretto",
    tagline: "Il metodo classico in un solo passaggio",
    badge: "Consigliato ai principianti",
    difficulty: "Facile",
    icon: "zap",
    shortDesc: "Tutti gli ingredienti vengono uniti direttamente nella ciotola. Zero preparazioni il giorno prima, processo lineare, veloce e sicuro.",
    whatYouGet: "Impasto equilibrato, gustoso e affidabile. È la scelta migliore per iniziare senza impazzire con pre-fermenti e fermentazioni a due stadi.",
    proTip: "Ideale se hai poco tempo o vuoi impastare la mattina per la sera.",
    defaultPrefermentPct: 0
  },
  biga: {
    id: "biga",
    name: "Con Biga (Pre-fermento Solido)",
    tagline: "Pre-impasto asciutto fermentato 16-24 ore",
    badge: "Il segreto dei maestri pizzaioli",
    difficulty: "Esperto",
    icon: "layers",
    shortDesc: "Si prepara una miscela grezza e asciutta (farina + 45% acqua + 1% lievito fresco, senza impastare troppo). Si fa maturare a 16-18°C per 16-24 ore e poi si 'chiude' l'impasto aggiungendo la restante acqua, sale e aromi.",
    whatYouGet: "Cornicione esplosivo 'a canotto' con alveoli giganti, profumo antico e tostato, croccantezza esterna incredibile e grandissima conservabilità.",
    proTip: "La biga NON va impastata a lungo: la farina deve solo assorbire l'acqua senza formare glutine (deve sembrare uno sfarinato grezzo).",
    defaultPrefermentPct: 50, // 50% di farina nella biga
    bigaHydration: 45,        // 45% acqua sulla farina della biga
    bigaYeastPct: 1.0         // 1% lievito fresco sulla farina della biga
  },
  poolish: {
    id: "poolish",
    name: "Con Poolish (Pre-fermento Liquido)",
    tagline: "Pre-impasto liquido ad alta idratazione (100%)",
    badge: "Scioglievolezza estrema al morso",
    difficulty: "Intermedio",
    icon: "droplets",
    shortDesc: "Si uniscono in parti uguali farina e acqua (100% idro) con pochissimo lievito. Si lascia fermentare finché è pieno di bolle e leggermente cedevole al centro prima del rinfresco finale.",
    whatYouGet: "Cornicione leggerissimo e soffice come una nuvola, scioglievolezza assoluta (la pizza non 'gomma' mai sotto i denti), sapore dolce e profumi lattici delicati.",
    proTip: "Il poolish è pronto quando la superficie è colma di bolle e il centro inizia appena a cedere (picco di fermentazione).",
    defaultPrefermentPct: 30, // 30% farina nel poolish
    poolishHydration: 100,    // 100% acqua sulla farina del poolish
    poolishYeastPct: 0.3      // 0.3% lievito fresco
  }
};

// Esporta per compatibilità browser e Node
if (typeof module !== "undefined" && module.exports) {
  module.exports = { RECIPES_DATA, OVENS_DATA, DOUGH_METHODS };
}

