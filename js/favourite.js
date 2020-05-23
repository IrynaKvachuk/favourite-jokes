(function () {
    let favouriteContainer = document.querySelector('.favourite-container');

    App.storage.onDelete.push((id, jokeData) => {
        let joke = favouriteContainer.querySelector('#jk' + id);
        joke.remove();
    });

    App.storage.onPut.push((id, jokeData) => {
        App.main.appendJoke(jokeData, favouriteContainer, true);
    });

    let storage = App.storage.get();
    for (const id in storage) {
        App.main.appendJoke(storage[id], favouriteContainer, true);
    }
})();