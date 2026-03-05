const mongoose = require('mongoose');
const Topic = require('./models/Topic');

mongoose.connect('mongodb+srv://mohammedsadiq07878:klvzY6zR3AuwVKDD@cluster0.ixaq6ww.mongodb.net/preptrack?retryWrites=true&w=majority&appName=Cluster0')
    .then(async () => {
        try {
            const topic = await Topic.findById('69a941db322c49f65c30e110');
            // Let's attempt to execute the route logic locally
            const isRevised = undefined;
            topic.difficultyLevel = "Medium";
            topic.notesHTML = "<p>Test</p>";
            topic.revisionNotesHTML = "";
            topic.youtubeUrl = "";
            // Mock exactly what the UI just sent!
            topic.questions = [
                ...topic.questions,
                {
                    title: "Untitled Problem",
                    difficulty: "Medium",
                    approachHTML: "",
                    edgeCasesHTML: "",
                    codeSolution: "",
                    codeLanguage: 71,
                    youtubeUrl: "",
                    input: "",
                    output: "",
                    platform: "Custom",
                    timeTaken: 0,
                    status: "Attempted"
                }
            ];

            if (isRevised !== undefined) {
                topic.isRevised = isRevised;
                if (isRevised) {
                    topic.revisionCount += 1;
                    topic.lastRevised = new Date();
                }
            }

            topic.lastPracticedDate = new Date();
            await topic.save();
            console.log('Saved locally without error');
        } catch (e) {
            console.error('Local save error', e);
        } finally {
            mongoose.connection.close();
        }
    });
