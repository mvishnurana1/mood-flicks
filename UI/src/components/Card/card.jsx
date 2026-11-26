import { blankFilm } from '../../assets';
import { genreIdToGenreNameMapping } from '../../helper';
import './card.scss';

export default function Card({ film, onClick }) {
    const { title, poster_path, release_date, genre_ids, vote_average } = film;
    const metadata = [release_date?.slice(0, 4), genreIdToGenreNameMapping[genre_ids?.[0]]];
    return <button className="film-card" onClick={() => onClick(film)}>
        <img alt="" loading="lazy" src={poster_path ? 'https://image.tmdb.org/t/p/w342' + poster_path : blankFilm} />
        <span className="film-card-title">{title}</span>
        <span className="film-meta">{metadata.filter(Boolean).join(' · ')}</span>
        {Number.isFinite(vote_average) && <span className="rating">★ {vote_average.toFixed(1)}/10</span>}
    </button>;
}
