import axios from "axios";
import * as cheerio from "cheerio";

export async function extractMegafire(url) {
    const res = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    const $ = cheerio.load(res.data);

    // MegaFire suele esconder el video en "sources"
    const scriptTags = $("script").toArray();

    for (const script of scriptTags) {
        const html = $(script).html();

        if (!html) continue;

        const match = html.match(/file\s*:\s*"(.*?)"/);

        if (match) {
            return match[1];
        }
    }

    throw new Error("MegaFire: video no encontrado");
}