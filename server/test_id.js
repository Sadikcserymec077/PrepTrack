const mongoose = require('mongoose');
const Topic = require('./models/Topic');

mongoose.connect('mongodb+srv://mohammedsadiq07878:klvzY6zR3AuwVKDD@cluster0.ixaq6ww.mongodb.net/preptrack?retryWrites=true&w=majority&appName=Cluster0')
    .then(async () => {
        try {
            const topic = await Topic.findById('69a941db322c49f65c30e110');
            if (topic) {
                console.log("Topic found:");
                console.log("Subject:", topic.subjectName);
                console.log("Title:", topic.topicName);
                console.log("Questions count:", topic.questions.length);
            } else {
                console.log("Topic 69a941db322c49f65c30e110 NOT FOUND. Wait, what ID did I find?");
            }
        } catch (e) {
            console.log(e.message);
        } finally {
            mongoose.connection.close();
        }
    });
