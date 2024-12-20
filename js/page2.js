import { API_BASE, options } from './options.js';

const inputsPerson1 = document.querySelectorAll('.choix .choix1:first-of-type input');
const inputsPerson2 = document.querySelectorAll('.choix .choix1:last-of-type input');

const filmsList = document.getElementById('filmsList');
const inputsFilter = document.getElementsByTagName('input');

Array.from(inputsFilter).forEach(input => {
    input.addEventListener('input', async () => {
        const query = input.value.trim();

        if(!query) { return };

        const searchResponse = await fetch(`${API_BASE}/search/movie?query=${query}`, options);
        const searchData = await searchResponse.json();

        filmsList.innerHTML = '';

        searchData.results.forEach((movie) => {
            const option = document.createElement('option');
            option.value = movie.original_title;
            filmsList.appendChild(option);
        });
    });
});

const compatibilitySection = document.createElement('section');
compatibilitySection.className = 'compatibility';

const resultsSection = document.createElement('section');
resultsSection.className = 'results';

document.querySelector('main').appendChild(compatibilitySection);
document.querySelector('main').appendChild(resultsSection);

async function getKeywordsByTitle(title) {
    try {
        const searchResponse = await fetch(`${API_BASE}/search/movie?query=${title.trim()}`, options);
        const searchData = await searchResponse.json();
        if (searchData.results.length > 0) {
            const movieId = searchData.results[0].id;
            const keywordsResponse = await fetch(`${API_BASE}/movie/${movieId}/keywords`, options);
            const keywordsData = await keywordsResponse.json();
            return keywordsData.keywords.map((keyword) => keyword.id);
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des mots-clés pour "${title}":`, error);
    }
    return [];
}

async function getMoviesByKeywords(keywords) {
    const movies = [];
    for(const keyword of keywords) {
        try {
            const response = await fetch(`${API_BASE}/discover/movie?with_keywords=${keyword}`, options);
            const data = await response.json();
            movies.push(...data.results);
        } catch (error) {
            console.error(`Erreur lors de la récupération des films pour le mot-clé "${keyword}":`, error);
        }
    }
    return movies;
}

function countKeywordOccurrences(keywords) {
    const keywordCounts = {};
    keywords.forEach((keyword) => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    return Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([keyword]) => keyword);
}

async function findCompatibleMovies() {
    resultsSection.innerHTML = '<p>Chargement des résultats...</p>';
    compatibilitySection.innerHTML = '';

    const person1Movies = Array.from(inputsPerson1).map((input) => input.value.trim());
    const person2Movies = Array.from(inputsPerson2).map((input) => input.value.trim());

    const [keywords1, keywords2] = await Promise.all([
        Promise.all(person1Movies.map(getKeywordsByTitle)),
        Promise.all(person2Movies.map(getKeywordsByTitle)),
    ]);

    const uniqueKeywords1 = [...new Set(keywords1.flat())];
    const uniqueKeywords2 = [...new Set(keywords2.flat())];
    const commonKeywords = uniqueKeywords1.filter((keyword) => uniqueKeywords2.includes(keyword));

    if (commonKeywords.length === 0) {
        resultsSection.innerHTML = '<p>Aucun mot-clé commun trouvé entre les films des deux personnes.</p>';
        return;
    }

    const sortedKeywords = countKeywordOccurrences(commonKeywords);
    const compatibleMovies = await getMoviesByKeywords(sortedKeywords);

    const enteredMovies = [...person1Movies, ...person2Movies].map(title => title.toLowerCase().trim());
    const topMovies = compatibleMovies
        .filter(movie => !enteredMovies.includes(movie.title.toLowerCase().trim()))
        .slice(0, 5);


    if (topMovies.length > 0) {
        const commonKeywordsPercentage = Math.round((commonKeywords.length / uniqueKeywords1.length) * 100);

        compatibilitySection.innerHTML = `<p>Compatibilité basée sur les mots-clés communs : ${commonKeywordsPercentage}%</p>`;

        displayMovies(topMovies);
    } else {
        resultsSection.innerHTML = '<p>Aucun film compatible trouvé.</p>';
    }
}

function displayMovies(movies) {
    resultsSection.innerHTML = '';
    const list = document.createElement('ul');
    movies.forEach((movie) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" />
            <h3>${movie.title}</h3>
            <p>Note&nbsp;: ${movie.vote_average} | Date de sortie&nbsp;: ${movie.release_date}</p>
        `;
        list.appendChild(listItem);
    });
    resultsSection.appendChild(list);
}

document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
        findCompatibleMovies();
    });
});
