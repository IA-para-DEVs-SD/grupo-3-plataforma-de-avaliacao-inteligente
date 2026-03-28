/**
 * Tags de padrões recorrentes identificados pela IA.
 * Exibe tags separadas em "Pontos Fortes" (verde) e "Pontos Fracos" (vermelho).
 * Cada tag é clicável — ao clicar, filtra avaliações pelo padrão selecionado.
 * Props: {
 *   patterns: { strengths: string[], weaknesses: string[] } | null,
 *   onPatternClick: (pattern: string) => void
 * }
 */
export default function PatternTags({ patterns, onPatternClick }) {
  if (!patterns) return null;

  const { strengths = [], weaknesses = [] } = patterns;

  // Sem padrões detectados — não renderiza nada
  if (strengths.length === 0 && weaknesses.length === 0) return null;

  /**
   * Handler de clique em uma tag de padrão.
   * Chama o callback do componente pai para filtrar avaliações.
   */
  const handleTagClick = (pattern) => {
    if (onPatternClick) {
      onPatternClick(pattern);
    }
  };

  return (
    <section style={styles.container} aria-label="Padrões recorrentes">
      <h3 style={styles.title}>Padrões Recorrentes</h3>

      {/* Pontos fortes */}
      {strengths.length > 0 && (
        <div style={styles.group}>
          <h4 style={styles.strengthHeading}>Pontos Fortes</h4>
          <div style={styles.tagList} role="list" aria-label="Pontos fortes">
            {strengths.map((pattern) => (
              <button
                key={pattern}
                style={styles.strengthTag}
                onClick={() => handleTagClick(pattern)}
                role="listitem"
                aria-label={`Filtrar por: ${pattern}`}
                type="button"
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pontos fracos */}
      {weaknesses.length > 0 && (
        <div style={styles.group}>
          <h4 style={styles.weaknessHeading}>Pontos Fracos</h4>
          <div style={styles.tagList} role="list" aria-label="Pontos fracos">
            {weaknesses.map((pattern) => (
              <button
                key={pattern}
                style={styles.weaknessTag}
                onClick={() => handleTagClick(pattern)}
                role="listitem"
                aria-label={`Filtrar por: ${pattern}`}
                type="button"
              >
                {pattern}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* Estilos inline para o POC */
const baseTag = {
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  transition: 'opacity 0.2s ease',
};

const styles = {
  container: {
    padding: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
  },
  title: {
    margin: '0 0 0.75rem 0',
    fontSize: '1.1rem',
    color: '#333',
  },
  group: {
    marginBottom: '0.75rem',
  },
  strengthHeading: {
    margin: '0 0 0.4rem 0',
    fontSize: '0.9rem',
    color: '#2e7d32',
  },
  weaknessHeading: {
    margin: '0 0 0.4rem 0',
    fontSize: '0.9rem',
    color: '#c62828',
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  strengthTag: {
    ...baseTag,
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  weaknessTag: {
    ...baseTag,
    backgroundColor: '#fdecea',
    color: '#c62828',
  },
};
