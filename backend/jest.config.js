// Configuração do Jest para o backend com suporte a ES modules nativos
// O projeto usa "type": "module" no package.json, então não precisa de transform

/** @type {import('jest').Config} */
export default {
  // Ambiente de execução Node.js
  testEnvironment: 'node',

  // Sem transformação — ES modules nativos via --experimental-vm-modules
  transform: {},

  // Padrão de busca de arquivos de teste dentro de src/
  testMatch: ['<rootDir>/src/**/*.test.js'],

  // Extensões reconhecidas pelo Jest
  moduleFileExtensions: ['js', 'json'],

  // Timeout maior para testes de propriedade (fast-check) que podem demorar
  testTimeout: 30000,
};
