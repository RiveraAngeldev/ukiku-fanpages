const tabs = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('.section');
const searchInput = document.getElementById('search-input');
const recentAnimeContainer = document.getElementById('recent-anime-container');
const newAnimeContainer = document.getElementById('new-anime-container');
const actionAnimeContainer = document.getElementById('action-anime-container');
const episodesContainer = document.getElementById('episodes-container');
const animeListContainer = document.getElementById('anime-list-container');
const favoritesListContainer = document.getElementById('favorites-list');
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let searchTimeout = null;

tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.getAttribute('data-target');

        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(target).classList.add('active');
        
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

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
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchText)}`);
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
    animeListContainer.innerHTML = '<p id="loadingMessage">Cargando todos los animes...</p>';

    try {
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        while (page <= 80) {  
            const response = await fetch(`https://api.jikan.moe/v4/anime?page=${page}`);
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
        const response = await fetch(`https://api.jikan.moe/v4/anime?start_date=2024-10-01&status=airing`);
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

    const isFavorite = favorites.some(fav => fav.mal_id === anime.mal_id);

    animeCard.innerHTML = `
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
        <h3>${anime.title}</h3>
        <button data-anime-id="${anime.mal_id}" class="favorite-btn">
            ${isFavorite ? '❤️ Favorito' : '♡ Añadir a favoritos'}
        </button>
    `;

    animeCard.addEventListener('click', (e) => {
        if (!e.target.classList.contains('favorite-btn')) {
            loadEpisodes(anime.mal_id, anime.title);
        }
    });

    animeCard.querySelector('.favorite-btn').addEventListener('click', (e) => {
        e.stopPropagation(); // Evita que el clic active la tarjeta
        const id = anime.mal_id;
        const index = favorites.findIndex(fav => fav.mal_id === id);

        if (index > -1) {
            favorites.splice(index, 1);
            e.target.textContent = '♡ Añadir a favoritos';
            updateFavoriteIcons(id, false);
        } else {
            favorites.push(anime);
            e.target.textContent = '❤️ Favorito';
            updateFavoriteIcons(id, true);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
    });

    return animeCard;
}

function updateFavoriteIcons(animeId, isFavorite) {
    const favButtons = document.querySelectorAll(`button.favorite-btn[data-anime-id="${animeId}"]`);
    favButtons.forEach(button => {
        button.textContent = isFavorite ? '❤️ Favorito' : '♡ Añadir a favoritos';
    });
}

async function loadEpisodes(animeId, animeTitle) {
    try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/episodes`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const episodes = data.data;

        let watchedEpisodes = JSON.parse(localStorage.getItem('watchedEpisodes')) || {};
        if (!watchedEpisodes[animeId]) watchedEpisodes[animeId] = [];

        episodesContainer.innerHTML = `
            <h2>Episodios de ${animeTitle}</h2>
            <div class="episode-list">
                ${episodes
                    .map(episode => {
                        const watched = watchedEpisodes[animeId].includes(episode.mal_id);
                        return `
                            <div class="episode-card" data-episode-id="${episode.mal_id}" style="${watched ? 'border: 3px solid #ff6f61;' : 'border: 1px solid #ccc;'}">
                                <h3>${episode.title}</h3>
                                <p>Episodio ${episode.mal_id}</p>
                                <a href="${episode.url}" target="_blank" rel="noopener noreferrer" class="view-episode">Ver ahora</a>
                            </div>
                        `;
                    })
                    .join('')}
            </div>
        `;

        const viewEpisodeLinks = episodesContainer.querySelectorAll('.view-episode');
        viewEpisodeLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault(); 

                const episodeCard = e.target.closest('.episode-card');
                const episodeId = parseInt(episodeCard.getAttribute('data-episode-id'), 10);

                if (!watchedEpisodes[animeId].includes(episodeId)) {
                    watchedEpisodes[animeId].push(episodeId);
                    episodeCard.style.border = '3px solid #ff6f61'; 
                    localStorage.setItem('watchedEpisodes', JSON.stringify(watchedEpisodes));
                }

                window.open(link.href, '_blank', 'noopener');
            });
        });

        sections.forEach(section => section.classList.remove('active'));
        document.getElementById('episodes').classList.add('active');
    } catch (error) {
        console.error("Error al cargar episodios:", error);
        episodesContainer.innerHTML = `<p>Ocurrió un error al cargar los episodios: ${error.message}</p>`;
    }
}


function loadFavorites() {
    favoritesListContainer.innerHTML = '';

    if (!favorites || favorites.length === 0) {
        favoritesListContainer.innerHTML = '<p>No tienes animes favoritos aún.</p>';
        return;
    }

    favorites.forEach(fav => {
        const animeCard = document.createElement('div');
        animeCard.classList.add('favorite-anime-card');
        animeCard.innerHTML = `
            <img src="${fav.images.jpg.image_url}" alt="${fav.title}" loading="lazy" width="100">
            <h4>${fav.title}</h4>
            <button data-anime-id="${fav.mal_id}" class="remove-favorite-btn">Eliminar</button>
        `;

        animeCard.querySelector('.remove-favorite-btn').addEventListener('click', (e) => {
            favorites = favorites.filter(f => f.mal_id !== fav.mal_id);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            loadFavorites();
            updateFavoriteIcons(fav.mal_id, false);
        });

        favoritesListContainer.appendChild(animeCard);
    });
}

loadRecentAnimes();
if (typeof loadCategorizedAnimes === 'function') loadCategorizedAnimes();
