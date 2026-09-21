/**
 * Maestro degli Impasti - Agente Virtuale di Pronto Soccorso (Il Maestro AI)
 * Architettura Ibrida: Motore Scientifico Locale Gratuito + Motore Gemini Flash (Free Tier)
 */

const MaestroAgent = {
  apiKey: "",
  isProcessing: false,
  messages: [],
  useActiveContext: true,

  init() {
    this.apiKey = localStorage.getItem("maestro_gemini_api_key") || "";
    this.updateStatusBadge();
    this.renderWelcomeMessage();
    this.updateContextPill();
  },

  updateStatusBadge() {
    const badge = document.getElementById("agent-status-badge");
    if (!badge) return;

    if (this.apiKey) {
      badge.textContent = "Gemini 2.0 Flash (Attivo • Free Tier)";
      badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1";
    } else {
      badge.textContent = "Motore Locale Gratuito (Attivo)";
      badge.className = "text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 flex items-center gap-1";
    }
  },

  updateContextPill() {
    const pill = document.getElementById("agent-current-context-text");
    if (!pill) return;

    const recipe = (typeof RECIPES_DATA !== "undefined" && typeof AppState !== "undefined")
      ? (RECIPES_DATA.find(r => r.id === AppState.selectedRecipeId) || { name: "Pizza" })
      : { name: "Pizza" };

    const hydro = document.getElementById("input-hydration")?.value || "65";
    const oven = (typeof OVENS_DATA !== "undefined" && typeof AppState !== "undefined")
      ? (OVENS_DATA.find(o => o.id === AppState.selectedOvenId) || { name: "Forno" })
      : { name: "Forno di Casa" };

    const method = AppState?.selectedMethod === "biga" ? "Biga" : (AppState?.selectedMethod === "poolish" ? "Poolish" : "Diretto");

    pill.textContent = `${recipe.name} (${method}) • ${hydro}% Idro • ${oven.name}`;
  },

  renderWelcomeMessage() {
    if (this.messages.length === 0) {
      const welcome = {
        role: "maestro",
        text: `👋 **Ciao! Sono il tuo Maestro Panificatore virtuale.**\nHai un problema con l'impasto in questo momento?\n\nDescrivimi con parole tue cosa sta succedendo (oppure clicca uno dei problemi rapidi qui sotto) e troveremo subito la soluzione scientifica per salvarlo!`
      };
      this.messages.push(welcome);
    }

    const container = document.getElementById("agent-chat-messages");
    if (container) {
      this.renderMessages();
    }
  },

  renderMessages() {
    const container = document.getElementById("agent-chat-messages");
    if (!container) return;

    container.innerHTML = "";
    this.messages.forEach(msg => {
      const isUser = msg.role === "user";
      const div = document.createElement("div");
      div.className = isUser ? "flex justify-end mb-3" : "flex justify-start mb-3";

      const bubble = document.createElement("div");
      bubble.className = isUser
        ? "max-w-[85%] bg-amber-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs shadow-sm font-medium"
        : "max-w-[90%] bg-stone-100 border border-stone-200/90 text-stone-800 rounded-2xl rounded-tl-sm px-4 py-3 text-xs shadow-sm space-y-1.5";

      if (isUser) {
        bubble.textContent = msg.text;
      } else {
        bubble.innerHTML = this.formatMarkdown(msg.text);
      }

      div.appendChild(bubble);
      container.appendChild(div);
    });

    container.scrollTop = container.scrollHeight;
    if (window.lucide) lucide.createIcons();
  },

  formatMarkdown(text) {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-stone-900 font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n• /g, '<br>• ')
      .replace(/\n- /g, '<br>• ')
      .replace(/\n(\d+)\. /g, '<br><strong>$1.</strong> ');

    return html;
  },

  async handleUserSubmit(e) {
    if (e) e.preventDefault();
    if (this.isProcessing) return;

    const input = document.getElementById("agent-chat-input");
    if (!input) return;

    const userText = input.value.trim();
    if (!userText) return;

    input.value = "";
    await this.sendUserMessage(userText);
  },

  async sendQuickPrompt(promptText) {
    if (this.isProcessing) return;
    await this.sendUserMessage(promptText);
  },

  async sendUserMessage(text) {
    this.isProcessing = true;
    this.messages.push({ role: "user", text });
    this.renderMessages();

    // Mostra indicatore di digitazione
    const container = document.getElementById("agent-chat-messages");
    const typingIndicator = document.createElement("div");
    typingIndicator.id = "agent-typing-indicator";
    typingIndicator.className = "flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl max-w-[200px] border border-amber-200/60 mb-2";
    typingIndicator.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
      <span class="font-bold">Il Maestro sta ragionando...</span>
    `;
    container.appendChild(typingIndicator);
    container.scrollTop = container.scrollHeight;

    // Recupera contesto impasto corrente
    const contextStr = this.buildContextString();

    let reply = "";
    if (this.apiKey) {
      reply = await this.callGeminiAPI(text, contextStr);
    } else {
      // 1. Prova prima il backend serverless (attivo quando ospitato online o su app Android)
      const serverReply = await this.callBackendServerless(text, contextStr);
      if (serverReply) {
        reply = serverReply;
      } else {
        // 2. Fallback istantaneo sul motore locale (offline o locale)
        await new Promise(r => setTimeout(r, 400));
        reply = this.matchLocalKnowledge(text, contextStr);
      }
    }

    typingIndicator.remove();
    this.messages.push({ role: "maestro", text: reply });
    this.renderMessages();
    this.isProcessing = false;
  },

  async callBackendServerless(userQuery, contextStr) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery, context: contextStr })
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.available && data.reply) {
        return data.reply;
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  buildContextString() {
    const cb = document.getElementById("agent-include-context-checkbox");
    if (cb && !cb.checked) return "";

    const recipe = (typeof RECIPES_DATA !== "undefined" && typeof AppState !== "undefined")
      ? (RECIPES_DATA.find(r => r.id === AppState.selectedRecipeId) || { name: "Pizza Classica" })
      : { name: "Pizza Classica" };

    const hydro = document.getElementById("input-hydration")?.value || "65";
    const roomHours = document.getElementById("input-room-hours")?.value || "8";
    const fridgeHours = document.getElementById("input-fridge-hours")?.value || "0";
    const oven = (typeof OVENS_DATA !== "undefined" && typeof AppState !== "undefined")
      ? (OVENS_DATA.find(o => o.id === AppState.selectedOvenId) || { name: "Forno di Casa 250°C" })
      : { name: "Forno di Casa 250°C" };
    const method = AppState?.selectedMethod === "biga" ? "Biga" : (AppState?.selectedMethod === "poolish" ? "Poolish" : "Diretto");

    return `Contesto attivo dell'utente: Ricetta=${recipe.name}, Metodo=${method}, Idratazione=${hydro}%, Lievitazione=${roomHours}h ambiente + ${fridgeHours}h frigo, Forno a disposizione=${oven.name}.`;
  },

  // ============================================================
  // MOTORE LOCALE ESPERTO (100% GRATUITO E OFFLINE)
  // ============================================================
  matchLocalKnowledge(query, contextStr) {
    const q = query.toLowerCase();

    // 1. PIZZA BRUCIATA SOTTO / FONDO NERO / PIETRA TROPPO CALDA
    const isBurnt = q.includes("brucia") || q.includes("carbonizz") || q.includes("ner") || q.includes("cenere");
    const isBottom = q.includes("sotto") || q.includes("fondo") || q.includes("base") || q.includes("pietra") || q.includes("leccarda");

    if (isBurnt && isBottom) {
      return `🩺 **Diagnosi del Maestro:** Pizza bruciata sotto! Ci sono 3 cause scientifiche principali:
1. **Eccesso di farina cruda di spolvero sul fondo:** La farina 00 brucia e carbonizza a 250-300°C trasformandosi in una patina amara e nera di cenere.
2. **Pietra refrattaria (cordierite) troppo rovente:** La pietra accumula troppo calore e conduce calore alla base prima che la parte superiore sia cotta.
3. **Zucchero, Malto o Olio nell'impasto a temperature >350°C:** Zuccheri e grassi accelerano bruscamente la reazione di Maillard e bruciano a temperature da forno pizza.
\n🚨 **Pronto Soccorso Immediato (Come salvarla ADESSO):**
• **NON buttarla!** Prendi una **grattugia da formaggio (o Microplane)** oppure la lama seghettata di un coltello da pane.
• Capovolgi la pizza sul tagliere e **raschia via delicatamente la patina nera bruciata**. In 30 secondi rimuoverai tutta la cenere amara senza rovinare l'impasto interno e la mozzarella!
• Versa un filo d'olio EVO a crudo e un pizzico di origano per bilanciare il sapore.
\n💡 **Per la prossima volta:**
• Usa **solo semola rimacinata** per stendere e scuoti bene il disco prima di infornare (o usa una **pala forata** per far cadere tutta la farina in eccesso).
• Per fornetti o forni a gas (>380°C), elimina completamente zucchero, miele o olio dall'impasto della napoletana.
• Se usi forni ad altissima temperatura, la pietra in cordierite è troppo aggressiva: passa a un *Biscotto di Casapulla o Sorrento* a bassa conducibilità.`;
    }

    // 2. PIZZA BRUCIATA SOPRA / CORNICIONE O MOZZARELLA BRUCIATA
    const isTop = q.includes("sopra") || q.includes("cornicione") || q.includes("mozzarella") || q.includes("superficie") || q.includes("condimento");
    if (isBurnt && isTop) {
      return `🩺 **Diagnosi del Maestro:** Calore superiore o fiamma troppo aggressivi, oppure mozzarella inserita troppo presto.
\n🚨 **Pronto Soccorso Immediato:**
• Taglia delicatamente le parti annerite del cornicione con delle forbici da cucina prima di servire.
\n💡 **Per la prossima volta:**
• Applica la **cottura in due tempi**: cuoci prima la base solo con il pomodoro. Quando mancano 1-2 minuti al termine, estrai la teglia/pizza, aggiungi la mozzarella (ben strizzata e fredda) e rimetti dentro per fonderla senza bruciarla.
• Nei forni a gas (Ooni / Munaciello), appena inforni **abbassa subito la fiamma al minimo** per non bruciare il cornicione prima che il fondo sia cotto.`;
    }

    // 3. PIZZA BRUCIATA IN GENERALE
    if (isBurnt) {
      return `🩺 **Diagnosi del Maestro:** Eccesso di temperatura o tempo di cottura troppo prolungato.
\n🚨 **Pronto Soccorso Immediato:**
• Capovolgi la pizza e controlla se è bruciata sotto: usa una grattugia Microplane per asportare la crosticina amara bruciata.
• Se è bruciato solo il cornicione, rimuovi le parti nere con delle forbici.
\n💡 **Per la prossima volta:**
• Controlla la temperatura con un termometro laser prima di infornare. Per forno di casa resta sui 250°C, per fornetti pizza non superare i 430°C sulla pietra se è cordierite.`;
    }

    // 4. PIZZA CRUDA DENTRO / GOMMOSA / NON CUOCE AL CENTRO
    if (q.includes("cruda") || q.includes("gommosa") || q.includes("pasta cruda") || q.includes("alveoli umidi") || q.includes("pesante")) {
      return `🩺 **Diagnosi del Maestro:** La crosta si è sigillata prima che il vapore interno potesse evaporare. Tipico di forni con troppo calore sopra e poco sotto, oppure di mozzarella troppo acquosa che ha allagato il centro.
\n🚨 **Pronto Soccorso Immediato:**
• Rimetti la pizza in forno a bassa temperatura (180-200°C ventilato) posizionata direttamente sulla griglia centrale per 3-4 minuti: lascerà asciugare l'umidità interna della mollica.
\n💡 **Per la prossima volta:**
• Taglia e fai scolare la mozzarella in un colino in frigo per almeno 3-4 ore prima di usarla.
• Non esagerare con il pomodoro al centro: stendi il condimento lasciando sempre 2 cm di cornicione libero.`;
    }

    // 5. ATTACCATA ALLA PALA / NON SCIVOLA
    if (q.includes("pala") || q.includes("scivola") || q.includes("incollat") || q.includes("appiccicata alla pala")) {
      return `🩺 **Diagnosi del Maestro:** La pizza è rimasta troppo tempo condita sulla pala, oppure il pomodoro è colato sul bordo bagnando l'alluminio/legno.
\n🚨 **Pronto Soccorso Immediato (Salvataggio in extremis):**
• NON tirare con forza, si squarcerebbe!
• Solleva delicatamente un lembo con una spatolina e **soffia con forza sotto la pizza** (effetto cuscinetto d'aria).
• Spargi un pizzico di semola rimacinata sotto la parte sollevata.
• Se è irrecuperabile e bucata: chiudila a metà a portafoglio e infornala come un **Calzone ripieno**!
\n💡 **Per la prossima volta:** Condisci la pizza velocemente (massimo 20-30 secondi sulla pala) e usa sempre una spolverata di semola rimacinata sulla pala prima di caricare il disco.`;
    }

    // 6. IMPASTO APPICCICOSO / COLLA
    if (q.includes("appiccicos") || q.includes("colla") || q.includes("viscid") || q.includes("attacca") || q.includes("mollicci")) {
      return `🩺 **Diagnosi del Maestro:** Mancato sviluppo della maglia glutinica oppure impasto surriscaldato (sopra i 26-27°C). Aggiungere farina a pugni adesso sbilancerebbe il sale e l'idratazione.
\n🚨 **Pronto Soccorso Immediato:**
• Fermati subito e non impastare oltre.
• Copri la massa con una ciotola rovesciata e fai un **riposo tecnico di 10 minuti** al fresco. Il glutine si rilassa e si struttura spontaneamente (idratazione passiva).
• Inumidisci leggermente le mani con acqua fredda (o un velo d'olio EVO) ed esegui 3 pieghe sul banco (slap & fold). Vedrai che la massa prenderà corpo come per magia!
\n💡 **Per la prossima volta:** Versa sempre l'acqua in due tempi: il 65% all'inizio e il restante 35% solo a filo quando la maglia è già formata.`;
    }

    // 7. IMPASTO CHE SI RITIRA / ELASTICO
    if (q.includes("ritira") || q.includes("elastico") || q.includes("torna indietro") || q.includes("rigido") || q.includes("resiste")) {
      return `🩺 **Diagnosi del Maestro:** Fenomeno di tenacia eccessiva del glutine. I panetti non hanno completato l'appretto o sono stati maneggiati con troppa forza.
\n🚨 **Pronto Soccorso Immediato:**
• Non forzare la stesura! Se tiri a forza, strappi la maglia glutinica e perdi tutta l'aria nel cornicione.
• Lascia i dischi sul banco coperti con un telo o pellicola e **aspetta 20-30 minuti**. Il glutine perderà rigidità per rilassamento viscoelastico e si stenderà docilmente con la sola pressione delle dita.
\n💡 **Per la prossima volta:** Allunga i tempi di appretto di almeno 1 ora prima di stendere, assicurandoti che i panetti siano a temperatura ambiente (circa 20°C).`;
    }

    // 8. PANETTI SGONFI / SOVRALIEVITATI
    if (q.includes("sgonf") || q.includes("piatt") || q.includes("spiattellat") || q.includes("sovralievit") || q.includes("troppo lievitat") || q.includes("liquefatt")) {
      return `🩺 **Diagnosi del Maestro:** Sovralievitazione! I lieviti hanno esaurito gli zuccheri e gli enzimi proteolitici hanno iniziato a degradare la maglia glutinica, che non riesce più a trattenere i gas.
\n🚨 **Pronto Soccorso Immediato:**
• NON re-impastare le palline (distruggeresti la poca struttura rimasta).
• Raccogli delicatamente la massa con una spatola e riversala direttamente in una teglia unta d'olio.
• Stendi delicatamente con le dita unte, cospargi con una salamoia (acqua, olio e sale grosso) o pomodoro e inforna ad alta temperatura: otterrai una **focaccia ad alta idratazione strepitosa**!
\n💡 **Per la prossima volta:** Riduci il lievito del 30% oppure metti i panetti in frigo a 4°C per frenare la fermentazione se devi ritardare l'infornata.`;
    }

    // 9. FORNO DI CASA / SOTTO BIANCO / PALLIDO
    if (q.includes("bianc") || q.includes("sotto non cuoce") || q.includes("cruda sotto") || q.includes("pallid") || q.includes("non fa la crosta")) {
      return `🩺 **Diagnosi del Maestro:** Mancanza di spinta termica per conduzione dal fondo. Il classico forno di casa a 250°C trasferisce calore lentamente rispetto a una platea refrattaria rovente.
\n🚨 **Pronto Soccorso Immediato (Tecnica Padella + Grill):**
• Se stai cuocendo una pizza tonda nel forno di casa: accendi una padella antiaderente o in ghisa sul fornello a gas finché è rovente.
• Adagia il disco steso in padella e cuoci il fondo sul gas per 90-120 secondi (farà subito le tipiche macchie brunicole e gonfierà il cornicione).
• Nel frattempo accendi il grill del forno al massimo: trasferisci la pizza sotto la resistenza superiore per altri 2 minuti per dorare il cornicione e sciogliere la mozzarella!
\n💡 **Per la prossima volta:** Aggiungi il 2.5% di olio EVO e l'1% di malto o miele nell'impasto per favorire la reazione di Maillard e la doratura a 250°C.`;
    }

    // 10. NON LIEVITA / FERMO
    if (q.includes("non lievita") || q.includes("fermo") || q.includes("non cresce") || q.includes("morto") || q.includes("bloccato")) {
      return `🩺 **Diagnosi del Maestro:** Shock termico o temperatura troppo bassa. Se hai usato acqua troppo calda (>45°C) potresti aver inattivato i lieviti; se invece è troppo freddo (<18°C), i lieviti sono semplicemente 'addormentati'.
\n🚨 **Pronto Soccorso Immediato:**
• Trasferisci la ciotola coperta all'interno del **forno spento con la sola luce accesa** (crea una camera di lievitazione a circa 26-28°C ideali).
• Metti accanto una tazzina d'acqua bollente per creare umidità.
• Se dopo 2 ore non vedi nessun accenno di rigonfiamento, sciogli 1-2g di lievito fresco in due cucchiai di acqua tiepida e incorporalo delicatamente nella massa con qualche piega.
\n💡 **Per la prossima volta:** Usa acqua a 20-22°C d'inverno e calcola la temperatura dell'acqua con la nostra *Regola del 55* nella scheda PRO.`;
    }

    // 11. STRAPPI NELLA STESURA / BUCHI
    if (q.includes("strapp") || q.includes("buco") || q.includes("rompe") || q.includes("buchi") || q.includes("lacera")) {
      return `🩺 **Diagnosi del Maestro:** La stesura ha toccato il centro con troppa violenza o il panetto era ancora freddo di frigorifero.
\n🚨 **Pronto Soccorso Immediato:**
• Se si apre un piccolo buco sul banco: non buttare il disco! Prendi un pizzico di pasta dal bordo esterno (cornicione), appoggialo sopra al buco e picchietta con un po' di semola. Si salderà in cottura.
• Quando stendi, allarga l'aria dal centro verso l'esterno con i polpastrelli piatti senza mai tirare o sollevare la pizza per aria se non hai ancora la manualità del pizzaiolo.
\n💡 **Per la prossima volta:** Usa sempre abbondante semola rimacinata sul piano di stesura e fai acclimatare i panetti a temperatura ambiente per almeno 2 ore dopo il frigo.`;
    }

    // 12. IMPASTO ACIDO / ODORE ALCOL
    if (q.includes("acid") || q.includes("alcol") || q.includes("aceto") || q.includes("puzza")) {
      return `🩺 **Diagnosi del Maestro:** Fermentazione lattica e acetica eccessiva, dovuta a lievitazione prolungata oltre il punto di maturazione ottimale o pre-fermento sovra-fermentato.
\n🚨 **Pronto Soccorso Immediato:**
• Non puoi azzerare l'acidità chimica, ma puoi mascherarla: cuoci condendo con formaggi sapidi (pecorino, gorgonzola) e pomodoro dolce ben bilanciato con un pizzico di zucchero.
\n💡 **Per la prossima volta:** Riduci le ore a temperatura ambiente o rinfresca il pre-fermento (Biga o Poolish) con 2 ore di anticipo.`;
    }

    // 13. TROPPO SALATO O SENZA SALE
    if (q.includes("salato") || q.includes("sale")) {
      if (q.includes("dimenticat") || q.includes("senza sale") || q.includes("manca")) {
        return `🩺 **Diagnosi del Maestro:** Impasto senza sale! Il sale non dà solo sapidità, ma rinforza la maglia glutinica e frena la fermentazione. Senza sale l'impasto lieviterà molto più in fretta e sarà più fragile.
\n🚨 **Pronto Soccorso Immediato:**
• Se sei ancora in fase di impasto: sciogli il sale dovuto in un cucchiaio d'acqua e incorporalo facendo pieghe.
• Se i panetti sono già formati o in cottura: condisci la superficie con fiordilatte sapido, un pizzico di sale Maldon sui bordi e acciughe o capperi.`;
      }
      return `🩺 **Diagnosi del Maestro:** Eccesso di sale. Il sale rallenta la lievitazione e rende il glutine molto rigido.
\n🚨 **Pronto Soccorso Immediato:**
• Allunga i tempi di appretto e usa condimenti a bassissima sapidità (pomodoro dolce senza sale aggiunto, fiordilatte fresco, basilico).`;
    }

    // 14. PRE-FERMENTI (BIGA / POOLISH)
    if (q.includes("biga") || q.includes("poolish") || q.includes("prefermento")) {
      return `🩺 **Consiglio Tecnico del Maestro sui Pre-fermenti:**
• **Se la Biga sembra troppo secca al tatto:** È NORMALE! La biga deve essere sgranata e al 45% di idratazione senza impastare, per non sviluppare glutine prima del tempo.
• **Se il Poolish ha fatto la schiuma ed è collassato:** Va usato subito. Quando il centro comincia a cedere leggermente, ha raggiunto il picco enzimatico e va rinfrescato per non diventare acido.
\n💡 **Formula d'oro:** Chiudi sempre la biga spezzettandola nell'acqua di rinfresco fredda (non nella farina) per scioglierla senza grumi.`;
    }

    // 15. RISPOSTA CONTESTUALE GENERICA (SE PARLA DI PIZZA SFORNATA / COTTURA)
    if (q.includes("pizza") || q.includes("cotto") || q.includes("sfornat") || q.includes("bruci")) {
      return `🩺 **Consiglio di Cottura del Maestro:**
Ho analizzato la tua domanda: *"${query}"*${contextStr ? ` (impostazioni attive: ${contextStr})` : ''}.
\nI 3 fattori chiave della cottura perfetta:
1. **Pala forata e niente farina in eccesso:** Il 90% delle bruciature e dell'amaro sul fondo deriva dalla farina di grano tenero rimasta attaccata al disco che carbonizza sulla pietra.
2. **Equilibrio Calore Fondo / Calore Cielo:** La pietra deve cuocere la base nello stesso identico tempo in cui la volta del forno dora il cornicione.
3. **Se la pizza è già uscita male:** Usa una grattugia Microplane sul fondo per togliere il bruciato, oppure una forbice per rifilare il cornicione annerito.`;
    }

    // 16. RISPOSTA GENERICA PER FASE D'IMPASTO
    return `🩺 **Consiglio Scientifico del Maestro:**
Ho analizzato la tua richiesta: *"${query}"*${contextStr ? ` considerando il tuo impasto in corso (${contextStr})` : ''}.
\nEcco i 3 principi cardine della Teoria del Maestro da applicare subito:
1. **Non farti prendere dal panico:** In panificazione la maggior parte degli intoppi si risolve dando tempo all'impasto di rilassarsi coperto per 15-20 minuti.
2. **Umidità e Calore:** Se la massa è dura o non lievita, mettila al riparo da correnti nel forno con la luce accesa (26°C). Se è troppo calda e collassa, passala 20 minuti in frigorifero.
3. **Pieghe di Rinforzo:** Se sei in lavorazione, fai 3 pieghe a portafoglio (slap & fold) per dare struttura e allineare la maglia glutinica senza aggiungere farina asciutta.
\nVuoi dettagli specifici su un passaggio in particolare? Chiedimi pure!`;
  },

  // ============================================================
  // MOTORE GEMINI FLASH REST API (FREE TIER DI GOOGLE)
  // ============================================================
  async callGeminiAPI(userQuery, contextStr) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`;

    const systemPrompt = `Sei 'Il Maestro Panificatore', un maestro pizzaiolo e panificatore esperto, caloroso, scientifico e pratico. Insegni secondo la Teoria del Maestro.
Quando un utente ti descrive un problema o un'emergenza con l'impasto, rispondi sempre con questo schema:
1. 🩺 **Diagnosi Rapida e Rassicurante** (spiega cosa è successo a livello di glutine, fermentazione o temperatura in 2 frasi).
2. 🚨 **Pronto Soccorso Immediato** (istruzioni chiare e pratiche su cosa fare ADESSO per salvare l'impasto senza buttare nulla).
3. 💡 **Per la Prossima Volta** (consiglio tecnico preventivo).
Usa elenchi puntati, tono amichevole e autorevole. Mantieni la risposta sintetica ed efficace.`;

    const fullPrompt = `${contextStr ? `[CONTESTO ATTUALE: ${contextStr}]\n\n` : ''}DOMANDA UTENTE: ${userQuery}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: fullPrompt }]
            }
          ]
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Gemini API Error:", errData);
        if (response.status === 400 || response.status === 403) {
          return `⚠️ **Attenzione:** La chiave Gemini inserita non risulta valida o autorizzata. Verifica la chiave su Google AI Studio.\n\nNel frattempo, ecco il consiglio del motore locale gratuito:\n\n${this.matchLocalKnowledge(userQuery, contextStr)}`;
        }
        return `⚠️ Si è verificato un errore di connessione con l'API. Ecco il consiglio del motore locale gratuito:\n\n${this.matchLocalKnowledge(userQuery, contextStr)}`;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || this.matchLocalKnowledge(userQuery, contextStr);
    } catch (e) {
      console.error("Network Error calling Gemini:", e);
      return `⚠️ Connessione internet assente o bloccata. Ecco la diagnosi del motore locale integrato:\n\n${this.matchLocalKnowledge(userQuery, contextStr)}`;
    }
  },

  // ============================================================
  // GESTIONE CHIAVE GEMINI MODAL
  // ============================================================
  openKeyModal() {
    const modal = document.getElementById("gemini-key-modal");
    const input = document.getElementById("input-gemini-key");
    if (input) input.value = this.apiKey;
    if (modal) modal.classList.remove("hidden");
  },

  closeKeyModal() {
    const modal = document.getElementById("gemini-key-modal");
    if (modal) modal.classList.add("hidden");
  },

  saveKeyConfirm() {
    const input = document.getElementById("input-gemini-key");
    const val = input ? input.value.trim() : "";
    this.apiKey = val;
    if (val) {
      localStorage.setItem("maestro_gemini_api_key", val);
    } else {
      localStorage.removeItem("maestro_gemini_api_key");
    }
    this.updateStatusBadge();
    this.closeKeyModal();
  },

  clearChat() {
    this.messages = [];
    this.renderWelcomeMessage();
  }
};

// Esponi esplicitamente su window per accesso globale
window.MaestroAgent = MaestroAgent;
