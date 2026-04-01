import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendChatMessage } from '../../services/chat-service.js';

/**
 * Chat de recomendação de produtos com IA.
 * O usuário descreve o que procura e a IA recomenda produtos do catálogo.
 * Quando a IA identifica um produto adequado, redireciona automaticamente.
 */
export default function ProductChat({ onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou o assistente InsightReview. Me conte o que você está procurando — tipo de produto, uso principal, ou qualquer dúvida sobre avaliações. Vou te ajudar a encontrar o produto certo! 😊',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Histórico sem a mensagem de boas-vindas inicial
      const history = newMessages.slice(1).map(m => ({ role: m.role, content: m.content }));
      const result = await sendChatMessage(text, history);

      const assistantMessage = { role: 'assistant', content: result.reply };
      setMessages(prev => [...prev, assistantMessage]);

      // Redireciona se a IA identificou um produto adequado
      if (result.shouldRedirect && result.recommendedProductIds?.length > 0) {
        setRedirecting(true);
        const redirectMsg = result.redirectMessage || 'Encontrei o produto ideal para você! Redirecionando...';
        setMessages(prev => [...prev, { role: 'assistant', content: `${redirectMsg} 🚀` }]);

        setTimeout(() => {
          navigate(`/products/${result.recommendedProductIds[0]}`);
          onClose?.();
        }, 2000);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, tive um problema. Tente novamente ou use a busca para encontrar produtos.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div style={styles.container} role="dialog" aria-label="Chat de recomendação">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerInfo}>
            <span style={styles.avatar}>🤖</span>
            <div>
              <strong style={styles.headerTitle}>Assistente InsightReview</strong>
              <span style={styles.headerSub}>Powered by IA local</span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Fechar chat">✕</button>
        </div>

        {/* Mensagens */}
        <div style={styles.messages} aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} style={{ ...styles.bubble, ...(msg.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
              {msg.content}
            </div>
          ))}
          {loading && (
            <div style={{ ...styles.bubble, ...styles.aiBubble, ...styles.typing }}>
              <span>●</span><span>●</span><span>●</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={styles.inputArea}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: procuro um fone para trabalho remoto..."
            style={styles.input}
            disabled={loading || redirecting}
            aria-label="Mensagem para o assistente"
          />
          <button type="submit" disabled={loading || redirecting || !input.trim()} style={styles.sendBtn}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
    padding: '1rem', zIndex: 1000,
  },
  container: {
    width: '380px', maxWidth: '100%', height: '520px',
    backgroundColor: 'var(--color-bg-card)', borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    border: '1px solid var(--color-border)',
  },
  header: {
    backgroundColor: 'var(--color-bg-header)', padding: '0.75rem 1rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  headerInfo: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  avatar: { fontSize: '1.5rem' },
  headerTitle: { display: 'block', color: '#fff', fontSize: '0.95rem' },
  headerSub: { display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' },
  closeBtn: {
    background: 'none', border: 'none', color: '#fff',
    cursor: 'pointer', fontSize: '1rem', padding: '0.25rem',
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
  },
  bubble: {
    maxWidth: '85%', padding: '0.6rem 0.9rem',
    borderRadius: '12px', fontSize: '0.9rem', lineHeight: 1.5,
  },
  aiBubble: {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: '4px',
    border: '1px solid var(--color-border)',
  },
  userBubble: {
    backgroundColor: 'var(--color-bg-header)',
    color: '#fff', alignSelf: 'flex-end',
    borderBottomRightRadius: '4px',
  },
  typing: {
    display: 'flex', gap: '4px', alignItems: 'center',
    '& span': { animation: 'bounce 1s infinite' },
  },
  inputArea: {
    display: 'flex', gap: '0.5rem', padding: '0.75rem',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-card)',
  },
  input: {
    flex: 1, padding: '0.6rem 0.75rem', borderRadius: '20px',
    border: '1px solid var(--color-border-input)',
    backgroundColor: 'var(--color-bg-input)', color: 'var(--color-text)',
    fontSize: '0.9rem', outline: 'none',
  },
  sendBtn: {
    width: '36px', height: '36px', borderRadius: '50%', border: 'none',
    backgroundColor: 'var(--color-bg-header)', color: '#fff',
    cursor: 'pointer', fontSize: '1rem', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
};
