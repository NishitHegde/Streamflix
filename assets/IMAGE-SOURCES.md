# Streamflix artwork sources

Streamflix uses real remote artwork rather than generated title cards. Existing English titles use TMDB image URLs. Hindi movies and series are resolved at runtime from Wikipedia/Wikimedia page thumbnails when the catalog does not already contain a TMDB poster path.

TMDB documents its poster/backdrop URL format at https://developer.themoviedb.org/docs/image-basics. Wikipedia provides page summaries and thumbnails without requiring an application API key. An internet connection is required for remote artwork.

The project includes the required TMDB attribution notice in the footer/README. This fan-made frontend is not affiliated with Netflix or TMDB.
