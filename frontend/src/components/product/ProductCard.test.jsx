import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';

/** Renderiza o ProductCard dentro de um MemoryRouter para suporte ao Link */
function renderCard(product) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  );
}

describe('ProductCard', () => {
  const baseProduct = {
    id: '42',
    name: 'Teclado Mecânico RGB',
    category: 'Periféricos',
    imageUrl: 'https://example.com/teclado.jpg',
  };

  it('deve exibir nome e categoria do produto', () => {
    renderCard(baseProduct);

    expect(screen.getByText('Teclado Mecânico RGB')).toBeInTheDocument();
    expect(screen.getByText('Periféricos')).toBeInTheDocument();
  });

  it('deve renderizar a imagem do produto com alt correto', () => {
    renderCard(baseProduct);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/teclado.jpg');
    expect(img).toHaveAttribute('alt', 'Teclado Mecânico RGB');
  });

  it('deve usar imagem placeholder quando imageUrl está ausente', () => {
    renderCard({ ...baseProduct, imageUrl: '' });

    const img = screen.getByRole('img');
    expect(img.src).toContain('placeholder');
    expect(img).toHaveAttribute('alt', 'Imagem indisponível');
  });

  it('deve ser um link para a página de detalhes do produto', () => {
    renderCard(baseProduct);

    const link = screen.getByRole('link', { name: /ver detalhes de teclado mecânico rgb/i });
    expect(link).toHaveAttribute('href', '/products/42');
  });

  it('deve ter aria-label acessível no link', () => {
    renderCard(baseProduct);

    expect(
      screen.getByLabelText('Ver detalhes de Teclado Mecânico RGB')
    ).toBeInTheDocument();
  });
});
