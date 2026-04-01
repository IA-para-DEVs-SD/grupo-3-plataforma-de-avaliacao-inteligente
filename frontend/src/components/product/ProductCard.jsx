import { Link } from 'react-router-dom';

/**
 * Card de produto exibindo nome, categoria e imagem.
 * Cada card é um link para a página de detalhes do produto.
 * Usa imagem placeholder quando o produto não possui imageUrl.
 * @param {{ product: { id: string, name: string, category: string, imageUrl?: string } }} props
 * @param {object} props.product — dados do produto a exibir
 * @param {string} props.product.id — identificador único do produto (usado na URL)
 * @param {string} props.product.name — nome do produto
 * @param {string} props.product.category — categoria do produto
 * @param {string} [props.product.imageUrl] — URL da imagem do produto (opcional)
 */
export default function ProductCard({ product }) {
  const { id, name, category, imageUrl } = product;

  return (
    <Link
      to={`/products/${id}`}
      style={styles.link}
      aria-label={`Ver detalhes de ${name}`}
    >
      <article style={styles.card}>
        <img
          src={imageUrl || 'https://via.placeholder.com/120x120?text=Sem+Imagem'}
          alt={imageUrl ? name : 'Imagem indisponível'}
          style={styles.image}
        />
        <div style={styles.info}>
          <h3 style={styles.name}>{name}</h3>
          <span style={styles.category}>{category}</span>
        </div>
      </article>
    </Link>
  );
}

const styles = {
  link: { textDecoration: 'none', color: 'inherit' },
  card: {
    display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem',
    border: '1px solid var(--color-border)', borderRadius: '8px',
    backgroundColor: 'var(--color-bg-card)', transition: 'box-shadow 0.2s', cursor: 'pointer',
  },
  image: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 },
  info: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  name: { margin: 0, fontSize: '1.1rem', color: 'var(--color-text)' },
  category: { fontSize: '0.85rem', color: 'var(--color-text-muted)' },
};
