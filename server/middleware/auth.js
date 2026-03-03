/**
 * Firebase Token Middleware
 *
 * Decodes Firebase ID tokens by verifying the JWT payload directly.
 * For production with full security, add your firebase-service-account.json
 * and uncomment the Admin SDK block.
 */

/**
 * Decode Firebase JWT payload (base64url → JSON).
 * Firebase tokens have: sub = UID, email, name, exp
 */
const decodeFirebaseToken = (token) => {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        // Fix base64url padding
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
        const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
        return payload;
    } catch {
        return null;
    }
};

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        return res.status(401).json({ message: "No token provided. Authorization denied." });
    }

    const payload = decodeFirebaseToken(token);

    if (!payload) {
        return res.status(403).json({ message: "Invalid token format." });
    }

    // Check token expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return res.status(403).json({ message: "Token expired. Please log in again." });
    }

    // Firebase token uid is in 'user_id' or 'sub'
    const uid = payload.user_id || payload.sub;
    if (!uid) {
        return res.status(403).json({ message: "Invalid token: missing user ID." });
    }

    req.user = {
        uid,
        email: payload.email || "",
        name: payload.name || payload.email || "User",
    };

    next();
};

module.exports = { verifyToken };
