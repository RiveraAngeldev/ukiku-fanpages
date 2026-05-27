// services/extractor.js
import axios from "axios";
import * as cheerio from "cheerio";

export async function extractVideoUrl(embedUrl) {
    const res = await axios.get(embedUrl);
    const $ = cheerio.load(res.data);

    const iframe = $("iframe").attr("src");

    if (!iframe) return null;

    return iframe;
}