import express from "express";
import { getEpisodeStream } from "../services/playwright.scraper.js";

const router = express.Router();

router.get("/watch", async (req, res) => {
    try {
        const { anime, episode } = req.query;

        const data = await getEpisodeStream(
            anime,
            parseInt(episode)
        );

        res.json(data);

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});

router.get("/search", async (req, res) => {

    try {

        const q = req.query.q;

        const response = await fetch(
            `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}`
        );

        const data = await response.json();

        res.json(data);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Search failed"
        });
    }
});

router.get("/recent", async (req, res) => {

    try {

        const response = await fetch(
            "https://api.jikan.moe/v4/seasons/now"
        );

        const data = await response.json();

        res.json(data);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Recent anime failed"
        });
    }
});

router.get("/animes", async (req, res) => {

    try {

        const page = req.query.page || 1;

        const response = await fetch(
            `https://api.jikan.moe/v4/anime?page=${page}`
        );

        const data = await response.json();

        res.json(data);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Anime list failed"
        });
    }
});

export { router as watchRouter };