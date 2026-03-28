// Rotas de autenticação — registro, login e logout
import { Router } from 'express';
import { register, login, logout } from '../controllers/auth-controller.js';
import { validateRegister, validateLogin } from '../middleware/validation-middleware.js';

const router = Router();

// Cadastro de novo usuário (com validação de entrada)
router.post('/register', validateRegister, register);

// Login de usuário existente (com validação de entrada)
router.post('/login', validateLogin, login);

// Logout (invalidação de token no cliente)
router.post('/logout', logout);

export default router;
