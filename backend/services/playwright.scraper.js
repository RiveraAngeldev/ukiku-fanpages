import { chromium } from "playwright";

export async function getEpisodeStream(anime, episodeNumber) {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(`https://www3.animeflv.net/browse?q=${encodeURIComponent(anime)}`, {
            waitUntil: "domcontentloaded",
            timeout: 15000
        });
        await page.waitForLoadState("networkidle");

        const firstLink = await page.$eval(".ListAnimes a", el => el.getAttribute("href"));

        if (!firstLink) throw new Error("Anime no encontrado");

        const animeUrl = `https://www3.animeflv.net${firstLink}`;

        await page.goto(animeUrl, {
            waitUntil: "domcontentloaded",
            timeout: 15000
        });
        await page.waitForLoadState("networkidle");

        const episodes = await page.evaluate(() => {
            const selectors = [
                ".ListCapsuleEpisodes a",
                ".EpisodeList a",
                ".fa-play-circle",
                "a[href*='/ver/']"
            ];

            let results = [];

            for (const sel of selectors) {
                const nodes = document.querySelectorAll(sel);

                nodes.forEach(n => {
                    const href = n.getAttribute("href");
                    if (href && !results.includes(href)) {
                        results.push(href);
                    }
                });

                if (results.length > 0) break;
            }

            return results;
        });

        console.log("EPISODES FOUND:", episodes);

        const epUrl = episodes[episodeNumber - 1];

        if (!epUrl) throw new Error("Episodio no encontrado");

        const fullEpUrl = `https://www3.animeflv.net${epUrl}`;

        await page.goto(fullEpUrl, {
            waitUntil: "domcontentloaded",
            timeout: 15000
        });
        await page.waitForLoadState("networkidle");

        const videoUrl = await page.evaluate(() => {
            const iframe = document.querySelector("iframe");
            if (iframe) return iframe.src;

            const source = document.querySelector("source");
            if (source) return source.src;

            return null;
        });

        if (!videoUrl) {
            throw new Error("No se encontró video embed");
        }

        return {
            anime,
            episode: episodeNumber,
            url: videoUrl
        };

    } finally {
        await browser.close();
    }
}