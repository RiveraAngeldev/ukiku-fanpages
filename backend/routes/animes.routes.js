import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/animes", async (req, res) => {
    try {
        const page = req.query.page || 1;

        const response = await axios.get(
            `https://api.jikan.moe/v4/anime?page=${page}`
        );

        res.json(response.data);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});

export { router as animesRouter };