// services/stream.service.js

import axios from "axios";
import * as cheerio from "cheerio";
import { extractVideoUrl } from "./extractor.js";

export async function getEpisodeStream(anime, episode) {

    const searchRes = await axios.get(
        `https://www3.animeflv.net/browse?q=${encodeURIComponent(anime)}`
    );

    const $ = cheerio.load(searchRes.data);

    const first =
        $(".ListAnimes a").first().attr("href");

    if (!first) throw new Error("Anime no encontrado");

    const animeUrl = `https://www3.animeflv.net${first}`;

    const animePage = await axios.get(animeUrl);
    const $$ = cheerio.load(animePage.data);

    const episodes = [];

    const episodeSelectors = [
        ".ListEpisodes a",
        ".EpisodeList a",
        ".fa-play-circle",
        "a[href*='/ver/']"
    ];

    for (const selector of episodeSelectors) {
        $(selector).each((i, el) => {
            const link = $(el).attr("href");
            if (link && !episodes.includes(link)) {
                episodes.push(`https://www3.animeflv.net${link}`);
            }
        });

        if (episodes.length > 0) break;
    }

    const epUrl = episodes[episode - 1];

    if (!epUrl) throw new Error("Episodio no encontrado");

    const videoUrl = await extractVideoUrl(epUrl);

    return {
        anime,
        episode,
        url: videoUrl
    };
}