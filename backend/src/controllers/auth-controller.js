// Controller de autenticação — handlers para registro, login e logout
import { registerUser, loginUser, logoutUser } from '../services/auth-service.js';

/**
 * Handler de registro de novo usuário.
 * Extrai nome, email e password do body, cria a conta e retorna user + token.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const { user, token } = await registerUser({ name, email, password });
    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler de login de usuário.
 * Extrai email e password do body, autentica e retorna user + token.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser({ email, password });
    res.status(200).json({ user, token });
  } catch (error) {
    next(error);
  }
}

/**
 * Handler de logout de usuário.
 * Extrai o token do header Authorization e o invalida na blacklist.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function logout(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;
    logoutUser(token);
    res.status(200).json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    next(error);
  }
}
