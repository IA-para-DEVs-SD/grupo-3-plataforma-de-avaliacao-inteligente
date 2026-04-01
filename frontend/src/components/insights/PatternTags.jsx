import { useState } from 'react';

/**
 * Tags de padrões recorrentes identificados pela IA.
 * Cada tag é clicável para filtrar avaliações pelo padrão.
 * Inclui hover state visual para indicar interatividade.
 */
export default function PatternTags({ patterns, onPatternClick }) {
  const [activePattern, setActivePattern] = useState(null);

  if (!patterns) return null;
  const { strengths = [], weaknesses = [] } = patterns;
  if (strengths.length === 0 && weaknesses.length === 0) return null;

  const handleClick = (pattern) => {
    // Toggle: clica de novo para desativar o filtro
    const next = activePattern === pattern ? null : pattern;
    setActivePattern(next);
    onPatternClick?.(next || '');
  };

  return (
    <section style={styles.container} aria-label="Padrões recorrentes">
      <h3 style={styles.title}>Padrões Recorrentes</h3>
      <p style={styles.hint}>Clique em uma tag para filtrar as avaliações</p>

      {strengths.length > 0 && (
        <div style={styles.group}>
          <h4 style={{ ...styles.heading, color: 'var(--color-text-positive)' }}>Pontos Fortes</h4>
          <div style={styles.tagList} role="list" aria-label="Pontos fortes">
            {strengths.map((p) => (
              <TagButton
                key={p} label={p} active={activePattern === p}
                type="strength" onClick={() => handleClick(p)}
              />
            ))}
          </div>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div style={styles.group}>
          <h4 style={{ ...styles.heading, color: 'var(--color-text-negative)' }}>Pontos Fracos</h4>
          <div style={styles.tagList} role="list" aria-label="Pontos fracos">
            {weaknesses.map((p) => (
              <TagButton
                key={p} label={p} active={activePattern === p}
                type="weakness" onClick={() => handleClick(p)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/** Botão de tag com hover e estado ativo */
function TagButton({ label, active, type, onClick }) {
  const [hovered, setHovered] = useState(false);

  const isStrength = type === 'strength';
  const baseStyle = {
    padding: '4px 12px', borderRadius: '16px', fontSize: '0.85rem',
    fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease',
    border: '1px solid transparent',
    backgroundColor: isStrength ? 'var(--color-bg-badge-positive)' : 'var(--color-bg-badge-negative)',
    color: isStrength ? 'var(--color-text-positive)' : 'var(--color-text-negative)',
    ...(hovered && !active ? { opacity: 0.75, transform: 'translateY(-1px)' } : {}),
    ...(active ? {
      border: `1px solid ${isStrength ? 'var(--color-text-positive)' : 'var(--color-text-negative)'}`,
      fontWeight: 700,
      transform: 'translateY(-1px)',
    } : {}),
  };

  return (
    <button
      type="button"
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="listitem"
      aria-label={`${active ? 'Remover filtro' : 'Filtrar'} por: ${label}`}
      aria-pressed={active}
    >
      {active && '✕ '}{label}
    </button>
  );
}

const styles = {
  container: { padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-bg-card)' },
  title: { margin: '0 0 0.25rem 0', fontSize: '1.1rem', color: 'var(--color-text)' },
  hint: { margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--color-text-faint)', fontStyle: 'italic' },
  group: { marginBottom: '0.75rem' },
  heading: { margin: '0 0 0.4rem 0', fontSize: '0.9rem' },
  tagList: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
};
