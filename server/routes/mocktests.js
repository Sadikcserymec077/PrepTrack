const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const MockTest = require('../models/MockTest');

router.get('/', verifyToken, async (req, res) => {
    try {
        const tests = await MockTest.find({ userId: req.user.uid }).sort({ dateTaken: -1 });
        res.json(tests);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const newTest = await MockTest.create({ ...req.body, userId: req.user.uid });
        res.status(201).json(newTest);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await MockTest.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
        res.json({ message: "Test deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
