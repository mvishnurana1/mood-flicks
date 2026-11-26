import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { FilmProvider } from './context';

test('uses the selected genre, keeps it when editing the era, and retries the same search', async () => {
    const json = data => ({ ok: true, json: async () => data });
    const originalFetch = global.fetch;
    global.fetch = jest.fn()
        .mockResolvedValueOnce(json({ results: [] }))
        .mockResolvedValueOnce(json([]))
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce(json([{ id: 1, title: 'Movie pick', release_date: '1985-02-01',
            genre_ids: [35], vote_average: 8 }]));
    const click = name => fireEvent.click(screen.getByRole('button', { name }));
    try {
        render(<FilmProvider><App /></FilmProvider>);
        click(/Find my movie/);
        click('Upbeat');
        click('Comedy');
        click(/Back/);
        expect(screen.getByRole('button', { name: 'Comedy' })).toHaveAttribute('aria-pressed', 'true');
        click('Comedy');
        click('1950–1969');
        await screen.findByText('No movies match these choices');
        expect(global.fetch.mock.calls[1][0]).toContain('releaseDateGte=1950-01-01&releaseDateLte=1969-12-31&genre_code=35');
        click('Change era');
        click('1970–1989');
        await screen.findByText('Movies couldn’t load');
        expect(global.fetch.mock.calls[2][0]).toContain('releaseDateGte=1970-01-01&releaseDateLte=1989-12-31&genre_code=35');
        click('Retry');
        expect(await screen.findByText('Movie pick')).toBeInTheDocument();
        expect(global.fetch.mock.calls[3][0]).toBe(global.fetch.mock.calls[2][0]);
    } finally {
        global.fetch = originalFetch;
    }
});

test('dismisses recently viewed on outside clicks and keeps movie dialogs open', async () => {
    const movie = { release_date: '1985-02-01', genre_ids: [35], vote_average: 8 };
    const viewed = { ...movie, id: 1, title: 'Viewed movie' };
    const removable = { ...movie, id: 2, title: 'Remove me' };
    const recommendation = { ...movie, id: 3, title: 'Recommended movie' };
    const originalFetch = global.fetch;
    const originalHistory = localStorage.getItem('seen');
    const root = document.body.appendChild(document.createElement('div'));
    root.id = 'root';
    localStorage.setItem('seen', JSON.stringify([viewed, removable]));
    global.fetch = jest.fn()
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({ ok: true, json: async () => [recommendation] });

    try {
        render(<FilmProvider><App /></FilmProvider>, { container: root });
        const historyToggle = screen.getByRole('button', { name: /Recently viewed/ });
        fireEvent.click(historyToggle);
        fireEvent.click(screen.getByRole('button', { name: 'Remove Remove me' }));
        expect(historyToggle).toHaveAttribute('aria-expanded', 'true');
        expect(screen.queryByRole('button', { name: 'Remove me' })).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('heading', { level: 1 }));
        expect(historyToggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByRole('button', { name: 'Viewed movie' })).not.toBeInTheDocument();

        fireEvent.click(historyToggle);
        fireEvent.click(screen.getByRole('button', { name: 'Viewed movie' }));
        expect(historyToggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByRole('dialog', { name: 'Viewed movie' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Close movie details' }));
        expect(historyToggle).toHaveFocus();

        fireEvent.click(screen.getByRole('button', { name: /Find my movie/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Upbeat' }));
        fireEvent.click(screen.getByRole('button', { name: 'Comedy' }));
        fireEvent.click(screen.getByRole('button', { name: '1970–1989' }));
        const result = await screen.findByRole('button', { name: /Recommended movie/ });
        fireEvent.click(historyToggle);
        fireEvent.click(result);
        expect(historyToggle).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByRole('dialog', { name: 'Recommended movie' })).toBeInTheDocument();
    } finally {
        global.fetch = originalFetch;
        if (originalHistory === null) localStorage.removeItem('seen');
        else localStorage.setItem('seen', originalHistory);
    }
});
