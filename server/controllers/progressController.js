const Topic = require("../models/Topic");
const User = require("../models/User");

/**
 * @desc Get User Dashboard Analytics
 * @route GET /api/progress/dashboard
 */
const getDashboardData = async (req, res) => {
    try {
        const topics = await Topic.find({ userId: req.user.uid });
        const user = await User.findOne({ firebaseUid: req.user.uid });

        if (!user) {
            return res.status(404).json({ error: "User not found " });
        }

        let totalQuestionsSolved = 0;
        let totalTopicsCompleted = 0;
        let strongTopics = [];
        let weakTopics = [];
        let moderateTopics = [];
        let subjectsData = {}; // For Bar Chart
        let revisionList = []; // Smart Revision

        const today = new Date();

        topics.forEach(topic => {
            const lastDate = topic.lastRevised || topic.createdAt;
            const diffDays = Math.floor((today - new Date(lastDate)) / (1000 * 60 * 60 * 24));

            // Need revision at day 1, 3, 7, 15
            if (diffDays >= 1 && diffDays <= 2 && topic.revisionCount === 0) revisionList.push(topic);
            else if (diffDays >= 3 && diffDays <= 6 && topic.revisionCount === 1) revisionList.push(topic);
            else if (diffDays >= 7 && diffDays <= 14 && topic.revisionCount === 2) revisionList.push(topic);
            else if (diffDays >= 15 && topic.revisionCount >= 3) revisionList.push(topic);
            totalQuestionsSolved += topic.solvedQuestions;

            // Calculate completion based on questions solved mapping to completeness
            if (topic.solvedQuestions >= topic.totalQuestions && topic.totalQuestions > 0) {
                totalTopicsCompleted += 1;
            }

            // Strong / Weak Logic
            if (topic.totalQuestions > 0) {
                if (topic.accuracy < 50) weakTopics.push(topic);
                else if (topic.accuracy <= 75) moderateTopics.push(topic);
                else strongTopics.push(topic);
            }

            // Subject classification counts
            if (!subjectsData[topic.subjectName]) {
                subjectsData[topic.subjectName] = 0;
            }
            subjectsData[topic.subjectName] += topic.solvedQuestions;
        });

        res.json({
            overview: {
                totalSubjects: 5,
                totalTopicsTracked: topics.length,
                totalTopicsCompleted,
                totalQuestionsSolved,
                studyHours: user.totalStudyHours,
                currentStreak: user.streakCount,
                overallAccuracy: topics.length > 0
                    ? Math.round(topics.reduce((acc, curr) => acc + curr.accuracy, 0) / topics.length)
                    : 0
            },
            chartsInfo: {
                subjectsData,
                strongWeakCounts: {
                    strong: strongTopics.length,
                    moderate: moderateTopics.length,
                    weak: weakTopics.length,
                }
            },
            topicsBreakdown: {
                weakTopics: weakTopics.map(t => ({ id: t._id, name: t.topicName, subject: t.subjectName, accuracy: t.accuracy })),
                strongTopics: strongTopics.map(t => ({ id: t._id, name: t.topicName, subject: t.subjectName, accuracy: t.accuracy })),
                revisionTargets: revisionList.map(t => ({ id: t._id, name: t.topicName, subject: t.subjectName, lastRevised: t.lastRevised || t.createdAt }))
            }
        });

    } catch (err) {
        res.status(500).json({ error: "Server Error loading dashboard data" });
    }
};

module.exports = { getDashboardData };
