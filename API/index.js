const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const { existsSync } = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST;
const tmdbBaseUrl = "https://api.themoviedb.org/3";
const secretsPath = path.join(__dirname, "secrets", "secrets.json");
const topRatedPath = path.join(__dirname, "secrets", "top-rated.js");
const tmdbToken = process.env.TMDB_TOKEN?.trim() ||
  (existsSync(secretsPath) ? require(secretsPath).token : undefined);
const cachedTopRated = existsSync(topRatedPath) ? require(topRatedPath) : null;
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
    return sendTmdbError(res, error);
  }
});

app.get("/top-rated", async (_req, res) => {
  if (cachedTopRated) return res.json(cachedTopRated);

  try {
    return res.json(await fetchTmdb("/movie/top_rated"));
  } catch (error) {
    return sendTmdbError(res, error);
  }
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
  const { results } = await fetchTmdb("/discover/movie?" + query);
  return results.slice(0, 5);
}

async function fetchTmdb(endpoint) {
  if (!tmdbToken) {
    const error = new Error("Configure TMDB_TOKEN with a TMDB API Read Access Token.");
    error.type = "missing-token";
    throw error;
  }

  const response = await fetch(tmdbBaseUrl + endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${tmdbToken}`,
    },
    redirect: "error",
    timeout: 8000,
  });

  if (!response.ok) {
    throw new Error(`TMDB returned HTTP ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data?.results)) {
    throw new Error("TMDB returned an invalid movie list.");
  }
  return data;
}

function sendTmdbError(res, error) {
  console.error("TMDB request failed:", error.message);
  if (error.type === "missing-token") {
    return res.status(503).json({ error: "Movie data is temporarily unavailable." });
  }
  if (error.type === "request-timeout" || error.type === "body-timeout") {
    return res.status(504).json({ error: "TMDB took too long to respond." });
  }
  return res.status(502).json({ error: "Movie data is temporarily unavailable." });
}

app.listen(PORT, HOST, () => {
  console.log(`MoodFlicks API listening on port ${PORT}`);
});
