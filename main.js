const tabs = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('.section');
const searchInput = document.getElementById('search-input');
const recentAnimeContainer = document.getElementById('recent-anime-container');
const newAnimeContainer = document.getElementById('new-anime-container');
const actionAnimeContainer = document.getElementById('action-anime-container');
const episodesContainer = document.getElementById('episodes-container');
const animeListContainer = document.getElementById('anime-list-container');
const favoritesListContainer = document.getElementById('favorites-list');
const themeSelect = document.getElementById('theme-select');
const languageSelect = document.getElementById('language-selector');
const themeToggle = document.getElementById('theme-toggle');
const autoplayToggle = document.getElementById('autoplay-toggle');
const qualitySelector = document.getElementById('quality-selector');
const datasaverToggle = document.getElementById('datasaver-toggle');
const clearDataBtn = document.getElementById('clear-data-btn');
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let searchTimeout = null;
if (!favorites) favorites = [];

tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('data-target');

        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(target).classList.add('active');
        
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        searchInput.value = "";
        recentAnimeContainer.innerHTML = "";

        if (target === 'home') {
            loadRecentAnimes();
        }

        if (target === 'anime-list') {
            loadAllAnimes();
        }
        if (target === 'favorites-container') {
            loadFavorites();
        }
    });
});

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchAnime, 500);
});

async function searchAnime() {
    const searchText = searchInput.value.trim().toLowerCase();
    if (!searchText) {
        recentAnimeContainer.innerHTML = '<p>Introduce un término de búsqueda.</p>';
        return;
    }

    try {
        const response = await fetch(`https://ukiku-backend.onrender.com/api/search?q=${encodeURIComponent(searchText)}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const animes = data.data;

        recentAnimeContainer.innerHTML = '';
        if (!animes || animes.length === 0) {
            recentAnimeContainer.innerHTML = '<p>No se encontraron resultados.</p>';
        } else {
            animes.forEach(anime => {
                const animeCard = createAnimeCard(anime);
                recentAnimeContainer.appendChild(animeCard);
            });
        }
    } catch (error) {
        console.error("Error al buscar animes:", error);
        recentAnimeContainer.innerHTML = `<p>Ocurrió un error al buscar animes: ${error.message}</p>`;
    }
}

async function loadAllAnimes() {
    let page = 1;
    const currentLang = localStorage.getItem('ukiku_lang') || 'es';
    animeListContainer.innerHTML = `<p id="loadingMessage" data-i18n="loading_animes">${translations[currentLang].loading_animes}</p>`;

    try {
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        while (page <= 5) {  
            const response = await fetch(`https://ukiku-backend.onrender.com/api/animes?page=${page}`);
            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const data = await response.json();
            const animes = data.data;

            if (!animes || animes.length === 0) break;

            animes.forEach(anime => {
                const animeCard = createAnimeCard(anime);
                animeCard.classList.add("anime-card");  
                animeListContainer.appendChild(animeCard); 
            });

            page++;
            await delay(2000); 
        }

        const loadingMessage = document.getElementById("loadingMessage");
        if (loadingMessage) loadingMessage.remove();

        const animeCards = document.querySelectorAll(".anime-card");
        animeCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add("loaded");
            }, index * 100);
        });

    } catch (error) {
        console.error("Error al cargar todos los animes:", error);
        animeListContainer.innerHTML = `<p>Ocurrió un error al cargar todos los animes: ${error.message}</p>`;
    }
}

async function loadRecentAnimes() {
    const october2024 = new Date('2024-10-01');

    try {
        const response = await fetch(`https://ukiku-backend.onrender.com/api/recent`);
        if (!response.ok) {
            recentAnimeContainer.innerHTML = `<p>Error al contactar con la API de Jikan: ${response.status}</p>`;
            return;
        }

        const data = await response.json();

        const filteredAnimes = data.data.filter(anime => {
            const startDate = new Date(anime.aired.from);
            return startDate >= october2024 || anime.status === 'Airing';
        });

        recentAnimeContainer.innerHTML = '';

        if (filteredAnimes.length === 0) {
            recentAnimeContainer.innerHTML = '<p>No se encontraron animes recientes desde Octubre 2024 o en emisión.</p>';
        } else {
            filteredAnimes.forEach(anime => {
                const animeCard = createAnimeCard(anime);
                recentAnimeContainer.appendChild(animeCard);
            });
        }
    } catch (error) {
        console.error("Error al cargar los animes recientes:", error);
        recentAnimeContainer.innerHTML = `<p>Ocurrió un error al cargar los animes recientes: ${error.message}</p>`;
    }
}

function createAnimeCard(anime) {
    const animeCard = document.createElement('div');
    animeCard.classList.add('anime-card');

    const image = anime.images?.jpg?.image_url || anime.images?.webp?.image_url || "https://via.placeholder.com/200x300?text=No+Image";

    const title = anime.title || 'Sin título';

    const isFavorite = favorites.some(fav => fav.mal_id === anime.mal_id);

    animeCard.innerHTML = `
        <img src="${image}" alt="${title}" loading="lazy">
        <h3>${title}</h3>
        <button data-anime-id="${anime.mal_id}" class="favorite-btn">
            ${isFavorite ? '❤️ Favorito' : '♡ Añadir a favoritos'}
        </button>
    `;

    animeCard.addEventListener('click', (e) => {
    if (e.target.closest('.favorite-btn')) return;
    loadEpisodes(anime.mal_id, anime.title);
    });

    animeCard.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation();

        const id = anime.mal_id;
        const index = favorites.findIndex(fav => fav.mal_id === id);

        let isFavorite = false;

        if (index > -1) {
            favorites.splice(index, 1);
            isFavorite = false;
        } else {
            favorites.push(anime);
            isFavorite = true;
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        e.target.textContent = isFavorite
        ? '❤️ Favorito'
        : '♡ Añadir a favoritos';
        
        loadFavorites();
        syncFavoritesUI();
    });

    return animeCard;
}

function updateFavoriteIcons(animeId, isFavorite) {
    const favButtons = document.querySelectorAll(
        `button.favorite-btn[data-anime-id="${animeId}"]`
    );

    favButtons.forEach(button => {
        button.textContent = isFavorite
            ? '❤️ Favorito'
            : '♡ Añadir a favoritos';
    });
}

async function loadEpisodes(animeId, animeTitle) {
    try {
        const response = await fetch(`https://ukiku-backend.onrender.com/api/episodes/${animeId}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const episodes = data.data || [];

        let watchedEpisodes =
            JSON.parse(localStorage.getItem('watchedEpisodes')) || {};

        if (!watchedEpisodes[animeId]) {
            watchedEpisodes[animeId] = [];
        }

        const watchedList = watchedEpisodes[animeId] || [];

        const animeSlug = animeTitle
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        episodesContainer.innerHTML = `
            <h2>Episodios de ${animeTitle}</h2>

            <div class="episode-list">
                ${episodes.length > 0
                    ? episodes.map((episode, index) => {

                        const episodeNumber = index + 1;

                        const watched = watchedList.includes(episodeNumber);

                        const watchLink = `https://ukiku-backend.onrender.com/api/watch?anime=${encodeURIComponent(animeTitle)}&episode=${episodeNumber}`;

                        const fallback =
                            episode.url ||
                            `https://myanimelist.net/anime/${animeId}`;

                    return `
                        <div class="episode-card"
                            data-episode-id="${episodeNumber}"
                            style="${watched
                                ? 'border: 3px solid #ff6f61;'
                                : 'border: 1px solid #ccc;'}">

                            <h3>${episode.title || `Episodio ${episodeNumber}`}</h3>
                            <p>Episodio ${episodeNumber}</p>

                            <button class="view-episode"
                                data-anime="${animeTitle}"
                                data-episode="${episodeNumber}">
                                Ver episodio
                            </button>

                            <a href="${fallback}"
                            target="_blank"
                            style="display:block;font-size:12px;opacity:0.6;margin-top:5px;">
                            fallback
                            </a>
                        </div>
                    `;
                    }).join('')
                    : `<p>No hay episodios disponibles.</p>`
                }
            </div>
        `;

        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('episodes').classList.add('active');

    } catch (error) {
        console.error("Error en loadEpisodes:", error);

        episodesContainer.innerHTML = `
            <p>Error al cargar episodios: ${error.message}</p>
        `;
    }
}

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".view-episode");
    if (!btn) return;

    const anime = btn.dataset.anime;
    const episode = btn.dataset.episode;

    try {
        const res = await fetch(
            `https://ukiku-backend.onrender.com/api/watch?anime=${encodeURIComponent(anime)}&episode=${episode}`
        );

        const data = await res.json();

        console.log("STREAM DATA:", data);

        if (!data.url) {
            alert("No video found");
            return;
        }
        const win = window.open(data.url, "_blank");

        if (!win) {
            alert("Permite pop-ups para ver el episodio");
        }
        sections.forEach(s => s.classList.remove('active'));
        document.getElementById('episodes').classList.add('active');  

    } catch (err) {
        console.error("FULL ERROR:", err);
        alert(err.message);
    }
});


async function playEpisode(anime, episode) {
    try {
        const res = await fetch(
            `https://ukiku-backend.onrender.com/api/watch?anime=${encodeURIComponent(anime)}&episode=${episode}`
        );

        const data = await res.json();

        console.log("STREAM:", data);

        if (!data.url) {
            alert("No video found");
            return;
        }

        openPlayer(data.url);

    } catch (err) {
        console.error(err);
        alert("Error loading stream");
    }
}

function loadFavorites() {
    favoritesListContainer.innerHTML = '';

    if (!favorites || favorites.length === 0) {
        favoritesListContainer.innerHTML = '<p>No tienes animes favoritos aún.</p>';
        return;
    }

    favorites.forEach(fav => {
        const img =
            fav.images?.jpg?.image_url ||
            fav.images?.webp?.image_url ||
            "https://via.placeholder.com/100x150?text=No+Image";

        const animeCard = document.createElement('div');
        animeCard.classList.add('favorite-anime-card');

        animeCard.innerHTML = `
            <img src="${img}" alt="${fav.title}" loading="lazy" width="100">
            <h4>${fav.title}</h4>
            <button class="remove-favorite-btn">Eliminar</button>
        `;

        animeCard.querySelector('.remove-favorite-btn').addEventListener('click', () => {
            favorites = favorites.filter(f => f.mal_id !== fav.mal_id);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            loadFavorites();
            syncFavoritesUI();
        });

        favoritesListContainer.appendChild(animeCard);
    });
}

function syncFavoritesUI() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const card = btn.closest('.anime-card');
        if (!card) return;

        const id = parseInt(btn.dataset.animeId);

        const isFav = favorites.some(f => f.mal_id === id);

        btn.textContent = isFav
            ? '❤️ Favorito'
            : '♡ Añadir a favoritos';
    });
}

if (typeof loadCategorizedAnimes === 'function') loadCategorizedAnimes();

const translations = {
    es: {
        nav_home: "Inicio",
        nav_list: "Lista de Animes",
        nav_fav: "Favoritos",
        nav_settings: "Configuración",
        nav_login: "Login",
        home_title: "Bienvenido a Ukiku Web",
        home_recent: "Animes Recientes",
        search_placeholder: "Buscar anime...",
        list_title: "Lista de Animes",
        fav_title: "Favoritos",
        settings_title: "Configuración",
        settings_lang: "Idioma:",
        lang_es: "Español",
        lang_en: "English",
        settings_theme: "Tema:",
        theme_dark: "Oscuro",
        theme_light: "Claro",
        loading_animes: "Cargando todos los animes...",
        set_grp_general: "General",
        set_grp_playback: "Reproducción",
        set_autoplay: "Autoplay",
        set_quality: "Calidad",
        set_grp_data: "Datos",
        set_datasaver: "Ahorro de Datos",
        set_cleardata: "Borrar Datos Locales"
    },
    en: {
        nav_home: "Home",
        nav_list: "Anime List",
        nav_fav: "Favorites",
        nav_settings: "Settings",
        nav_login: "Login",
        home_title: "Welcome to Ukiku Web",
        home_recent: "Recent Anime",
        search_placeholder: "Search anime...",
        list_title: "Anime List",
        fav_title: "Favorites",
        settings_title: "Settings",
        settings_lang: "Language:",
        lang_es: "Spanish",
        lang_en: "English",
        settings_theme: "Theme:",
        theme_dark: "Dark",
        theme_light: "Light",
        loading_animes: "Loading all animes...",
        set_grp_general: "General",
        set_grp_playback: "Playback",
        set_autoplay: "Autoplay",
        set_quality: "Quality",
        set_grp_data: "Data",
        set_datasaver: "Data Saver",
        set_cleardata: "Clear Local Data"
    }
};

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            el.placeholder = translations[lang][key];
        }
    });
}

function loadSettings() {
    const savedTheme = localStorage.getItem('ukiku_theme') || 'dark';
    const savedLang = localStorage.getItem('ukiku_lang') || 'es';
    const savedAutoplay = localStorage.getItem('ukiku_autoplay') !== 'false';
    const savedQuality = localStorage.getItem('ukiku_quality') || '1080p';
    const savedDataSaver = localStorage.getItem('ukiku_datasaver') === 'true';

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeToggle) themeToggle.checked = true;
    } else {
        document.body.classList.remove('light-theme');
        if (themeToggle) themeToggle.checked = false;
    }

    if (languageSelect) languageSelect.value = savedLang;
    if (autoplayToggle) autoplayToggle.checked = savedAutoplay;
    if (qualitySelector) qualitySelector.value = savedQuality;
    if (datasaverToggle) datasaverToggle.checked = savedDataSaver;

    applyLanguage(savedLang);
}

function openPlayer(url) {
    const player = document.getElementById("player");

    try {
        player.src = url;
    } catch (e) {
        console.log("iframe blocked, fallback to new tab");
        window.open(url, "_blank");
        return;
    }

    setTimeout(() => {
        try {
            if (!player.contentWindow) {
                window.open(url, "_blank");
            }
        } catch (e) {
            window.open(url, "_blank");
        }
    }, 3000);
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

if (themeToggle) {
    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('light-theme');
            localStorage.setItem('ukiku_theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            localStorage.setItem('ukiku_theme', 'dark');
        }
    });
}

if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        const selectedLang = e.target.value;
        localStorage.setItem('ukiku_lang', selectedLang);
        applyLanguage(selectedLang);
    });
}

if (autoplayToggle) {
    autoplayToggle.addEventListener('change', (e) => {
        localStorage.setItem('ukiku_autoplay', e.target.checked);
    });
}

if (qualitySelector) {
    qualitySelector.addEventListener('change', (e) => {
        localStorage.setItem('ukiku_quality', e.target.value);
    });
}

if (datasaverToggle) {
    datasaverToggle.addEventListener('change', (e) => {
        localStorage.setItem('ukiku_datasaver', e.target.checked);
    });
}

if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
        const currentLang = localStorage.getItem('ukiku_lang') || 'es';
        const msg = currentLang === 'es' ? '¿Borrar todos los datos y favoritos?' : 'Clear all data and favorites?';
        
        if (confirm(msg)) {
            localStorage.clear();
            location.reload();
        }
    });
}

loadSettings();
loadRecentAnimes();