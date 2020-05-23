//search
(function () {
    let search = App.define("main.search");
    let error = document.querySelector('.error-message');
    let block = document.querySelector('.free-text');
    let input = document.querySelector('.manual-category');

    function valodateInput(input) {
        if (input.length < 3) {
            return 'Please, enter value that contains more than 2 symbols.';
        }
        const satisfyValue = /^[a-zA-Z0-9\s]{2,}$/;
        if (!input.match(satisfyValue)) {
            return 'Value should contains letters of the latin alphabet or numbers.';
        }
        return "";
    }

    search.reset = () => {
        block.style.display = 'none';
    }
    search.show = () => {
        error.style.display = 'none';
        input.value = "";
        input.style.display = 'inline';
        block.style.display = 'block';
        input.addEventListener('keypress', k => {
            if (k.key === 'Enter') {
                selectTypeSearch();
            }
        });
    }
    let showError = (message, displayValue) => {
        error.innerText = message;
        error.style.display = displayValue;
        if (message != "") {
            input.classList.add('manual-category-error');
        } else {
            input.classList.remove('manual-category-error');
        }
    }
    search.getUrl = () => {
        let query = input.value.replace(/\s+/, " ");
        let errorMessage = valodateInput(query);
        if (errorMessage) {
            showError(errorMessage, 'block');
            return;
        } else {
            showError('', 'none')
            return App.main.baseUrl + '/search?query=' + query;
        }
    };
})();

//category
(function () {
    let category = App.define("main.category");
    let container = document.querySelector('.categories-container');
    let selected, selectedParent;

    let appendCategory = (arr) => {
        let fragment = document.createDocumentFragment();
        for (let i = 0; i < arr.length; i++) {
            let lab = document.createElement('label');
            lab.classList.add('radio-category');
            lab.classList.add('btn-category');
            lab.innerText = arr[i];
            let inp = document.createElement('input');
            inp.type = 'radio';
            inp.name = 'category';
            inp.value = arr[i];
            lab.appendChild(inp);
            fragment.appendChild(lab);
        }
        container.innerHTML = '';
        container.appendChild(fragment);
    }

    let select = (category) => {
        if (selectedParent != undefined) {
            selectedParent.classList.remove('category-checked');
        }
        selectedParent = category.parentElement;
        selected = category.value;
        category.parentElement.classList.add('category-checked');
    }

    let chooseCategory = (categories) => {
        select(categories[0]);
        categories.forEach(item => {
            item.addEventListener('click', () => {
                select(item);
            })
        })
    }

    let getCategories = () => {
        container.style.display = 'flex';
        if (typeof categories === 'undefined') {
            App.main.getData(App.main.baseUrl + '/categories', container).then(data => {
                categories = data;
                appendCategory(categories);
                let radios = document.getElementsByName('category');
                chooseCategory(radios);
            });
        }
    }

    category.show = () => {
        getCategories();
    }
    category.reset = () => {
        container.style.display = 'none';
    }
    category.getUrl = () => {
        return App.main.baseUrl + '/random?category=' + selected;
    }
})();

//type
(function () {
    let searchTypesRadios = document.getElementsByName('searchType');
    let main = App.define("main");
    main.selectedType = "random";


    function resetSelection() {
        App.main.category.reset();
        App.main.search.reset();
    }

    searchTypesRadios.forEach(item => {
        item.addEventListener('click', () => {
            resetSelection();
            switch (item.value) {
                case "fromCategories":
                    App.main.category.show()
                    break;
                case "manualCategory":
                    App.main.search.show();
                    break;
            }
            main.selectedType = item.value;
        })
    })
})();

//result
(function () {
    let btnGetJoke = document.querySelector('.btnGetJoke');
    let btnGetMore = document.querySelector('.btn-get-more');
    let jokesContainer = document.querySelector('.jokes-container');
    let temporaryStorage = [];

    let main = App.define("main");

    App.storage.onDelete.push((id, joke) => {
        let jokeLeft = jokesContainer.querySelector('#jk' + id);
        if (jokeLeft) {
            let like = jokeLeft.querySelector('.btn-like');
            like.classList.toggle('btn-like-favourite');
            like.querySelector('input').checked = false;
        }
    });

    function resetResult() {
        btnGetMore.style.display = 'none';
        jokesContainer.innerHTML = '';
    }

    let getUrl = () => {
        switch (main.selectedType) {
            case 'random':
                return App.main.baseUrl + '/random'
            case 'fromCategories':
                return App.main.category.getUrl();
            case 'manualCategory':
                return App.main.search.getUrl();
        }
    }

    let showFewJokes = (arr) => {
        if (arr.result.length == 0) {
            App.main.appendEmptyJoke(jokesContainer);
        }
        let to = arr.result.length >= 10 ? 10 : arr.result.length;
        for (let i = 0; i < to; i++) {
            App.main.appendJoke(arr.result[0], jokesContainer);
            arr.result.shift();
        }
        temporaryStorage = arr;
        btnGetMore.style.display = arr.result.length > 0 ? 'block' : 'none';
    }

    let getJoke = (url, func) => {
        App.main.getData(url, jokesContainer).then(data => {
            App.main.stopLoader(jokesContainer);
            if (data.total === undefined) {
                data = { total: 1, result: [data] };
            }
            func(data, jokesContainer);
        })
    }

    btnGetJoke.onclick = () => {
        resetResult();
        let url = getUrl(main.selectedType);
        if (url) {
            getJoke(url, showFewJokes);
        }
    };
    btnGetMore.onclick = () => { showFewJokes(temporaryStorage); };

})();