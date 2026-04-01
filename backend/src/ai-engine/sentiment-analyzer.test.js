// Testes unitários para sentiment-analyzer.js
// Mocka o ollama-client para garantir que os testes usem sempre o fallback heurístico
import { describe, it, expect, jest } from "@jest/globals";

// Mock do ollama-client — desativa Ollama nos testes
jest.unstable_mockModule("./ollama-client.js", () => ({
  isOllamaAvailable: async () => false,
  generate: async () => "",
}));

const { analyzeSentiment } = await import("./sentiment-analyzer.js");

describe("analyzeSentiment", () => {
  it('deve retornar "positive" para texto com mais palavras positivas', async () => {
    expect(await analyzeSentiment("Produto excelente, ótimo e de qualidade!")).toBe("positive");
  });

  it('deve retornar "negative" para texto com mais palavras negativas', async () => {
    expect(await analyzeSentiment("Produto péssimo, horrível, um lixo total")).toBe("negative");
  });

  it('deve retornar "neutral" quando positivas e negativas empatam', async () => {
    expect(await analyzeSentiment("Produto bom mas com defeito")).toBe("neutral");
  });

  it('deve retornar "neutral" para texto sem palavras-chave', async () => {
    expect(await analyzeSentiment("Comprei este produto na loja do centro")).toBe("neutral");
  });

  it('deve retornar "neutral" para texto vazio', async () => {
    expect(await analyzeSentiment("")).toBe("neutral");
  });

  it('deve retornar "neutral" para null', async () => {
    expect(await analyzeSentiment(null)).toBe("neutral");
  });

  it('deve retornar "neutral" para undefined', async () => {
    expect(await analyzeSentiment(undefined)).toBe("neutral");
  });

  it("deve ser case-insensitive", async () => {
    expect(await analyzeSentiment("EXCELENTE produto, ÓTIMO!")).toBe("positive");
  });

  it("deve detectar palavras positivas em português", async () => {
    const positiveTexts = [
      "Adorei este produto, recomendo!",
      "Perfeito, maravilhoso e incrível",
      "Estou muito satisfeito com a qualidade",
    ];
    for (const text of positiveTexts) {
      expect(await analyzeSentiment(text)).toBe("positive");
    }
  });

  it("deve detectar palavras negativas em português", async () => {
    const negativeTexts = [
      "Terrível, o produto quebrou no primeiro dia",
      "Muito ruim e decepcionante, estou insatisfeito",
      "Tem problema sério, péssimo produto",
    ];
    for (const text of negativeTexts) {
      expect(await analyzeSentiment(text)).toBe("negative");
    }
  });

  it('deve retornar "neutral" para texto com apenas espaços em branco', async () => {
    expect(await analyzeSentiment("     ")).toBe("neutral");
  });

  it('deve retornar "neutral" para texto com apenas números', async () => {
    expect(await analyzeSentiment("12345 67890")).toBe("neutral");
  });

  it('deve retornar "neutral" para tipo não-string (número)', async () => {
    expect(await analyzeSentiment(12345)).toBe("neutral");
  });

  it('deve retornar "neutral" para array', async () => {
    expect(await analyzeSentiment(["excelente"])).toBe("neutral");
  });

  it("deve classificar corretamente texto com palavras positivas e negativas misturadas (maioria positiva)", async () => {
    expect(
      await analyzeSentiment("Produto excelente e ótimo, recomendo apesar do pequeno defeito")
    ).toBe("positive");
  });

  it("deve classificar corretamente texto com palavras positivas e negativas misturadas (maioria negativa)", async () => {
    expect(
      await analyzeSentiment("Bom design mas péssimo acabamento, horrível e com problema")
    ).toBe("negative");
  });
});
