import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewFilters from './ReviewFilters.jsx';

describe('ReviewFilters — filtros de sentimento e ordenação', () => {
  it('deve renderizar seletores de sentimento e ordenação', () => {
    render(<ReviewFilters sentiment="" sort="" onFilterChange={() => {}} onSortChange={() => {}} />);

    expect(screen.getByLabelText('Sentimento')).toBeInTheDocument();
    expect(screen.getByLabelText('Ordenar por')).toBeInTheDocument();
  });

  it('deve chamar onFilterChange ao alterar sentimento', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(<ReviewFilters sentiment="" sort="" onFilterChange={onFilterChange} onSortChange={() => {}} />);

    await user.selectOptions(screen.getByLabelText('Sentimento'), 'positive');

    expect(onFilterChange).toHaveBeenCalledWith('positive');
  });

  it('deve chamar onSortChange ao alterar ordenação', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(<ReviewFilters sentiment="" sort="" onFilterChange={() => {}} onSortChange={onSortChange} />);

    await user.selectOptions(screen.getByLabelText('Ordenar por'), 'rating_asc');

    expect(onSortChange).toHaveBeenCalledWith('rating_asc');
  });

  it('deve refletir valores selecionados nas props', () => {
    render(<ReviewFilters sentiment="negative" sort="rating_desc" onFilterChange={() => {}} onSortChange={() => {}} />);

    expect(screen.getByLabelText('Sentimento')).toHaveValue('negative');
    expect(screen.getByLabelText('Ordenar por')).toHaveValue('rating_desc');
  });
});
