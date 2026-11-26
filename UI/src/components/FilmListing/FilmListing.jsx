import { useContext } from 'react';
import { filmContext } from '../../context';
import localPoster from '../../assets/files/cbMRkBGBgo3aLJK2M4MyicvkPLQ.jpg';
import './FilmListing.scss';

export function FilmListing() {
    const { topRatedFilms } = useContext(filmContext);
    const posters = topRatedFilms.filter(film => film.poster_path).slice(0, 3);
    return <div className="poster-display" aria-hidden="true">
        {posters.length ? posters.map(film => <img key={film.id} alt=""
            src={'https://image.tmdb.org/t/p/w342' + film.poster_path}
            onError={event => { event.currentTarget.src = localPoster; }} />) :
            <img src={localPoster} alt="" />}
    </div>;
}
