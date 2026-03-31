// Rotas de autenticação — registro, login e logout
import { Router } from 'express';
import { login, logout, register } from '../controllers/auth-controller.js';
import { authMiddleware } from '../middleware/auth-middleware.js';
import { validateLogin, validateRegister } from '../middleware/validation-middleware.js';

const router = Router();

// Cadastro de novo usuário (com validação de entrada)
router.post('/register', validateRegister, register);

// Login de usuário existente (com validação de entrada)
router.post('/login', validateLogin, login);

// Logout (autenticado — invalida o token na blacklist)
router.post('/logout', authMiddleware, logout);

export default router;
