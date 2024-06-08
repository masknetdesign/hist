// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBkrBLKuklZgPm1nz2G997ULiYycZMb9F8",
    authDomain: "avisoseeventos.firebaseapp.com",
    projectId: "avisoseeventos",
    storageBucket: "avisoseeventos.appspot.com",
    messagingSenderId: "247706769451",
    appId: "1:247706769451:web:ce31cd9d0ca22cd267b26e"
};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

let allResults = [];

function checkUserAuth() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (!user) window.location.href = "login.html";
    });
}

function loadResults() {
    const resultList = document.getElementById('result-list');
    resultList.innerHTML = '';

    firestore.collection('entries').get().then(querySnapshot => {
        if (querySnapshot.empty) {
            resultList.innerHTML = '<li>Nenhum resultado encontrado.</li>';
            return;
        }
        allResults = querySnapshot.docs.map(doc => doc.data());
        renderResults(allResults);
    }).catch(error => console.error('Erro ao carregar os resultados:', error));
}

function renderResults(results) {
    const resultList = document.getElementById('result-list');
    resultList.innerHTML = '';

    results.forEach(data => {
        const { title, videoUrls, logoUrl } = data;
        const videoUrl = videoUrls && videoUrls.length > 0 ? encodeURIComponent(videoUrls[0]) : '';
        resultList.innerHTML += `
            <li class="list-item" data-video-url="${videoUrl}">
                <img src="${logoUrl}" alt="Logo">
                <span>${title}</span>
            </li>`;
    });

    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach(item => {
        item.addEventListener('click', function () {
            const videoUrl = this.getAttribute('data-video-url');
            if (videoUrl) showModal(decodeURIComponent(videoUrl));
            else alert('URL do vídeo não encontrada.');
        });
    });
}

function showModal(videoUrl) {
    const videoSource = document.getElementById('video-source');
    const videoPlayer = document.getElementById('video-player');
    videoSource.src = videoUrl;
    videoPlayer.load();
    const videoModal = document.getElementById('video-modal');
    if (!videoModal) return; // Verifica se o elemento existe
    videoModal.style.display = 'block';
    checkFavoriteStatus(encodeURIComponent(videoUrl));
}

function checkFavoriteStatus(videoUrl) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const userId = user.uid;
    const favoriteRef = firestore.collection('users').doc(userId).collection('favorites').doc(videoUrl);

    favoriteRef.get().then(docSnapshot => {
        const favoriteButton = document.getElementById('favorite-button');
        if (docSnapshot.exists && docSnapshot.data().favorited === true) {
            favoriteButton.classList.add('favorited');
        } else {
            favoriteButton.classList.remove('favorited');
        }
    }).catch(error => console.error('Erro ao verificar status do favorito:', error));
}

function closeModal() {
    const videoModal = document.getElementById('video-modal');
    if (!videoModal) return; // Verifica se o elemento existe
    videoModal.style.display = 'none';
    const videoSource = document.getElementById('video-source');
    videoSource.src = '';
}

function addToFavorites(videoUrl) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error('Usuário não autenticado.');
        return;
    }

    const userId = user.uid;
    const favoritesRef = firestore.collection('users').doc(userId).collection('favorites');

    const decodedVideoUrl = decodeURIComponent(videoUrl); // Decodifica a URL antes de usar

    // Remove as barras duplicadas no URL do vídeo
    const cleanVideoUrl = decodedVideoUrl.replace(/\/+/g, '/');

    // Verifica se o vídeo já está nos favoritos
    favoritesRef.doc(cleanVideoUrl).get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            // Vídeo já está nos favoritos, então remove
            favoritesRef.doc(cleanVideoUrl).update({
                favorited: false
            }).then(() => {
                console.log('Vídeo removido dos favoritos.');
                document.getElementById('favorite-button').classList.remove('favorited');
            }).catch((error) => {
                console.error('Erro ao remover dos favoritos:', error);
            });
        } else {
            // Vídeo não está nos favoritos, então adiciona
            favoritesRef.doc(cleanVideoUrl).set({
                favorited: true
            }).then(() => {
                console.log('Vídeo adicionado aos favoritos.');
                document.getElementById('favorite-button').classList.add('favorited');
            }).catch((error) => {
                console.error('Erro ao adicionar aos favoritos:', error);
            });
        }
    }).catch((error) => {
        console.error('Erro ao verificar o status do favorito:', error);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    checkUserAuth();
    loadResults();
});

// Adiciona os manipuladores de eventos apenas se os elementos existirem
const closeButton = document.getElementById('close-button');
if (closeButton) closeButton.addEventListener('click', closeModal);

const searchIcon = document.getElementById('search-icon');
if (searchIcon) searchIcon.addEventListener('click', function () {
    const searchTerm = prompt('Digite o termo de busca:');
    if (searchTerm) {
        const filteredResults = allResults.filter(data =>
            data.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        renderResults(filteredResults);
    }
});

const profileIcon = document.getElementById('profile-icon');
if (profileIcon) profileIcon.addEventListener('click', function () {
    window.location.href = 'login.html';
});

const favoriteIcon = document.getElementById('favorite-icon');
if (favoriteIcon) favoriteIcon.addEventListener('click', function () {
    window.location.href = 'favorites.html';
});

const favoriteButton = document.getElementById('favorite-button');
if (favoriteButton) {
    favoriteButton.addEventListener('click', function () {
        const videoUrl = document.getElementById('video-source').getAttribute('src');
        addToFavorites(videoUrl);
    });
}
