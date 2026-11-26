const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const secrets = require("./secrets/secrets.json");
const topRated = require("./secrets/top-rated");

const app = express();
const PORT = process.env.PORT || 3002;
const moviesEndpoint = "https://api.themoviedb.org/3/discover/movie";
const langs = ["de", "ja", "es", "hi", "ko", "en", "ru"];

app.use(cors());
app.use(express.json());

app.get("/recommendations", async (req, res) => {
  const { releaseDateGte, releaseDateLte, genre_code: genreCodes } = req.query;

  if (!isDate(releaseDateGte) || !isDate(releaseDateLte) || releaseDateGte > releaseDateLte) {
    return res.status(400).json({ error: "Provide a valid release date range in YYYY-MM-DD format." });
  }
  if (typeof genreCodes !== "string" || !/^[1-9]\d*(?:[,|][1-9]\d*)*$/.test(genreCodes)) {
    return res.status(400).json({ error: "Provide valid TMDB genre IDs in genre_code." });
  }

  const filters = {
    "primary_release_date.gte": releaseDateGte,
    "primary_release_date.lte": releaseDateLte,
    with_genres: genreCodes,
    "vote_count.gte": "100",
    include_video: "true",
    sort_by: "popularity.desc",
  };

  try {
    const filmsByLanguage = await Promise.all(langs.map(lang => fetchMovies(filters, lang)));
    return res.json(filmsByLanguage.flat());
  } catch (error) {
    console.error("TMDB recommendations failed:", error.type || error.message);
    if (error.type === "request-timeout" || error.type === "body-timeout") {
      return res.status(504).json({ error: "TMDB took too long to respond." });
    }
    return res.status(502).json({ error: "TMDB recommendations are temporarily unavailable." });
  }
});

app.get("/top-rated", (_req, res) => {
  res.send(topRated);
});

function isDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function fetchMovies(filters, lang) {
  const query = new URLSearchParams({ ...filters, with_original_language: lang });
  const response = await fetch(moviesEndpoint + "?" + query, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${secrets.token}`,
    },
    redirect: "error",
    timeout: 8000,
  });

  if (!response.ok) {
    throw new Error(`TMDB returned HTTP ${response.status} for language ${lang}`);
  }
  const { results } = await response.json();
  if (!Array.isArray(results)) {
    throw new Error(`TMDB returned an invalid movie list for language ${lang}`);
  }
  return results.slice(0, 5);
}

app.listen(PORT, () => {
  console.log(`${PORT}`);
});
