import axios from "axios";
import * as cheerio from "cheerio";

export async function extractVidplay(url) {
    const res = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    const $ = cheerio.load(res.data);

    const scripts = $("script").toArray();

    for (const script of scripts) {
        const html = $(script).html();

        if (!html) continue;

        // Vidplay suele usar "sources" o "file"
        const match =
            html.match(/sources:\s*\[\s*\{\s*file:\s*"(.*?)"/) ||
            html.match(/file\s*:\s*"(.*?)"/);

        if (match) {
            return match[1];
        }
    }

    throw new Error("Vidplay: video no encontrado");
}