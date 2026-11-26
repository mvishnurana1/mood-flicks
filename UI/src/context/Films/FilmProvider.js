import { useEffect, useRef, useState } from 'react';
import { filmContext } from './FilmContext';
import { url } from '../url';
import { genres } from '../../helper';

export function FilmProvider({ children }) {
    const [topRatedFilms, setTopRatedFilms] = useState([]);
    const [filmRecommendations, setFilmRecommendations] = useState([]);
    const [status, setStatus] = useState('idle');
    const [seen, setSeen] = useState(() => JSON.parse(localStorage.getItem('seen')) ?? []);
    const requestNumber = useRef(0);

    useEffect(() => {
        const controller = new AbortController();
        async function loadPosters() {
            try {
                const response = await fetch(url + '/top-rated', { signal: controller.signal });
                if (response.ok) {
                    const data = await response.json();
                    setTopRatedFilms(data.results ?? []);
                }
            } catch {
                // The landing page also has a bundled poster for offline use.
            }
        }
        loadPosters();
        return () => controller.abort();
    }, []);

    async function fetchRecommendations({ era, genre }) {
        const current = ++requestNumber.current;
        setStatus('loading');
        const params = new URLSearchParams({
            releaseDateGte: era.from,
            releaseDateLte: era.to,
            genre_code: genres.find(item => item.name === genre).id,
        });
        try {
            const response = await fetch(url + '/recommendations?' + params);
            if (!response.ok) throw new Error('Request failed');
            const films = await response.json();
            if (!Array.isArray(films)) throw new Error('Invalid recommendations');
            if (current === requestNumber.current) {
                setFilmRecommendations(films);
                setStatus('ready');
            }
        } catch {
            if (current === requestNumber.current) setStatus('error');
        }
    }

    return <filmContext.Provider value={{
        topRatedFilms, filmRecommendations, status, fetchRecommendations, seen, setSeen
    }}>{children}</filmContext.Provider>;
}
