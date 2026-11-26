import { useEffect, useRef } from 'react';
import './listingQuestion.scss';

export default function ListQuestion({ title, step, choices, selected, onChoose, onBack, editing, compactChoices }) {
    const heading = useRef(null);
    useEffect(() => { heading.current.focus(); }, [title]);
    return <main className="quiz panel">
        <div className="quiz-nav">
            <button className="text-action" onClick={onBack}>← {editing ? 'Results' : 'Back'}</button>
            <span>{editing ? 'Edit preferences' : 'Step ' + step + ' of 3'}</span>
        </div>
        <h1 ref={heading} tabIndex="-1">{title}</h1>
        <div className={compactChoices ? 'choices choices--compact' : 'choices'}>
            {choices.map(choice => <button key={choice.label} className="choice"
                aria-pressed={selected === choice.label} onClick={() => onChoose(choice)}>
                {choice.imgSrc ? <img src={choice.imgSrc} alt="" /> :
                    <span className="swatch" style={{backgroundColor: choice.color}} />}
                {choice.label}
            </button>)}
        </div>
    </main>;
}
