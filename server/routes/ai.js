const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/summarize', verifyToken, async (req, res) => {
    try {
        const { title, difficulty, codeSolution, input, output } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API Key is not configured on the server." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an expert Data Structures and Algorithms tutor. 
        I have provided the following problem details:
        Title: ${title || 'Unknown'}
        Difficulty: ${difficulty || 'Unknown'}
        Example Input: ${input || 'N/A'}
        Example Output: ${output || 'N/A'}
        
        Code Solution provided by the user:
        ${codeSolution || 'No code provided.'}
        
        Please provide a detailed but concise explanation broken down into two HTML blocks that I will inject directly into a rich text editor.
        Do not use markdown blocks like \`\`\`html. Output raw HTML only.
        
        Format your response EXACTLY as a strict JSON object:
        {
           "approachHTML": "<h3>Intuition</h3><p>...</p><h3>Approach</h3><ul><li>...</li></ul>",
           "edgeCasesHTML": "<ul><li>...</li></ul>"
        }
        
        Ensure you only output the raw JSON so it can be parsed by JSON.parse().
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Strip markdown backticks if Gemini includes them
        const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonOutput = JSON.parse(cleanedText);

        res.json(jsonOutput);
    } catch (err) {
        console.error("AI summarization error:", err);
        res.status(500).json({ error: "Failed to generate AI summary." });
    }
});

module.exports = router;
