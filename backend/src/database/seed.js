// Script de seed — popula o banco com dados de exemplo para desenvolvimento
// Uso: node src/database/seed.js
import 'dotenv/config';
import { getDb, closeDb } from './connection.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const db = getDb();

// Limpa dados existentes (ordem inversa por FK)
db.exec('DELETE FROM product_insights');
db.exec('DELETE FROM reviews');
db.exec('DELETE FROM products');
db.exec('DELETE FROM users');

console.log('Banco limpo. Inserindo dados de exemplo...');

// --- Usuários ---
const users = [
  { id: uuidv4(), name: 'Maria Silva', email: 'maria@teste.com', password: 'senha1234' },
  { id: uuidv4(), name: 'João Santos', email: 'joao@teste.com', password: 'senha1234' },
  { id: uuidv4(), name: 'Ana Oliveira', email: 'ana@teste.com', password: 'senha1234' },
];

const insertUser = db.prepare(
  'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
);

for (const user of users) {
  const hash = bcrypt.hashSync(user.password, 10);
  insertUser.run(user.id, user.name, user.email, hash);
}
console.log(`${users.length} usuários criados (senha padrão: senha1234)`);

// --- Produtos ---
const products = [
  {
    id: uuidv4(),
    name: 'Fone Bluetooth SoundMax Pro',
    description: 'Fone de ouvido sem fio com cancelamento de ruído ativo, bateria de 30h e microfone integrado. Ideal para trabalho remoto e viagens.',
    category: 'Eletrônicos',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    createdBy: users[0].id,
  },
  {
    id: uuidv4(),
    name: 'Notebook UltraSlim X14',
    description: 'Notebook ultrafino com tela de 14 polegadas, processador de última geração, 16GB RAM e SSD de 512GB. Perfeito para produtividade.',
    category: 'Eletrônicos',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    createdBy: users[0].id,
  },
  {
    id: uuidv4(),
    name: 'Cadeira Ergonômica FlexComfort',
    description: 'Cadeira de escritório com suporte lombar ajustável, apoio de braço 4D e encosto reclinável. Certificação ergonômica.',
    category: 'Móveis',
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400',
    createdBy: users[1].id,
  },
  {
    id: uuidv4(),
    name: 'Teclado Mecânico KeyStrike RGB',
    description: 'Teclado mecânico com switches Cherry MX Blue, iluminação RGB por tecla e construção em alumínio. Layout ABNT2.',
    category: 'Periféricos',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    createdBy: users[1].id,
  },
  {
    id: uuidv4(),
    name: 'Garrafa Térmica EcoTemp 750ml',
    description: 'Garrafa térmica de aço inoxidável que mantém bebidas quentes por 12h e geladas por 24h. Livre de BPA.',
    category: 'Casa',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    createdBy: users[2].id,
  },
];

const insertProduct = db.prepare(
  'INSERT INTO products (id, name, description, category, image_url, created_by) VALUES (?, ?, ?, ?, ?, ?)'
);

for (const p of products) {
  insertProduct.run(p.id, p.name, p.description, p.category, p.imageUrl, p.createdBy);
}
console.log(`${products.length} produtos criados`);

// --- Avaliações ---
const reviewsData = [
  // Fone Bluetooth — 6 avaliações (ativa resumo)
  { productId: products[0].id, userId: users[1].id, text: 'Qualidade de som excelente, cancelamento de ruído funciona muito bem. Recomendo para quem trabalha de casa.', rating: 5, sentiment: 'positive' },
  { productId: products[0].id, userId: users[2].id, text: 'Ótimo fone, bateria dura bastante e é muito confortável para uso prolongado. Adorei o produto.', rating: 5, sentiment: 'positive' },
  { productId: products[0].id, userId: users[0].id, text: 'Bom produto no geral, mas o Bluetooth às vezes desconecta. Qualidade de som é satisfatória.', rating: 3, sentiment: 'neutral' },
  { productId: products[0].id, userId: users[1].id, text: 'Produto péssimo, quebrou depois de duas semanas de uso. Material muito frágil e decepcionante.', rating: 1, sentiment: 'negative' },
  { productId: products[0].id, userId: users[2].id, text: 'Excelente custo-benefício! Som incrível e design bonito. Perfeito para o dia a dia.', rating: 5, sentiment: 'positive' },
  { productId: products[0].id, userId: users[0].id, text: 'Produto maravilhoso, superou minhas expectativas. A qualidade do som é impressionante.', rating: 5, sentiment: 'positive' },

  // Notebook — 4 avaliações (ativa score)
  { productId: products[1].id, userId: users[1].id, text: 'Notebook excelente para trabalho, rápido e com tela de ótima qualidade. Recomendo muito.', rating: 5, sentiment: 'positive' },
  { productId: products[1].id, userId: users[2].id, text: 'Bom notebook, mas esquenta bastante durante uso intenso. A bateria poderia durar mais.', rating: 3, sentiment: 'neutral' },
  { productId: products[1].id, userId: users[0].id, text: 'Produto ruim, tela com defeito logo na primeira semana. Suporte técnico horrível e demorado.', rating: 1, sentiment: 'negative' },
  { productId: products[1].id, userId: users[1].id, text: 'Muito satisfeito com a compra. Performance incrível e design elegante. Vale cada centavo.', rating: 5, sentiment: 'positive' },

  // Cadeira — 3 avaliações (ativa score)
  { productId: products[2].id, userId: users[0].id, text: 'Cadeira muito confortável, o suporte lombar faz toda a diferença. Qualidade excelente do material.', rating: 5, sentiment: 'positive' },
  { productId: products[2].id, userId: users[2].id, text: 'Boa cadeira, mas a montagem é complicada e as instruções são confusas. Produto ok no geral.', rating: 3, sentiment: 'neutral' },
  { productId: products[2].id, userId: users[1].id, text: 'Adorei a cadeira, muito confortável e bonita. Perfeita para home office. Recomendo.', rating: 5, sentiment: 'positive' },

  // Teclado — 2 avaliações
  { productId: products[3].id, userId: users[0].id, text: 'Teclado excelente, switches responsivos e iluminação RGB linda. Construção sólida em alumínio.', rating: 5, sentiment: 'positive' },
  { productId: products[3].id, userId: users[2].id, text: 'Produto terrível, teclas começaram a falhar depois de um mês. Muito decepcionante pela marca.', rating: 1, sentiment: 'negative' },

  // Garrafa — 1 avaliação
  { productId: products[4].id, userId: users[1].id, text: 'Garrafa ótima, mantém a temperatura por horas. Design bonito e prático para o dia a dia.', rating: 4, sentiment: 'positive' },
];

const insertReview = db.prepare(
  "INSERT INTO reviews (id, product_id, user_id, text, rating, sentiment, sentiment_processed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now', ?))"
);

reviewsData.forEach((r, i) => {
  insertReview.run(uuidv4(), r.productId, r.userId, r.text, r.rating, r.sentiment, `-${reviewsData.length - i} minutes`);
});
console.log(`${reviewsData.length} avaliações criadas`);

// --- Insights (pré-calculados para os produtos com avaliações suficientes) ---
const insertInsight = db.prepare(
  "INSERT INTO product_insights (id, product_id, summary, patterns, smart_score, simple_average, sentiment_distribution, review_count_at_last_update, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))"
);

// Fone Bluetooth — 6 avaliações (resumo + score)
insertInsight.run(
  uuidv4(),
  products[0].id,
  JSON.stringify({
    positives: ['Qualidade de som excelente', 'Bateria dura bastante', 'Excelente custo-benefício', 'Design bonito'],
    negatives: ['Quebrou depois de duas semanas', 'Material muito frágil'],
  }),
  JSON.stringify({ strengths: ['qualidade', 'bateria', 'som'], weaknesses: ['material', 'frágil'] }),
  7.8,
  4.0,
  JSON.stringify({ positive: 66.7, neutral: 16.7, negative: 16.6 }),
  6
);

// Notebook — 4 avaliações (score)
insertInsight.run(
  uuidv4(),
  products[1].id,
  JSON.stringify({
    positives: ['Excelente para trabalho', 'Performance incrível'],
    negatives: ['Tela com defeito', 'Suporte técnico horrível'],
  }),
  null,
  6.2,
  3.5,
  JSON.stringify({ positive: 50, neutral: 25, negative: 25 }),
  4
);

// Cadeira — 3 avaliações (score)
insertInsight.run(
  uuidv4(),
  products[2].id,
  null,
  null,
  7.9,
  4.3,
  JSON.stringify({ positive: 66.7, neutral: 33.3, negative: 0 }),
  3
);

console.log('Insights pré-calculados criados');

closeDb();
console.log('\nSeed concluído com sucesso!');
console.log('Usuários disponíveis (senha: senha1234):');
users.forEach(u => console.log(`  - ${u.email}`));
