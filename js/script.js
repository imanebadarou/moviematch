async function afficherFilms() {
    movie_id = 912649
    const response = await fetch('https://api.themoviedb.org/3/discover/movie', options); // Tous les films
    //const response = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}`, options); // Details d'un film
    //const response = await fetch('https://api.themoviedb.org/3/genre/movie/list', options); // Tous les genres
    //const response = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}/keywords`, options); // Récup mots clés d'un film
    //const response = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}/images`, options); // Récup images d'un film
    //const response = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}/credits`, options); // Récup la distribution + équipe d'un film
    //const response = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}/similar`, options); // Récup liste de films similaire
    data = await response.json();
    console.log(data)

    /*divElem = document.getElementsByClassName('content')[0];
    list = document.createElement('ul');

    data.results.forEach((element) => {
        elem = document.createElement('li');
        img = document.createElement('img');
        img.src = "https://image.tmdb.org/t/p/w500"+element.poster_path;

        elem.appendChild(img)

        text = document.createTextNode(element.original_title);

        elem.appendChild(text);
        list.appendChild(elem);
        
    })
    divElem.appendChild(list)*/
}

afficherFilms()