// Testes unitários para ai-queue.js — enfileiramento, processamento e retentativas
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Importa diretamente (sem mocks — testa a fila real)
let enqueue, getQueueLength;

beforeEach(async () => {
  // Reimporta o módulo para resetar o estado da fila entre testes
  jest.resetModules();
  const mod = await import('./ai-queue.js');
  enqueue = mod.enqueue;
  getQueueLength = mod.getQueueLength;
});

describe('ai-queue', () => {
  it('deve enfileirar e processar uma tarefa com sucesso', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);

    enqueue({ handler, data: { text: 'teste' } });

    // Aguarda processamento assíncrono
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(handler).toHaveBeenCalledWith({ text: 'teste' });
  });

  it('deve processar múltiplas tarefas em sequência', async () => {
    const order = [];
    const handler1 = jest.fn().mockImplementation(async () => { order.push(1); });
    const handler2 = jest.fn().mockImplementation(async () => { order.push(2); });

    enqueue({ handler: handler1, data: {} });
    enqueue({ handler: handler2, data: {} });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
    expect(order).toEqual([1, 2]);
  });

  it('deve retornar o tamanho da fila', () => {
    // Fila começa vazia
    expect(getQueueLength()).toBe(0);
  });

  it('deve retentar tarefa que falha até 3 vezes', async () => {
    const handler = jest.fn()
      .mockRejectedValueOnce(new Error('falha 1'))
      .mockRejectedValueOnce(new Error('falha 2'))
      .mockRejectedValueOnce(new Error('falha 3'));

    enqueue({ handler, data: {} });

    // Aguarda tempo suficiente para backoff: 1s + 2s + 4s + margem
    await new Promise((resolve) => setTimeout(resolve, 8000));

    expect(handler).toHaveBeenCalledTimes(3);
  }, 15000);

  it('deve processar com sucesso após retentativa', async () => {
    const handler = jest.fn()
      .mockRejectedValueOnce(new Error('falha temporária'))
      .mockResolvedValueOnce(undefined);

    enqueue({ handler, data: { id: 1 } });

    // Aguarda backoff de 1s + margem
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledWith({ id: 1 });
  }, 5000);
});
