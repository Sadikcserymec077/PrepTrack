/**
 * We're relying on frontend authenticating with Firebase and sending back an idToken.
 * This controller registers/logs in a user by syncing the user's info from Firebase to MongoDB.
 */
const User = require("../models/User");

const syncUser = async (req, res) => {
    try {
        const { uid, email, name } = req.user; // Provided by authMiddleware

        let user = await User.findOne({ firebaseUid: uid });

        // Auto signup process if user does not exist in our Mongo DB yet
        if (!user) {
            user = new User({
                firebaseUid: uid,
                email,
                name: name || "PrepTracker User",
            });
            await user.save();
        }

        res.json({ message: "User synced successfully", user });
    } catch (error) {
        console.error("Error in auth sync:", error);
        res.status(500).json({ error: "Server error during authentication" });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (!user) {
            return res.status(404).json({ message: "User not found " });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error loading user dashboard data" });
    }
};

module.exports = {
    syncUser,
    getUserDetails
};
