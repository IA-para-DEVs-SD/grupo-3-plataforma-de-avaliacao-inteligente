import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock do axios para isolar os testes da instância real
vi.mock('axios', () => {
  const requestInterceptors = [];
  const responseInterceptors = [];

  const instance = {
    interceptors: {
      request: {
        use: vi.fn((onFulfilled, onRejected) => {
          requestInterceptors.push({ onFulfilled, onRejected });
        }),
      },
      response: {
        use: vi.fn((onFulfilled, onRejected) => {
          responseInterceptors.push({ onFulfilled, onRejected });
        }),
      },
    },
    defaults: { headers: { common: {} } },
    _requestInterceptors: requestInterceptors,
    _responseInterceptors: responseInterceptors,
  };

  return {
    default: {
      create: vi.fn(() => instance),
    },
  };
});

describe('api.js — instância axios configurada', () => {
  let api;
  let mockInstance;

  beforeEach(async () => {
    // Limpa localStorage antes de cada teste
    localStorage.clear();

    // Limpa cache do módulo para re-executar os interceptors
    vi.resetModules();

    // Reimporta para registrar interceptors novamente
    const axiosMod = await import('axios');
    mockInstance = axiosMod.default.create();
    // Limpa interceptors anteriores
    mockInstance._requestInterceptors.length = 0;
    mockInstance._responseInterceptors.length = 0;

    const module = await import('./api.js');
    api = module.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve criar instância axios com baseURL correta', async () => {
    const axiosMod = await import('axios');
    expect(axiosMod.default.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: 'http://localhost:3000/api',
      })
    );
  });

  it('deve definir Content-Type como application/json', async () => {
    const axiosMod = await import('axios');
    expect(axiosMod.default.create).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('deve registrar interceptor de requisição', () => {
    expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
  });

  it('deve registrar interceptor de resposta', () => {
    expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
  });

  describe('interceptor de requisição', () => {
    it('deve adicionar token JWT no header Authorization quando presente', () => {
      localStorage.setItem('token', 'meu-token-jwt-123');

      const requestInterceptor = mockInstance._requestInterceptors[0].onFulfilled;
      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer meu-token-jwt-123');
    });

    it('não deve adicionar header Authorization quando token não existe', () => {
      const requestInterceptor = mockInstance._requestInterceptors[0].onFulfilled;
      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('deve rejeitar erro no interceptor de requisição', async () => {
      const requestErrorHandler = mockInstance._requestInterceptors[0].onRejected;
      const error = new Error('erro de rede');

      await expect(requestErrorHandler(error)).rejects.toThrow('erro de rede');
    });
  });

  describe('interceptor de resposta', () => {
    it('deve retornar resposta normalmente em caso de sucesso', () => {
      const responseInterceptor = mockInstance._responseInterceptors[0].onFulfilled;
      const response = { data: { ok: true }, status: 200 };
      const result = responseInterceptor(response);

      expect(result).toEqual(response);
    });

    it('deve limpar token e redirecionar para /login em erro 401', async () => {
      localStorage.setItem('token', 'token-expirado');

      // Mock do window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: '' };

      const responseErrorHandler = mockInstance._responseInterceptors[0].onRejected;
      const error = { response: { status: 401 } };

      try {
        await responseErrorHandler(error);
      } catch {
        // Esperado — o interceptor rejeita o erro após tratar
      }

      expect(localStorage.getItem('token')).toBeNull();
      expect(window.location.href).toBe('/login');

      // Restaura window.location
      window.location = originalLocation;
    });

    it('não deve limpar token para erros diferentes de 401', async () => {
      localStorage.setItem('token', 'token-valido');

      const responseErrorHandler = mockInstance._responseInterceptors[0].onRejected;
      const error = { response: { status: 500 } };

      try {
        await responseErrorHandler(error);
      } catch {
        // Esperado
      }

      expect(localStorage.getItem('token')).toBe('token-valido');
    });

    it('deve rejeitar o erro mesmo após tratar 401', async () => {
      delete window.location;
      window.location = { href: '' };

      const responseErrorHandler = mockInstance._responseInterceptors[0].onRejected;
      const error = { response: { status: 401 } };

      await expect(responseErrorHandler(error)).rejects.toEqual(error);

      window.location = { href: window.location.href };
    });
  });
});
