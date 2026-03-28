// Middleware de autenticação — verifica JWT e injeta req.user
import { verifyToken, isTokenBlacklisted } from '../services/auth-service.js';
import { findById } from '../models/user-model.js';
import { AppError } from './error-middleware.js';

/**
 * Middleware que protege rotas autenticadas.
 * Extrai o token JWT do header Authorization (Bearer scheme),
 * verifica se não está na blacklist, valida a assinatura,
 * busca o usuário pelo ID do payload e injeta em req.user.
 *
 * @param {import('express').Request} req - Requisição Express
 * @param {import('express').Response} _res - Resposta Express (não utilizada)
 * @param {import('express').NextFunction} next - Próximo middleware
 */
export async function authMiddleware(req, _res, next) {
  try {
    // Extrai o header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'Token de autenticação não fornecido');
    }

    // Extrai o token do header
    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('UNAUTHORIZED', 'Token de autenticação não fornecido');
    }

    // Verifica se o token foi invalidado por logout
    if (isTokenBlacklisted(token)) {
      throw new AppError('UNAUTHORIZED', 'Token invalidado');
    }

    // Verifica e decodifica o token JWT
    const payload = verifyToken(token);

    // Busca o usuário pelo ID do payload
    const user = await findById(payload.userId);
    if (!user) {
      throw new AppError('UNAUTHORIZED', 'Usuário não encontrado');
    }

    // Injeta o usuário autenticado na requisição
    req.user = user;
    next();
  } catch (error) {
    // Se já for um AppError, repassa; senão, encapsula como UNAUTHORIZED
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('UNAUTHORIZED', 'Falha na autenticação'));
    }
  }
}
