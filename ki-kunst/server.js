const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public')); // Hier liegen HTML/JS

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY; // Variable von Render

    try {
        // Hinweis: Dies ist ein vereinfachter Aufruf für die Gemini-Schnittstelle
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Erzeuge ein Bild basierend auf diesem Prompt: ${prompt}` }] }]
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Fehler bei der Generierung" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));