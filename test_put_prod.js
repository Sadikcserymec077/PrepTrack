const axios = require('axios');

async function testPUT() {
    try {
        const data = {
            "difficultyLevel": "Medium",
            "notesHTML": "<p>some notes</p>",
            "revisionNotesHTML": "",
            "youtubeUrl": "",
            "images": [],
            "questions": [
                {
                    "title": "Untitled Problem",
                    "difficulty": "Medium",
                    "approachHTML": "",
                    "edgeCasesHTML": "",
                    "codeSolution": "",
                    "codeLanguage": 71,
                    "youtubeUrl": "",
                    "input": "",
                    "output": "",
                    "platform": "Custom",
                    "timeTaken": 0,
                    "status": "Attempted"
                }
            ]
        };
        // need a token to hit auth endpoints, wait, I can't hit it without auth!
    } catch (err) {
        console.error(err);
    }
}
