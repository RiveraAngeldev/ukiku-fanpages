import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/episodes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const response = await axios.get(
            `https://api.jikan.moe/v4/anime/${id}/episodes`
        );

        res.json(response.data);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});

export { router as episodesRouter };