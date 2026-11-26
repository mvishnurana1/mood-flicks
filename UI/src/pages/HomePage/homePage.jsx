import { FilmListing } from '../../components';
import './homePage.scss';

export default function HomePage({ onStart }) {
    return <main className="hero">
        <div className="hero-copy">
            <h1>What are you in the mood to <em>watch?</em></h1>
            <p>Pick a mood, a genre and an era to find your next movie.</p>
            <button className="primary-action" onClick={onStart}>Find my movie <span aria-hidden="true">→</span></button>
        </div>
        <FilmListing />
    </main>;
}
