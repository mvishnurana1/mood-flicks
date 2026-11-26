import { useContext, useState } from 'react';
import { filmContext } from '../../context';
import { AppModal } from '../AppModal';
import { bin, blankFilm } from '../../assets';
import './conciseFilmList.scss';

export function ConciseFilmList() {
    const { seen, setSeen } = useContext(filmContext);
    const [openedFilm, setOpenedFilm] = useState(null);
    function removeFilm(id) {
        const updated = seen.filter(film => film.id !== id);
        localStorage.setItem('seen', JSON.stringify(updated));
        setSeen(updated);
    }
    return <>
        {seen.map(film => <div className="history-row" key={film.id}>
            <button onClick={() => setOpenedFilm(film)}>
                <img alt="" width="28" src={film.poster_path ? 'https://image.tmdb.org/t/p/w92' + film.poster_path : blankFilm} />
                {film.title}
            </button>
            <button aria-label={'Remove ' + film.title} onClick={() => removeFilm(film.id)}>
                <img src={bin} alt="" width="16" />
            </button>
        </div>)}
        {openedFilm && <AppModal isModalOpen closeModal={() => setOpenedFilm(null)} data={openedFilm} />}
    </>;
}
