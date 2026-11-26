import { useContext } from 'react';
import { filmContext } from '../../context';
import { bin, blankFilm } from '../../assets';
import './conciseFilmList.scss';

export function ConciseFilmList({ onOpenFilm }) {
    const { seen, setSeen } = useContext(filmContext);
    function removeFilm(id) {
        const updated = seen.filter(film => film.id !== id);
        localStorage.setItem('seen', JSON.stringify(updated));
        setSeen(updated);
    }
    return <>
        {seen.map(film => <div className="history-row" key={film.id}>
            <button onClick={() => onOpenFilm(film)}>
                <img alt="" width="28" src={film.poster_path ? 'https://image.tmdb.org/t/p/w92' + film.poster_path : blankFilm} />
                {film.title}
            </button>
            <button aria-label={'Remove ' + film.title} onClick={() => removeFilm(film.id)}>
                <img src={bin} alt="" width="16" />
            </button>
        </div>)}
    </>;
}
