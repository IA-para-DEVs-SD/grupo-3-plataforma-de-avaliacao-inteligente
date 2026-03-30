import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // Ignora pastas de build e dependências
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
    ],
  },

  // Configuração base para todo o projeto (backend + frontend)
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-undef": "error",
      "prefer-const": "warn",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },

  // Configuração específica para React (frontend)
  {
    files: ["frontend/**/*.jsx", "frontend/**/*.js"],
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },

  // Configuração para arquivos de teste (globais do vitest/jest)
  {
    files: ["**/*.test.js", "**/*.test.jsx", "**/__tests__/**"],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
        test: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "off",
    },
  },

  // Desabilita regras que conflitam com Prettier (deve ser o último)
  eslintConfigPrettier,
];
