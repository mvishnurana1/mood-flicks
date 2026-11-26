import { useContext, useEffect, useRef } from 'react';
import { Card } from '../../components';
import { filmContext } from '../../context';
import './FilmRecommendations.scss';

export function FilmRecommendations({ answers, onEdit, onOpenFilm, onRetry }) {
    const { filmRecommendations, status } = useContext(filmContext);
    const heading = useRef(null);
    useEffect(() => { heading.current.focus(); }, []);

    return <main className="results panel">
        <h1 ref={heading} tabIndex="-1">Your movie picks</h1>
        <fieldset className="preferences">
            <legend>Edit preferences</legend>
            <button onClick={() => onEdit('mood')}>Mood · {answers.mood.label}</button>
            <button onClick={() => onEdit('genre')}>Genre · {answers.genre}</button>
            <button onClick={() => onEdit('era')}>Era · {answers.era.label}</button>
        </fieldset>
        {status === 'loading' && <p role="status">Finding your movies…</p>}
        {status === 'error' && <section role="alert"><h2>Movies couldn’t load</h2>
            <p>Your preferences are saved for this search.</p>
            <button className="primary-action" onClick={onRetry}>Retry</button></section>}
        {status === 'ready' && (filmRecommendations.length ?
            <><div className="film-grid">{filmRecommendations.map(film =>
                <Card key={film.id} film={film} onClick={onOpenFilm} />)}</div><button className="text-action" onClick={() => heading.current.focus()}>Back to top ↑</button></> :
            <section role="status"><h2>No movies match these choices</h2>
                <p>Try another era or mood to find more movies.</p>
                <button className="primary-action" onClick={() => onEdit('era')}>Change era</button>
            </section>)}
    </main>;
}
