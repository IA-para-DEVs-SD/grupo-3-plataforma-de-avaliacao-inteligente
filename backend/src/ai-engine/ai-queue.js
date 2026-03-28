// Fila de processamento assíncrono para o motor de IA
// Processa tarefas uma por vez com retentativas e backoff exponencial

/** Fila de tarefas em memória */
const queue = [];

/** Indica se a fila está processando uma tarefa */
let processing = false;

/** Número máximo de retentativas por tarefa */
const MAX_RETRIES = 3;

/** Delay base para backoff exponencial (em ms) */
const BASE_DELAY_MS = 1000;

/**
 * Adiciona uma tarefa à fila de processamento.
 * A tarefa será processada de forma assíncrona.
 * @param {{ handler: Function, data: any }} task — tarefa com handler assíncrono e dados
 */
export function enqueue(task) {
  queue.push({ handler: task.handler, data: task.data, retries: 0 });

  // Inicia o processamento se não estiver rodando
  if (!processing) {
    setImmediate(processNext);
  }
}

/**
 * Retorna o número de tarefas pendentes na fila (para testes).
 * @returns {number}
 */
export function getQueueLength() {
  return queue.length;
}

/**
 * Processa a próxima tarefa da fila.
 * Em caso de falha, aplica backoff exponencial e reenfileira (máx. 3 tentativas).
 */
async function processNext() {
  if (queue.length === 0) {
    processing = false;
    return;
  }

  processing = true;
  const task = queue.shift();

  try {
    await task.handler(task.data);
  } catch (error) {
    task.retries += 1;

    if (task.retries < MAX_RETRIES) {
      // Reenfileira com backoff exponencial: 1s, 2s, 4s
      const delay = BASE_DELAY_MS * Math.pow(2, task.retries - 1);
      setTimeout(() => {
        queue.push(task);
        if (!processing) {
          setImmediate(processNext);
        }
      }, delay);
    } else {
      // Falha definitiva após 3 tentativas — registra no log
      console.error(
        `[AI Queue] Falha definitiva após ${MAX_RETRIES} tentativas:`,
        error.message || error
      );
    }
  }

  // Processa a próxima tarefa
  setImmediate(processNext);
}
