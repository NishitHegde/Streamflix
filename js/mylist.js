document.addEventListener("DOMContentLoaded", () => {

    const grid = document.getElementById("myListGrid");
    const emptyMessage = document.getElementById("emptyMyList");


    /*
    -----------------------------------------
    GET MY LIST
    -----------------------------------------
    */

    function getMyList() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem("myList")
                );

            if (!Array.isArray(saved)) {
                return [];
            }

            return saved.map(String);

        } catch (error) {

            console.error(
                "Unable to read My List:",
                error
            );

            return [];

        }

    }


    /*
    -----------------------------------------
    SAVE MY LIST
    -----------------------------------------
    */

    function saveMyList(list) {

        localStorage.setItem(
            "myList",
            JSON.stringify(list)
        );

    }


    /*
    -----------------------------------------
    REMOVE MOVIE
    -----------------------------------------
    */

    function removeFromMyList(id) {

        let list = getMyList();

        id = String(id);

        list = list.filter(
            movieId => movieId !== id
        );

        saveMyList(list);

        renderMyList();

    }


    /*
    -----------------------------------------
    CREATE MOVIE CARD
    -----------------------------------------
    */

    function createMovieCard(id, movie) {

        const card =
            document.createElement("article");

        card.className =
            "movie-card mylist-card";

        card.dataset.id = id;


        /*
        POSTER
        */

        const poster =
            document.createElement("div");

        poster.className = "poster";


        const image =
            document.createElement("img");

        image.src = movie.poster;

        image.alt = movie.title;

        image.loading = "lazy";


        /*
        IMAGE FALLBACK
        */

        image.onerror = function () {

            this.onerror = null;

            this.src =
                "assets/posters/poster-1.svg" +
                encodeURIComponent(movie.title);

        };


        poster.appendChild(image);


        /*
        MOVIE INFO
        */

        const info =
            document.createElement("div");

        info.className = "movie-info";


        const title =
            document.createElement("h3");

        title.textContent =
            movie.title;


        /*
        META
        */

        const meta =
            document.createElement("div");

        meta.className = "meta";


        const match =
            document.createElement("span");

        match.className = "match";

        match.textContent =
            movie.match || "90% Match";


        const year =
            document.createElement("span");

        year.textContent =
            movie.year || "";


        const rating =
            document.createElement("span");

        rating.textContent =
            movie.rating || "13+";


        meta.appendChild(match);
        meta.appendChild(year);
        meta.appendChild(rating);


        /*
        GENRE
        */

        const genre =
            document.createElement("p");

        genre.className =
            "mylist-genre";

        genre.textContent =
            movie.genres || movie.type || "";


        /*
        BUTTON AREA
        */

        const actions =
            document.createElement("div");

        actions.className =
            "mylist-actions";


        /*
        PLAY BUTTON
        */

        const play =
            document.createElement("a");

        play.className =
            "mylist-play";

        play.href =
            "movie-details.html?id=" + id;

        play.textContent =
            "▶ Details";


        /*
        REMOVE BUTTON
        */

        const remove =
            document.createElement("button");

        remove.className =
            "remove-mylist";

        remove.type = "button";

        remove.innerHTML =
            "✕ Remove";


        /*
        REMOVE EVENT
        */

        remove.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();

                removeFromMyList(id);

            }
        );


        actions.appendChild(play);

        actions.appendChild(remove);


        /*
        BUILD CARD
        */

        info.appendChild(title);

        info.appendChild(meta);

        info.appendChild(genre);

        info.appendChild(actions);


        card.appendChild(poster);

        card.appendChild(info);


        /*
        CLICK CARD
        */

        card.addEventListener(
            "click",
            function (event) {

                if (
                    event.target.closest(
                        ".remove-mylist"
                    )
                ) {
                    return;
                }

                if (
                    event.target.closest(
                        ".mylist-play"
                    )
                ) {
                    return;
                }

                window.location.href =
                    "movie-details.html?id=" +
                    id;

            }
        );


        return card;

    }


    /*
    -----------------------------------------
    RENDER MY LIST
    -----------------------------------------
    */

    function renderMyList() {

        grid.innerHTML = "";


        const list =
            getMyList();


        /*
        EMPTY LIST
        */

        if (list.length === 0) {

            emptyMessage.style.display =
                "flex";

            return;

        }


        emptyMessage.style.display =
            "none";


        /*
        ONLY SHOW SAVED MOVIES
        */

        let foundMovies = 0;


        list.forEach(id => {

            const movie =
                window.MOVIES &&
                window.MOVIES[id];


            /*
            Skip IDs that don't exist
            */

            if (!movie) {

                return;

            }


            const card =
                createMovieCard(
                    id,
                    movie
                );


            grid.appendChild(card);

            foundMovies++;

        });


        /*
        If all saved IDs are invalid
        */

        if (foundMovies === 0) {

            emptyMessage.style.display =
                "flex";

        }

    }


    /*
    -----------------------------------------
    INITIAL LOAD
    -----------------------------------------
    */

    renderMyList();


    /*
    -----------------------------------------
    UPDATE WHEN STORAGE CHANGES
    -----------------------------------------
    */

    window.addEventListener(
        "storage",
        renderMyList
    );


});