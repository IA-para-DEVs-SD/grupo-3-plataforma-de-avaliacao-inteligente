import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatternTags from './PatternTags.jsx';

describe('PatternTags', () => {
  const patterns = {
    strengths: ['durabilidade', 'design'],
    weaknesses: ['preço', 'peso'],
  };

  it('deve exibir tags de pontos fortes e fracos', () => {
    render(<PatternTags patterns={patterns} onPatternClick={() => {}} />);

    expect(screen.getByText('durabilidade')).toBeInTheDocument();
    expect(screen.getByText('design')).toBeInTheDocument();
    expect(screen.getByText('preço')).toBeInTheDocument();
    expect(screen.getByText('peso')).toBeInTheDocument();
  });

  it('deve chamar onPatternClick ao clicar em uma tag', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<PatternTags patterns={patterns} onPatternClick={handleClick} />);

    await user.click(screen.getByText('durabilidade'));

    expect(handleClick).toHaveBeenCalledWith('durabilidade');
  });

  it('não deve renderizar nada quando patterns é null', () => {
    const { container } = render(<PatternTags patterns={null} onPatternClick={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('não deve renderizar nada quando ambas as listas estão vazias', () => {
    const { container } = render(
      <PatternTags patterns={{ strengths: [], weaknesses: [] }} onPatternClick={() => {}} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('deve ter aria-labels acessíveis nos botões de tag', () => {
    render(<PatternTags patterns={patterns} onPatternClick={() => {}} />);

    expect(screen.getByLabelText('Filtrar por: durabilidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Filtrar por: preço')).toBeInTheDocument();
  });
});
