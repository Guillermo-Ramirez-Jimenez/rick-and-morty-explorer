const API_URL = 'https://rickandmortyapi.com/api';
const CHARACTERS_URL = API_URL + '/character';
const LOCATIONS_URL = API_URL + '/location';
const EPISODES_URL = API_URL + '/episode';

const popup = document.getElementById('popup');
const loadMoreButton = document.getElementById('characters__load_more');

let nextPage = CHARACTERS_URL;

console.log('Page loaded');

// Fetches the character page specified on the url
const getCharacters = async (url) => {
    let characters = await fetch(url);
    if (!characters.ok) {
        if (characters.status === 404) {
            throw new Error("No results for this search");
        }
        throw new Error(`Error HTTP: ${characters.status}`);
    }
    return await characters.json();
}

// Adds characters to container and deletes the previous ones if needed
const fetchCharacters = async (url, clear=true) => {
    const characterContainer = document.getElementById('characters__container');
    const charactersSpinner = document.getElementById('characters__spinner');
    const emptySearch = document.getElementById('characters__error');
    if(clear) characterContainer.innerHTML = '';
    charactersSpinner.style.display = 'block';
    loadMoreButton.style.display = 'none';
    emptySearch.style.display = 'none';
    try {
        const characters = await getCharacters(url);
        nextPage = characters.info?.next;
        for(let character of characters.results) {
            characterContainer.append(buildListCharacter(character));
        };
    } catch(error) {
        console.warn(error);
        emptySearch.style.display = 'block';
        nextPage = null;
    } finally {
        charactersSpinner.style.display = 'none';
        if(nextPage) {
            loadMoreButton.style.display = 'block';
        };
    }
}

// Fetches a single character and returns data
const getCharacter = async (url) => {
    let character = await fetch(url);
    return await character.json();
};

// Builds the character info in the popup
const buildPopupCharacter = (character) => {
    let popupImg = popup.querySelector('#popup__container__img');
    popupImg.setAttribute('src', character.image);
    let popupTitle = popup.querySelector('#popup__container__title');
    popupTitle.textContent = character.name;
    let popupData = popup.querySelector('#popup__container__data');
    let episodes = character.episode.map((url) => url.split('episode/')[1]);
    popupData.innerHTML = `
        <p>Name: ${character.name}</p>
        <p>Gender: ${character.gender}</p>
        <p>Species: ${character.species}</p>
        <p>Status: ${character.status}</p>
        <p>Location: ${character.location.name}</p>
        <p>Origin: ${character.origin.name}</p>
        <p>Episode list: ${episodes.join(', ')}</p>
    `;
}

// Callback for clicking on a character and showing popup
const characterClick = async (event) => {
    const popupContainer = document.getElementById('popup__container');
    const popupSpinner = document.getElementById('popup__spinner');
    popupContainer.style.display = 'none';
    popupSpinner.style.display = 'block';
    popup.style.visibility = 'visible';
    let characterURL = event.currentTarget.dataset.url;
    let character = await getCharacter(characterURL);
    console.log(`Clicked on: ${characterURL}`);
    buildPopupCharacter(character);
    popupSpinner.style.display = 'none';
    popupContainer.style.display = 'block';
};

// Builds a character and returns the element
const buildListCharacter = (character) => {
    let container = document.createElement('div');
    container.className = 'character';
    container.setAttribute('data-url', character.url);
    let img = document.createElement('img');
    img.className = 'character__img';
    img.setAttribute('src', character.image);
    container.append(img);
    let data = document.createElement('div');
    data.className = 'character__data';
    data.innerHTML = `
        <p>Name: ${character.name}</p>
        <p>Gender: ${character.gender}</p>
        <p>Species: ${character.species}</p>
        <p>Status: ${character.status}</p>
    `;
    container.append(data);
    container.addEventListener('click', characterClick);
    return container;
};

// Callback for closing the popup
const closeClick = () => {
    console.log('Clicked on popup close');
    popup.style.visibility = 'hidden';
};

// Callback for updating the search field
const search = () => {
    let searchTerm = document.getElementById('search__bar').value;
    let searchStatus = document.getElementById('status').value;
    let searchSpecies = document.getElementById('species').value;
    let searchURL = CHARACTERS_URL+'/?name='+searchTerm;
    if (searchStatus) searchURL+='&status='+searchStatus;
    if (searchSpecies) searchURL+='&species='+searchSpecies;
    fetchCharacters(searchURL);
    console.log(`Searched for: ${searchURL}`);
}

// Callback for load more button
const loadMore = () => {
    console.log('Loading more characters');
    fetchCharacters(nextPage, false);
}

document.getElementById('popup__container__close').addEventListener('click', closeClick);
document.getElementById('search').addEventListener('input', search);
loadMoreButton.addEventListener('click', loadMore);

search(nextPage);
