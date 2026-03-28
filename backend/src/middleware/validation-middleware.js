// Middleware de validação de entrada usando express-validator
// Schemas de validação para registro e login com mensagens em pt-BR

import { body, validationResult } from 'express-validator';
import { AppError } from './error-middleware.js';

/**
 * Middleware que verifica erros de validação e lança AppError VALIDATION_ERROR (422)
 * com array de detalhes contendo campo e mensagem de cada erro.
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
export function handleValidationErrors(req, _res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    throw new AppError(
      'VALIDATION_ERROR',
      'Dados de entrada inválidos',
      details
    );
  }

  next();
}

/**
 * Validação para registro de usuário:
 * - name: não vazio, trimmed
 * - email: formato válido, normalizado
 * - password: mínimo 8 caracteres
 */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório'),

  body('email')
    .isEmail()
    .withMessage('Formato de e-mail inválido')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter no mínimo 8 caracteres'),

  handleValidationErrors,
];

/**
 * Validação para criação de produto:
 * - name: não vazio, trimmed
 * - description: não vazio, trimmed
 * - category: não vazio, trimmed
 */
export const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome do produto é obrigatório'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Descrição do produto é obrigatória'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Categoria do produto é obrigatória'),

  handleValidationErrors,
];

/**
 * Validação para login de usuário:
 * - email: formato válido, normalizado
 * - password: não vazio
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Formato de e-mail inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),

  handleValidationErrors,
];
