(function () {
    App = {};
    App.define = function (namespace) {
        var parts = namespace.split('.'),
            parent = App,
            i;
        if (parts[0] == "App") {
            parts = parts.slice(1);
        }
        for (i = 0; i < parts.length; i++) {
            let part = parts[i];
            if (typeof parent[part] == 'undefined') {
                parent[part] = {};
            }
            parent = parent[part];
        }
        return parent;
    }
}());

(function () {
    let storage = App.define("storage");

    storage.onDelete = [];
    storage.onPut = [];
    storage.onUpdate = [];

    storage.update = (data) => {
        localStorage.jokes = JSON.stringify(data);
        storage.onUpdate.forEach(f => f(data));
    }

    storage.put = (jokeData) => {
        let s = storage.get()
        s[jokeData.id] = jokeData;
        storage.update(s);
        storage.onPut.forEach(f => f(jokeData.id, jokeData));
    };

    storage.delete = (id) => {
        let s = storage.get()
        let jokeData = s[id];
        delete s[id];
        storage.update(s);

        storage.onDelete.forEach(f => f(id, jokeData));
    };

    storage.get = () => {
        if (localStorage.jokes) {
            return JSON.parse(localStorage.jokes);
        } else {
            return {};
        }
    };
}());

(function () {
    let main = App.define("main");
    main.baseUrl = "https://api.chucknorris.io/jokes";


    main.appendJoke = (jokeData, container, isFavorite) => {
        let fragment = document.createDocumentFragment();
        let card = document.createElement('div');
        card.classList.add('joke-card');
        let btnLike = document.createElement('label');
        btnLike.classList.add('btn-like');
        let likeCheck = document.createElement('input');
        likeCheck.type = 'checkbox';
        likeCheck.name = jokeData.id;
        card.setAttribute('id', "jk" + jokeData.id);
        if (isFavorite) {
            card.classList.add('joke-card-favourite');
            btnLike.classList.add('btn-like-favourite');
            likeCheck.checked = true;
        }
        btnLike.appendChild(likeCheck);
        card.appendChild(btnLike);
        let iconJoke = document.createElement('img');
        iconJoke.src = jokeData.icon_url;
        iconJoke.classList.add('joke-message-icon');
        card.appendChild(iconJoke);
        let jokeContent = document.createElement('div');
        jokeContent.classList.add('joke-content');
        let jokeLink = document.createElement('div');
        jokeLink.classList.add('joke-link');
        let span = document.createElement('span');
        span.innerText = 'ID:' + '\xa0';
        jokeLink.appendChild(span);
        let link = document.createElement('a');
        link.href = main.baseUrl + '/' + jokeData.id;
        link.innerText = jokeData.id;
        link.classList.add('joke-id');
        let iconLink = document.createElement('img');
        iconLink.src = './assets/link-icon.svg';
        link.appendChild(iconLink);
        jokeLink.appendChild(link);
        jokeContent.appendChild(jokeLink);
        let joke = document.createElement('span');
        joke.classList.add('joke');
        joke.innerText = jokeData.value;
        jokeContent.appendChild(joke);
        let jokeInfo = document.createElement('div');
        jokeInfo.classList.add('joke-info');
        let jokeUpdate = document.createElement('span');
        jokeUpdate.classList.add('joke-last-update');
        let update = Math.round((new Date() - Date.parse(jokeData.updated_at)) / 1000 / 60 / 60);
        jokeUpdate.innerText = 'Last update: ' + update + ' hours ago';
        jokeInfo.appendChild(jokeUpdate);
        if (jokeData.categories.length != 0) {
            jokeInfo.style.justifyContent = 'space-between';
            let jokeCategory = document.createElement('span');
            jokeCategory.classList.add('joke-category');
            jokeCategory.style.display = 'block';
            jokeCategory.innerText = jokeData.categories;
            jokeInfo.appendChild(jokeCategory);
        }
        jokeContent.appendChild(jokeInfo);
        card.appendChild(jokeContent);
        fragment.appendChild(card);


        container.appendChild(fragment);

        likeCheck.addEventListener('click', () => {
            if (likeCheck.checked) {
                likeCheck.parentElement.classList.toggle('btn-like-favourite');
                App.storage.put(jokeData);
            } else {
                App.storage.delete(jokeData.id);
            }
        })
    }

    main.appendEmptyJoke = (jokesContainer) => {
        jokesContainer.innerHTML = '';
        let fragment = document.createDocumentFragment();
        let card = document.createElement('div');
        card.classList.add('joke-card');
        let message = document.createElement('span');
        message.innerText = "nothing is found";
        message.classList.add('manual-category-not-matches');
        card.appendChild(message);
        fragment.appendChild(card);
        jokesContainer.appendChild(fragment);
    }

    //scroll
    let btnScrollUp = document.querySelector('.btn-scroll-up');
    window.onscroll = () => {
        if (document.body.scrollTop > 350 || document.documentElement.scrollTop > 350) {
            btnScrollUp.style.display = 'block';
        } else {
            btnScrollUp.style.display = 'none';
        }
    }
    btnScrollUp.onclick = () => { window.scrollTo(0, 0); };


    main.startLoader = (parent) => {
        parent.innerHTML = '';
        let fragment = document.createDocumentFragment();
        let img = document.createElement('img');
        img.src = './assets/loader.svg';
        img.classList.add('loader');
        fragment.appendChild(img);
        parent.appendChild(fragment);
    }

    main.stopLoader = (parent) => {
        parent.innerHTML = '';
    }

    main.getData = (url, place) => {
        main.startLoader(place);
        return fetch(url)
            .then(resp => {
                return resp.json();
            })
            .catch(err => {
                alert('Service error: ', err);
            });
    }
})();

//animations
(function() {
let main = document.querySelector('.main-page');
let btnMenu = document.querySelector('.hamburger-menu');
let navBar = document.querySelector('.navbar');
let favourMenu = document.querySelector('.favourite-container');
let humbrMenu = document.querySelector('.hamburger-menu');
let openMenu = () => {
    favourMenu.classList.toggle('favourite-container-open'); 
    humbrMenu.classList.toggle('change');
    navBar.classList.toggle('navbar-top-space');
    main.classList.toggle('main-page-close');
}
btnMenu.onclick = openMenu;

})();



