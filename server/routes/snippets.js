const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const Snippet = require('../models/Snippet');

router.get('/', verifyToken, async (req, res) => {
    try {
        const snippets = await Snippet.find({ userId: req.user.uid }).sort({ createdAt: -1 });
        res.json(snippets);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const snippet = await Snippet.create({ ...req.body, userId: req.user.uid });
        res.status(201).json(snippet);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const snippet = await Snippet.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.uid },
            req.body,
            { new: true }
        );
        res.json(snippet);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Snippet.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
