import axios from "axios";
import * as cheerio from "cheerio";
import { extractVideoUrl } from "../services/extractor.js";

export async function getEpisodeStream(anime, episode) {
    const searchUrls = [
        `https://www3.animeflv.net/browse?q=${encodeURIComponent(anime)}`,
        `https://www3.animeflv.net/animes?q=${encodeURIComponent(anime)}`
    ];

    let first = null;

    for (const url of searchUrls) {
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);

        first =
            $(".ListAnimes a").first().attr("href") ||
            $(".Title a").first().attr("href") ||
            $("article a").first().attr("href");

        if (first) break;
    }

    if (!first) throw new Error("Anime no encontrado");

    const animeUrl = `https://www3.animeflv.net${first}`;

    const animePage = await axios.get(animeUrl);
    const $ = cheerio.load(animePage.data);

    const episodes = [];

    const selectors = [
        ".ListCapsuleEpisodes li a",
        ".ListEpisodes a",
        ".EpisodeList a",
        ".fa-play-circle",
        "a[href*='/ver/']"
    ];

    for (const selector of selectors) {
        $(selector).each((i, el) => {
            const link = $(el).attr("href");

            if (link && !episodes.includes(link)) {
                episodes.push(`https://www3.animeflv.net${link}`);
            }
        });

        if (episodes.length > 0) break;
    }

    if (episodes.length === 0) {
        throw new Error("No se pudieron extraer episodios (HTML cambió o bloqueado)");
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