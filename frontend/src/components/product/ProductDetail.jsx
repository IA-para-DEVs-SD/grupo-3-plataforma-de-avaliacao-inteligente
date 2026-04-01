import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts.js';
import { useInsights } from '../../hooks/useInsights.js';
import { useReviews } from '../../hooks/useReviews.js';
import SmartScore from '../insights/SmartScore.jsx';
import InsightCard from '../insights/InsightCard.jsx';
import SentimentChart from '../insights/SentimentChart.jsx';
import PatternTags from '../insights/PatternTags.jsx';
import ReviewFilters from '../review/ReviewFilters.jsx';
import ReviewList from '../review/ReviewList.jsx';
import ReviewForm from '../review/ReviewForm.jsx';

/**
 * Página de detalhes de um produto.
 * Integra todos os componentes na ordem do mock:
 * header do produto → SmartScore → InsightCard → SentimentChart →
 * PatternTags → ReviewFilters → ReviewList → ReviewForm.
 * Inclui estados de loading por seção e tratamento de erros em português.
 */
export default function ProductDetail() {
  const { id } = useParams();
  const { loading: productLoading, error: productError, getProduct } = useProducts();
  const { insights, loading: insightsLoading, error: insightsError, fetchInsights, startPolling, stopPolling } = useInsights();
  const {
    reviews, page, totalPages, loading: reviewsLoading, error: reviewsError,
    filters, fetchReviews, submitReview, setFilter, setPage,
  } = useReviews();
  const [product, setProduct] = useState(null);
  // Controla o banner de "IA processando" após submissão de avaliação
  const [aiProcessing, setAiProcessing] = useState(false);

  // Busca produto, insights e avaliações ao montar
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const data = await getProduct(id);
      if (!cancelled) setProduct(data);
      // Busca insights e avaliações em paralelo
      fetchInsights(id);
      fetchReviews(id);
    }

    loadData();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /** Limpa todos os filtros ativos */
  const handleClearFilters = () => {
    setFilter('sentiment', '');
    setFilter('rating', '');
    setFilter('pattern', '');
    setFilter('sort', '');
  };
  const handlePatternClick = (pattern) => {
    setFilter('pattern', pattern);
  };

  /** Handler de mudança de filtro de sentimento */
  const handleFilterChange = (value) => {
    setFilter('sentiment', value);
  };

  /** Handler de mudança de ordenação */
  const handleSortChange = (value) => {
    setFilter('sort', value);
  };

  /** Handler de mudança de filtro de nota */
  const handleRatingChange = (value) => {
    setFilter('rating', value);
  };

  /** Handler de submissão de avaliação — inicia polling para atualizar insights automaticamente */
  const handleReviewSubmit = async ({ text, rating }) => {
    await submitReview(id, { text, rating });
    setAiProcessing(true);
    // Inicia polling a cada 5s para detectar quando os insights forem atualizados
    startPolling(id);
    // Para o polling e o banner após 30 segundos no máximo
    setTimeout(() => {
      stopPolling();
      setAiProcessing(false);
    }, 30000);
  };

  /* Estado de carregamento do produto */
  if (productLoading) {
    return (
      <div style={styles.container}>
        <p role="status" style={styles.loadingText}>Carregando produto...</p>
      </div>
    );
  }

  /* Erro ao carregar produto */
  if (productError) {
    return (
      <div style={styles.container}>
        <p role="alert" style={styles.errorBox}>
          Não foi possível carregar o produto. Tente novamente mais tarde.
        </p>
      </div>
    );
  }

  /* Produto não encontrado */
  if (!product) {
    return (
      <div style={styles.container}>
        <p role="status" style={styles.loadingText}>Produto não encontrado.</p>
      </div>
    );
  }

  return (
    <article style={styles.container} aria-label={`Detalhes de ${product.name}`}>
      {/* Header do produto */}
      <header style={styles.productHeader}>
        <img
          src={product.imageUrl || 'https://via.placeholder.com/300x300?text=Sem+Imagem'}
          alt={product.imageUrl ? product.name : 'Imagem indisponível'}
          style={styles.image}
        />
        <div style={styles.info}>
          <h1 style={styles.name}>{product.name}</h1>
          <span style={styles.category}>{product.category}</span>
          <p style={styles.description}>{product.description}</p>
        </div>
      </header>

      {/* Seção de insights de IA */}
      {insightsLoading ? (
        <p role="status" style={styles.loadingText}>Carregando insights...</p>
      ) : insightsError ? (
        <p role="alert" style={styles.errorBox}>
          Não foi possível carregar os insights. Tente novamente mais tarde.
        </p>
      ) : (
        <>
          {/* SmartScore */}
          <SmartScore
            smartScore={insights?.smartScore ?? null}
            simpleAverage={insights?.simpleAverage ?? null}
            smartScoreConfidence={insights?.smartScoreConfidence ?? null}
            scoreExplanation={insights?.scoreExplanation ?? null}
          />

          {/* InsightCard — resumo automático */}
          <InsightCard summary={insights?.summary ?? null} />

          {/* SentimentChart — distribuição de sentimento */}
          <SentimentChart distribution={insights?.sentimentDistribution ?? null} />

          {/* PatternTags — padrões recorrentes */}
          <PatternTags
            patterns={insights?.patterns ?? null}
            onPatternClick={handlePatternClick}
          />
        </>
      )}

      {/* Seção de avaliações */}
      <section style={styles.reviewsSection}>
        <h2 style={styles.sectionTitle}>Avaliações</h2>

        {/* Banner de processamento assíncrono da IA */}
        {aiProcessing && (
          <p role="status" style={styles.aiProcessingBanner}>
            ⏳ Sua avaliação foi enviada. A IA está analisando o sentimento e atualizando os insights...
          </p>
        )}

        {/* Filtros */}
        <ReviewFilters
          sentiment={filters.sentiment}
          sort={filters.sort}
          rating={filters.rating}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onRatingChange={handleRatingChange}
        />

        {/* Erro ao carregar avaliações */}
        {reviewsError && (
          <p role="alert" style={styles.errorBox}>
            Não foi possível carregar as avaliações. Tente novamente mais tarde.
          </p>
        )}

        {/* Lista de avaliações */}
        <ReviewList
          reviews={reviews}
          page={page}
          totalPages={totalPages}
          loading={reviewsLoading}
          onPageChange={setPage}
          filters={filters}
          onClearFilters={handleClearFilters}
        />

        {/* Formulário de avaliação */}
        <div style={styles.formWrapper}>
          <ReviewForm onSubmit={handleReviewSubmit} loading={reviewsLoading} />
        </div>
      </section>
    </article>
  );
}

/* Estilos inline para o POC */
const styles = {
  container: {
    maxWidth: '720px', margin: '0 auto', padding: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '1.5rem',
  },
  productHeader: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  image: { width: '100%', maxHeight: '360px', objectFit: 'cover', borderRadius: '8px' },
  info: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  name: { margin: 0, fontSize: '1.75rem', color: 'var(--color-text)' },
  category: { fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  description: { lineHeight: 1.6, color: 'var(--color-text)' },
  loadingText: { textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontStyle: 'italic' },
  errorBox: {
    textAlign: 'center', padding: '1rem', color: 'var(--color-error-text)',
    backgroundColor: 'var(--color-error-bg)', borderRadius: '6px', fontSize: '0.95rem',
  },
  reviewsSection: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  sectionTitle: { margin: 0, fontSize: '1.3rem', color: 'var(--color-text)' },
  formWrapper: { marginTop: '1rem' },
  aiProcessingBanner: {
    backgroundColor: 'var(--color-bg-ai-banner)',
    border: '1px solid var(--color-border-ai-banner)',
    borderRadius: '6px', padding: '0.75rem 1rem',
    color: 'var(--color-text)', fontSize: '0.9rem', margin: '0.5rem 0',
  },
};
