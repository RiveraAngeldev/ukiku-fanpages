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

export { router as watchRouter };