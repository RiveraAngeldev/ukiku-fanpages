import axios from "axios";
import * as cheerio from "cheerio";

export async function detectServers(episodeUrl) {
    const res = await axios.get(episodeUrl);
    const $ = cheerio.load(res.data);

    const servers = [];

    $(".Server-option a").each((i, el) => {
        const url = $(el).attr("data-video") || $(el).attr("href");
        const name = $(el).text().trim();

        if (url) {
            servers.push({
                name,
                url: url.startsWith("http")
                    ? url
                    : `https://www3.animeflv.net${url}`
            });
        }
    });

    return servers;
}