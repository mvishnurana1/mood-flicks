import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
        await waitFor(() => expect(screen.getByText('Movie pick')).toBeInTheDocument());
        expect(global.fetch.mock.calls[3][0]).toBe(global.fetch.mock.calls[2][0]);
    } finally {
        global.fetch = originalFetch;
    }
});
