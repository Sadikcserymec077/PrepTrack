const mongoose = require('mongoose');
const Topic = require('./models/Topic');

mongoose.connect('mongodb+srv://mohammedsadiq07878:klvzY6zR3AuwVKDD@cluster0.ixaq6ww.mongodb.net/preptrack?retryWrites=true&w=majority&appName=Cluster0')
    .then(async () => {
        try {
            const topic = await Topic.findById('69a941db322c49f65c30e110');
            console.log('subjectName:', topic.subjectName);
        } finally {
            mongoose.connection.close();
        }
    });
