const express = require('express');
const path = require('path');
// "node-fetch" ist in neueren Node-Versionen (die Render nutzt) eingebaut.
// Falls Render meckert, füge "node-fetch" zu deiner package.json hinzu.

const app = express();

// Middleware: Erlaubt dem Server, JSON-Daten zu lesen
app.use(express.json());

// Frontend-Dateien aus dem Ordner "public" servieren
app.use(express.static(path.join(__dirname, 'public')));

// Der Endpunkt für deine Webseite
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "API-Key fehlt in den Render-Einstellungen!" });
    }

    try {
        // Wir nutzen das stabile 1.5-flash Modell
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        // Fehlerbehandlung, falls Google eine Fehlermeldung schickt
        if (data.error) {
            console.error("Google API Fehler:", data.error);
            return res.status(data.error.code || 500).json({ error: data.error.message });
        }

        // Die Antwort von Gemini extrahieren
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        res.json({ result: aiResponse });

    } catch (error) {
        console.error("Server Fehler:", error);
        res.status(500).json({ error: "Verbindung zu Gemini fehlgeschlagen." });
    }
});

// Port-Einstellung für Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
