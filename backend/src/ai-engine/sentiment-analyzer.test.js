// Testes unitários para sentiment-analyzer.js
import { describe, it, expect } from "@jest/globals";
import { analyzeSentiment } from "./sentiment-analyzer.js";

describe("analyzeSentiment", () => {
  it('deve retornar "positive" para texto com mais palavras positivas', () => {
    expect(analyzeSentiment("Produto excelente, ótimo e de qualidade!")).toBe(
      "positive",
    );
  });

  it('deve retornar "negative" para texto com mais palavras negativas', () => {
    expect(analyzeSentiment("Produto péssimo, horrível, um lixo total")).toBe(
      "negative",
    );
  });

  it('deve retornar "neutral" quando positivas e negativas empatam', () => {
    expect(analyzeSentiment("Produto bom mas com defeito")).toBe("neutral");
  });

  it('deve retornar "neutral" para texto sem palavras-chave', () => {
    expect(analyzeSentiment("Comprei este produto na loja do centro")).toBe(
      "neutral",
    );
  });

  it('deve retornar "neutral" para texto vazio', () => {
    expect(analyzeSentiment("")).toBe("neutral");
  });

  it('deve retornar "neutral" para null', () => {
    expect(analyzeSentiment(null)).toBe("neutral");
  });

  it('deve retornar "neutral" para undefined', () => {
    expect(analyzeSentiment(undefined)).toBe("neutral");
  });

  it("deve ser case-insensitive", () => {
    expect(analyzeSentiment("EXCELENTE produto, ÓTIMO!")).toBe("positive");
  });

  it("deve detectar palavras positivas em português", () => {
    const positiveTexts = [
      "Adorei este produto, recomendo!",
      "Perfeito, maravilhoso e incrível",
      "Estou muito satisfeito com a qualidade",
    ];
    for (const text of positiveTexts) {
      expect(analyzeSentiment(text)).toBe("positive");
    }
  });

  it("deve detectar palavras negativas em português", () => {
    const negativeTexts = [
      "Terrível, o produto quebrou no primeiro dia",
      "Muito ruim e decepcionante, estou insatisfeito",
      "Tem problema sério, péssimo produto",
    ];
    for (const text of negativeTexts) {
      expect(analyzeSentiment(text)).toBe("negative");
    }
  });

  it('deve retornar "neutral" para texto com apenas espaços em branco', () => {
    expect(analyzeSentiment("     ")).toBe("neutral");
  });

  it('deve retornar "neutral" para texto com apenas números', () => {
    expect(analyzeSentiment("12345 67890")).toBe("neutral");
  });

  it('deve retornar "neutral" para tipo não-string (número)', () => {
    expect(analyzeSentiment(12345)).toBe("neutral");
  });

  it('deve retornar "neutral" para array', () => {
    expect(analyzeSentiment(["excelente"])).toBe("neutral");
  });

  it("deve classificar corretamente texto com palavras positivas e negativas misturadas (maioria positiva)", () => {
    // 3 positivas (excelente, ótimo, recomendo) vs 1 negativa (defeito)
    expect(
      analyzeSentiment(
        "Produto excelente e ótimo, recomendo apesar do pequeno defeito",
      ),
    ).toBe("positive");
  });

  it("deve classificar corretamente texto com palavras positivas e negativas misturadas (maioria negativa)", () => {
    // 1 positiva (bom) vs 3 negativas (péssimo, horrível, problema)
    expect(
      analyzeSentiment(
        "Bom design mas péssimo acabamento, horrível e com problema",
      ),
    ).toBe("negative");
  });
});
