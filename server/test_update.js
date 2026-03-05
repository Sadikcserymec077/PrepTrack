const mongoose = require('mongoose');
const Topic = require('./models/Topic');

mongoose.connect('mongodb+srv://mohammedsadiq07878:klvzY6zR3AuwVKDD@cluster0.ixaq6ww.mongodb.net/preptrack?retryWrites=true&w=majority&appName=Cluster0')
    .then(async () => {
        try {
            const topic = await Topic.findById('69a941db322c49f65c30e110');
            if (!topic) {
                console.log("Topic not found");
                return;
            }
            topic.questions = [...topic.questions, {
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
            }];
            await topic.save();
            console.log("Save successful!");
        } catch (e) {
            console.error("Save error:", e.message, '\n', e.errors);
        } finally {
            mongoose.connection.close();
        }
    });
