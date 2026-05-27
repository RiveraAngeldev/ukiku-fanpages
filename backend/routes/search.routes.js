import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const q = req.query.q;

        const response = await axios.get(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}`
        );

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
});

export default router;