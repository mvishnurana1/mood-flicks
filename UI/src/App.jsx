import { useContext, useEffect, useRef, useState } from 'react';
import { AppModal, ConciseFilmList, ListingQuestion } from './components';
import { filmContext } from './context';
import { FilmRecommendations } from './features';
import { cars, colors, likeColorPallets, likeColorsFilms } from './helper';
import { HomePage } from './pages';
import './App.scss';

function App() {
    const { seen, setSeen, fetchRecommendations } = useContext(filmContext);
    const [screen, setScreen] = useState('home');
    const [answers, setAnswers] = useState({});
    const [draft, setDraft] = useState({});
    const [editing, setEditing] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [chosenFilm, setChosenFilm] = useState(null);
    const historyArea = useRef(null);
    const historyToggle = useRef(null);

    useEffect(() => {
        if (!historyOpen) return;

        function dismissOnOutsideClick(event) {
            if (!historyArea.current?.contains(event.target)) setHistoryOpen(false);
        }

        document.addEventListener('click', dismissOnOutsideClick, true);
        return () => document.removeEventListener('click', dismissOnOutsideClick, true);
    }, [historyOpen]);

    function openFilm(film) {
        if (!seen.some(item => item.id === film.id)) {
            const updated = [...seen, film];
            localStorage.setItem('seen', JSON.stringify(updated));
            setSeen(updated);
        }
        setHistoryOpen(false);
        setChosenFilm(film);
    }

    function openHistoryFilm(film) {
        // The movie row unmounts, so the dialog should restore focus to the toggle.
        historyToggle.current.focus();
        openFilm(film);
    }

    function finish(next) {
        setAnswers(next);
        setDraft(next);
        setScreen('results');
        setEditing(false);
        fetchRecommendations(next);
    }
    function edit(step) {
        setDraft(answers);
        setEditing(true);
        setScreen(step);
    }
    function chooseMood(mood) {
        const next = { ...draft, mood, genre: draft.mood === mood ? draft.genre : undefined };
        setDraft(next);
        setScreen('genre');
    }
    function chooseGenre(choice) {
        const next = { ...draft, genre: choice.label };
        if (editing) finish(next);
        else {
            setDraft(next);
            setScreen('era');
        }
    }
    const shades = (likeColorPallets[draft.mood?.color] ?? []).map(color => ({
        color, label: likeColorsFilms[color]
    }));

    return <div className="discovery">
        <header className="masthead"><span className="wordmark">MoodFlicks</span>
            {seen.length > 0 && <div ref={historyArea}>
                <button ref={historyToggle} className="text-action" aria-expanded={historyOpen}
                    onClick={() => setHistoryOpen(open => !open)}>Recently viewed ({seen.length})</button>
                {historyOpen && <div className="visited-movies-container">
                    <ConciseFilmList onOpenFilm={openHistoryFilm} />
                </div>}
            </div>}
        </header>
        {screen === 'home' && <HomePage onStart={() => setScreen('mood')} />}
        {screen === 'mood' && <ListingQuestion title="What mood are you in?" step={1} compactChoices
            choices={colors} selected={draft.mood?.label} onChoose={chooseMood} editing={editing}
            onBack={() => setScreen(editing ? 'results' : 'home')} />}
        {screen === 'genre' && <ListingQuestion title="Which shade feels right?" step={2}
            choices={shades} selected={draft.genre} onChoose={chooseGenre} editing={editing}
            onBack={() => setScreen(editing ? 'results' : 'mood')} />}
        {screen === 'era' && <ListingQuestion title="Pick a movie era" step={3}
            choices={cars} selected={draft.era?.label} editing={editing}
            onChoose={era => finish({ ...draft, era })}
            onBack={() => setScreen(editing ? 'results' : 'genre')} />}
        {screen === 'results' && <FilmRecommendations answers={answers} onEdit={edit} onOpenFilm={openFilm}
            onRetry={() => fetchRecommendations(answers)} />}
        {chosenFilm && <AppModal isModalOpen closeModal={() => setChosenFilm(null)} data={chosenFilm} />}
    </div>;
}
export default App;
