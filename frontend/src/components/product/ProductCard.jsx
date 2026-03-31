import { Link } from 'react-router-dom';

/**
 * Card de produto exibindo nome, categoria e imagem.
 * Cada card é um link para a página de detalhes do produto.
 * Usa imagem placeholder quando o produto não possui imageUrl.
 * @param {object} props
 * @param {{ id: string, name: string, category: string, imageUrl: string | null }} props.product — dados do produto
 * @returns {JSX.Element}
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

/* Estilos inline para o POC */
const styles = {
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    transition: 'box-shadow 0.2s',
    cursor: 'pointer',
  },
  image: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
    flexShrink: 0,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  name: {
    margin: 0,
    fontSize: '1.1rem',
  },
  category: {
    fontSize: '0.85rem',
    color: '#666',
  },
};
