/**
 * Vercel Serverless Function - Endpoint Sicuro per Google Gemini 2.0 Flash
 * Questo endpoint permette a qualsiasi utente dell'app Android o Web
 * di usare Gemini gratuitamente senza mai dover inserire o possedere una chiave API.
 */

export default async function handler(req, res) {
  // Gestione CORS per richieste da Android WebView, PWA e browser
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito. Usa POST." });
  }

  try {
    const { message, context } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Messaggio utente mancante." });
    }

    // La chiave viene letta in modo sicuro dalle variabili d'ambiente di Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        available: false,
        error: "Chiave GEMINI_API_KEY non configurata sul server.",
        reply: null
      });
    }

    const systemInstruction = `Sei il Maestro Panificatore Virtuale dell'applicazione 'Maestro degli Impasti' (ispirato alla Teoria del Maestro).
Rispondi sempre in italiano in modo caloroso, pratico, autorevole ed empatico per salvare gli impasti di pizzaioli e appassionati.
Se l'utente ha indicato il contesto dell'impasto (farina, idratazione, metodo, forno), usalo accuratamente per personalizzare la diagnosi.

Struttura sempre la tua risposta in modo chiaro:
1. 🔍 DIAGNOSI DEL MAESTRO: Spiega in una riga cosa sta accadendo.
2. ⚡ COME SALVARLO ADESSO: Azioni pratiche da fare immediatamente per non buttare l'impasto.
3. 🔬 LA TEORIA DEL MAESTRO (Perché succede): Breve spiegazione scientifica (maglia glutinica, lieviti, idratazione, temperatura forno o farina di spolvero).
4. 🛡️ PER LA PROSSIMA VOLTA: La regola d'oro per evitare l'errore.

Sii conciso, concreto, incoraggiante e senza preamboli inutili.`;

    const fullPrompt = context
      ? `[CONTESTO IMPASTO ATTUALE: ${context}]\n\nDOMANDA UTENTE:\n${message}`
      : `DOMANDA UTENTE:\n${message}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 900
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Errore chiamata Gemini:", errText);
      return res.status(502).json({
        available: false,
        error: "Errore dal provider AI Google Gemini.",
        reply: null
      });
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return res.status(502).json({
        available: false,
        error: "Nessun testo generato.",
        reply: null
      });
    }

    return res.status(200).json({
      available: true,
      provider: "gemini-2.0-flash",
      reply: candidateText
    });

  } catch (err) {
    console.error("Eccezione serverless chat:", err);
    return res.status(500).json({
      available: false,
      error: "Errore interno server.",
      reply: null
    });
  }
}
