const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // Der korrekte Endpoint für Gemini 3 Pro Image (2026)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // WICHTIG: Gemini 3 schickt Bilder als 'inlineData' (Base64)
        if (data.candidates && data.candidates[0].content.parts[0].inlineData) {
            const base64Image = data.candidates[0].content.parts[0].inlineData.data;
            return res.json({ imageBase64: base64Image });
        } 
        
        // Falls doch nur Text kommt
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Keine Bilddaten erhalten.";
        res.json({ result: text });

    } catch (error) {
        console.error("Fehler im Backend:", error);
        res.status(500).json({ error: "Server-Fehler: " + error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server aktiv auf Port ${PORT}`);
});
