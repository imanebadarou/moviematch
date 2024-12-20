import { API_BASE, options } from "./options.js"

const selectFilter = document.getElementById('filtre-select');
const inputFilter = document.getElementById('filtre-input');
const suggestions = document.getElementById('suggestions');
const resultsSection = document.getElementById('results');

async function updateSuggestions(filter) {
    suggestions.innerHTML = '';

    switch(filter) {
        case 'genre':
            const genresResponse = await fetch(`${API_BASE}/genre/movie/list`, options);
            const genresData = await genresResponse.json();

            genresData.genres.forEach((genre) => {
                const option = document.createElement('option');
                option.value = genre.name;
                suggestions.appendChild(option);
            });
            break;
        case 'acteur':
        case 'realisateur':
            inputFilter.addEventListener('input', async () => {
                const query = inputFilter.value.trim();
                
                const searchResponse = await fetch(`${API_BASE}/search/person?query=${query}`, options);
                const searchData = await searchResponse.json();

                suggestions.innerHTML = '';
                searchData.results.forEach((person) => {
                    const option = document.createElement('option');
                    option.value = person.name;
                    suggestions.appendChild(option);
                });
            });
            break;
        case 'note':
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((note) => {
                const option = document.createElement('option');
                option.value = note.toString();
                suggestions.appendChild(option);
            });
            break;
        case 'date':
            const currentYear = new Date().getFullYear();
            for (let year = currentYear; year >= 1900; year--) {
                const option = document.createElement('option');
                option.value = year.toString();
                suggestions.appendChild(option);
            }
            break;
        default:
            suggestions.innerHTML = '';
            break;
    }
}

async function fetchMoviesByFilter(filter, value) {
    let url = `${API_BASE}/discover/movie?`;
    switch (filter) {
        case 'date':
            url += `primary_release_year=${value}`;
            break;
        case 'acteur':
        case 'realisateur':
            const personType = filter === 'acteur' ? 'Acteur' : 'Réalisateur';
            const personResponse = await fetch(`${API_BASE}/search/person?query=${value}`, options);
            const personData = await personResponse.json();
            if (personData.results.length > 0) {
                const personId = personData.results[0].id;
                url += `with_people=${personId}`;
            } else {
                displayError(`Aucun ${personType} trouvé pour "${value}"`);
                return;
            }
            break;
        case 'note':
            url += `vote_average.lte=${value}`;
            break;
        case 'genre':
            const genresResponse = await fetch(`${API_BASE}/genre/movie/list`, options);
            const genresData = await genresResponse.json();
            const genre = genresData.genres.find((g) => g.name.toLowerCase() === value.toLowerCase());
            if (genre) {
                url += `with_genres=${genre.id}`;
            } else {
                displayError(`Aucun genre trouvé pour "${value}"`);
                return;
            }
            break;
        default:
            displayError('Veuillez sélectionner un filtre valide.');
            return;
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        displayError('Erreur lors de la recherche. Veuillez réessayer.');
    }
}

function displayMovies(movies) {
    resultsSection.innerHTML = '';
    if (movies.length === 0) {
        resultsSection.innerHTML = '<p>Aucun film trouvé.</p>';
        return;
    }

    const carousel = document.createElement('div');
    carousel.className = 'carousel';

    movies.forEach((movie) => {
        const card = document.createElement('div');
        card.className = 'carousel-item';
        card.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
            <h3>${movie.title}</h3>
            <p>Note&nbsp;: ${movie.vote_average} | Date de sortie&nbsp;: ${movie.release_date}</p>
        `;
        carousel.appendChild(card);
    });

    resultsSection.appendChild(carousel);
}

function displayError(message) {
    resultsSection.innerHTML = `<p class="error">${message}</p>`;
}

selectFilter.addEventListener('change', () => {
    const filter = selectFilter.value;
    updateSuggestions(filter);
    const value = inputFilter.value.trim();
    if (filter && value) {
        fetchMoviesByFilter(filter, value);
    }
});

inputFilter.addEventListener('input', () => {
    const filter = selectFilter.value;
    updateSuggestions(filter);
    const value = inputFilter.value.trim();
    if (filter && value) {
        fetchMoviesByFilter(filter, value);
    }
});