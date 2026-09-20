/**
 * Maestro degli Impasti - Motore di Calcolo "Baker's Math" (Percentuali del Panettiere)
 * Calibrazione scientifica per idratazione, sale, olio e lieviti (fresco, secco, madre, licoli)
 */

const DoughCalculator = {
  // Tipi di lievito supportati
  YEAST_TYPES: {
    FRESH: "fresh",           // Lievito di birra fresco (cubetto)
    DRY: "dry",               // Lievito di birra secco istantaneo / attivo
    SOURDOUGH_SOLID: "solid", // Pasta madre solida (50% idratazione)
    LICOLI: "licoli"          // Lievito naturale liquido (100% idratazione)
  },

  /**
   * Calcola la quantità di lievito di birra fresco raccomandata in % sulla farina
   * Formula basata sulla curva di Arrhenius per la fermentazione di Saccharomyces cerevisiae
   * 
   * @param {number} roomHours - Ore a temperatura ambiente
   * @param {number} fridgeHours - Ore in frigorifero (4°C)
   * @param {number} tempC - Temperatura ambiente in gradi Celsius
   * @returns {number} percentuale di lievito fresco sulla farina
   */
  calculateFreshYeastPercentage(roomHours, fridgeHours, tempC) {
    // Normalizziamo le ore: 1 ora di frigo a 4°C equivale a circa 0.10 ore a temp ambiente
    const effectiveHours = Math.max(roomHours + (fridgeHours * 0.10), 1.0);
    
    // Riferimento standard: a 20°C per 8 ore di lievitazione serve circa lo 0.20% di lievito fresco (2g per 1kg)
    // Coeff di temperatura: raddoppia o dimezza ogni ~7-8°C
    const tempFactor = Math.pow(1.08, 20 - tempC);
    
    // Calcolo percentuale base
    let yeastPct = (1.6 / effectiveHours) * tempFactor;

    // Limiti di sicurezza panificatoria (minimo 0.05%, massimo 2.5%)
    yeastPct = Math.min(Math.max(yeastPct, 0.05), 2.5);

    return yeastPct;
  },

  /**
   * Calcola la ricetta completa basata sulle Percentuali del Fornaio
   * 
   * @param {Object} params
   * @param {number} params.targetTotalWeight - Peso totale desiderato dell'impasto (in grammi)
   * @param {number} params.hydration - Percentuale di idratazione (es. 65%)
   * @param {number} params.salt - Percentuale di sale sulla farina (es. 2.8%)
   * @param {number} params.oil - Percentuale di grassi/olio sulla farina (es. 2.5%)
   * @param {number} params.sugar - Percentuale di zuccheri/malto sulla farina (default 0%)
   * @param {number} params.roomHours - Ore a temperatura ambiente
   * @param {number} params.fridgeHours - Ore in frigorifero (4°C)
   * @param {number} params.tempC - Temperatura ambiente
   * @param {string} params.yeastType - Tipo di lievito ('fresh', 'dry', 'solid', 'licoli')
   */
  calculate(params) {
    const {
      targetTotalWeight = 1000,
      hydration = 65,
      salt = 2.5,
      oil = 0,
      sugar = 0,
      roomHours = 8,
      fridgeHours = 0,
      tempC = 21,
      yeastType = "fresh"
    } = params;

    // Percentuale lievito di birra fresco base
    const freshYeastPct = this.calculateFreshYeastPercentage(roomHours, fridgeHours, tempC);

    let yeastPct = freshYeastPct;
    let sourdoughFlourDeduction = 0;
    let sourdoughWaterDeduction = 0;

    if (yeastType === this.YEAST_TYPES.DRY) {
      // 1g di lievito secco equivale a circa 3g o 3.2g di fresco
      yeastPct = freshYeastPct / 3.0;
    } else if (yeastType === this.YEAST_TYPES.SOURDOUGH_SOLID) {
      // Pasta madre solida: standard 15-20% sulla farina
      // Scala leggermente con le ore totali
      const totalHours = roomHours + (fridgeHours * 0.2);
      yeastPct = Math.max(12, Math.min(22, 18 - (totalHours * 0.3)));
    } else if (yeastType === this.YEAST_TYPES.LICOLI) {
      // Licoli (100% idratazione): standard 12-18% sulla farina
      const totalHours = roomHours + (fridgeHours * 0.2);
      yeastPct = Math.max(10, Math.min(20, 15 - (totalHours * 0.25)));
    }

    // Totale percentuale rispetto alla farina (Farina = 100%)
    // Nella panificazione scientifica: PesoTotale = Farina * (1 + H/100 + S/100 + O/100 + Z/100 + Y/100)
    const totalPercentageMultiplier = 1 + (hydration / 100) + (salt / 100) + (oil / 100) + (sugar / 100) + (yeastPct / 100);

    // Calcolo ingredienti esatti
    const flourGrams = Math.round((targetTotalWeight / totalPercentageMultiplier) * 10) / 10;
    const waterGrams = Math.round(((flourGrams * hydration) / 100) * 10) / 10;
    const saltGrams = Math.round(((flourGrams * salt) / 100) * 10) / 10;
    const oilGrams = Math.round(((flourGrams * oil) / 100) * 10) / 10;
    const sugarGrams = sugar > 0 ? Math.round(((flourGrams * sugar) / 100) * 10) / 10 : 0;
    
    // Grammi lievito con precisione al decimo di grammo
    let yeastGrams = Math.round(((flourGrams * yeastPct) / 100) * 10) / 10;
    if (yeastType === this.YEAST_TYPES.FRESH || yeastType === this.YEAST_TYPES.DRY) {
      // Per lievito di birra sotto i 5g, diamo precisione a 2 decimali per massima accuratezza casalinga
      yeastGrams = Math.round(((flourGrams * yeastPct) / 100) * 100) / 100;
      if (yeastGrams < 0.1) yeastGrams = 0.1;
    } else {
      yeastGrams = Math.round(yeastGrams);
    }

    // Note scientifiche sul lievito madre se selezionato
    let sourdoughAdvice = "";
    if (yeastType === this.YEAST_TYPES.SOURDOUGH_SOLID) {
      const pmFlour = Math.round((yeastGrams * 2) / 3);
      const pmWater = Math.round(yeastGrams / 3);
      sourdoughAdvice = `La pasta madre solida contiene già circa ${pmFlour}g di farina e ${pmWater}g di acqua. Rinfrescala 3-4 ore prima dell'uso al raddoppio.`;
    } else if (yeastType === this.YEAST_TYPES.LICOLI) {
      const licoliHalf = Math.round(yeastGrams / 2);
      sourdoughAdvice = `Il Licoli contiene circa ${licoliHalf}g di farina e ${licoliHalf}g di acqua. Usalo al picco massimo di attività dopo il rinfresco.`;
    }

    const actualTotalWeight = Math.round((flourGrams + waterGrams + saltGrams + oilGrams + sugarGrams + yeastGrams) * 10) / 10;

    return {
      flour: flourGrams,
      water: waterGrams,
      salt: saltGrams,
      oil: oilGrams,
      sugar: sugarGrams,
      yeast: yeastGrams,
      yeastType,
      yeastPct: Math.round(yeastPct * 100) / 100,
      hydration,
      actualTotalWeight,
      sourdoughAdvice,
      effectiveHours: Math.round((roomHours + (fridgeHours * 0.10)) * 10) / 10
    };
  },

  /**
   * Scompone gli ingredienti in Pre-fermento (Biga o Poolish) e Rinfresco finale
   */
  calculatePreferment(totalResult, method = "direct", prefermentPct = 50) {
    if (method === "direct") {
      return null;
    }

    if (method === "biga") {
      const bigaFlour = Math.round(totalResult.flour * (prefermentPct / 100));
      const bigaWater = Math.round(bigaFlour * 0.45); // 45% idratazione classica biga
      let bigaYeast = Math.round((bigaFlour * 0.01) * 10) / 10; // 1% lievito fresco
      if (totalResult.yeastType === this.YEAST_TYPES.DRY) {
        bigaYeast = Math.round((bigaYeast / 3.0) * 10) / 10;
      }
      if (bigaYeast < 0.2) bigaYeast = 0.2;

      const refreshFlour = Math.max(0, Math.round((totalResult.flour - bigaFlour) * 10) / 10);
      const refreshWater = Math.max(0, Math.round((totalResult.water - bigaWater) * 10) / 10);

      return {
        method: "biga",
        prefermentPct,
        preferment: {
          name: "Biga Tradizionale",
          flour: bigaFlour,
          water: bigaWater,
          hydration: 45,
          yeast: bigaYeast,
          tempAdvice: "Fermentazione 16-24 ore a 16-18°C (cantina, camera fresca o parte alta del frigo a 14-16°C).",
          prepNote: "NON impastare a lungo! Miscela solo finché non vedi farina asciutta. La massa deve rimanere grezza e spezzettata."
        },
        refresh: {
          flour: refreshFlour,
          water: refreshWater,
          salt: totalResult.salt,
          oil: totalResult.oil,
          sugar: totalResult.sugar,
          yeast: 0,
          prepNote: "Aggiungi la biga a pezzetti spezzettati nella ciotola con una parte dell'acqua del rinfresco per scioglierla, poi unisci la farina restante, il sale e infine la restante acqua a filo."
        }
      };
    }

    if (method === "poolish") {
      const poolishFlour = Math.round(totalResult.flour * (prefermentPct / 100));
      const poolishWater = poolishFlour; // 100% idratazione
      let poolishYeast = Math.round((poolishFlour * 0.003) * 100) / 100; // 0.3% lievito fresco
      if (totalResult.yeastType === this.YEAST_TYPES.DRY) {
        poolishYeast = Math.round((poolishYeast / 3.0) * 100) / 100;
      }
      if (poolishYeast < 0.1) poolishYeast = 0.1;

      const refreshFlour = Math.max(0, Math.round((totalResult.flour - poolishFlour) * 10) / 10);
      const refreshWater = Math.max(0, Math.round((totalResult.water - poolishWater) * 10) / 10);

      return {
        method: "poolish",
        prefermentPct,
        preferment: {
          name: "Poolish Liquido",
          flour: poolishFlour,
          water: poolishWater,
          hydration: 100,
          yeast: poolishYeast,
          tempAdvice: "Fermentazione 8-16 ore a 20-22°C fino al raddoppio e inizio di leggera concavità al centro.",
          prepNote: "Mescola energicamente con una frusta o forchetta in un barattolo alto. Sigilla non ermeticamente."
        },
        refresh: {
          flour: refreshFlour,
          water: refreshWater,
          salt: totalResult.salt,
          oil: totalResult.oil,
          sugar: totalResult.sugar,
          yeast: 0,
          prepNote: "Versa il poolish attivo nella ciotola, unisci l'acqua rimanente e la farina, poi chiudi con sale e olio."
        }
      };
    }

    return null;
  },

  /**
   * Calcolo Temperatura Acqua (Regola dei 55 / Regola del Fornaio) per Pizzaioli PRO
   */
  calculateWaterTemp({ roomTemp = 21, flourTemp = 20, targetDoughTemp = 24, kneadingType = "hand" }) {
    const frictionMap = {
      hand: 2,
      planetary: 6,
      spiral: 9
    };
    const friction = frictionMap[kneadingType] !== undefined ? frictionMap[kneadingType] : 2;
    // Formula aurea: T_acqua = (T_target * 3) - (T_ambiente + T_farina + Attrito)
    const calculatedWaterTemp = Math.round(((targetDoughTemp * 3) - (roomTemp + flourTemp + friction)) * 10) / 10;
    
    let advice = "";
    if (calculatedWaterTemp <= 4) {
      advice = "Usa acqua fredda di frigorifero (4°C) o aggiungi cubetti di ghiaccio nell'acqua per non surriscaldare la maglia glutinica.";
    } else if (calculatedWaterTemp >= 28) {
      advice = "Usa acqua tiepida a circa 26-28°C per aiutare l'avvio della fermentazione in un ambiente fresco.";
    } else {
      advice = "Temperatura ottimale: puoi usare normale acqua fresca di rubinetto.";
    }

    return {
      waterTemp: calculatedWaterTemp,
      friction,
      advice
    };
  }
};

// Esporta per compatibilità browser e Node
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DoughCalculator };
}

