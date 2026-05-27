import axios from "axios";
import * as cheerio from "cheerio";

export async function extractStreamwish(url) {
    const res = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    const $ = cheerio.load(res.data);

    let script = $("script").html();

    // StreamWish suele esconder el video en JSON o eval()
    const match = script?.match(/file:\s*"(.*?)"/);

    if (match) {
        return match[1];
    }

    throw new Error("StreamWish no encontrado");
}