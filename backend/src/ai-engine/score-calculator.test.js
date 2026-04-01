// Testes unitários para score-calculator.js
// calculateSmartScore retorna { score: number, confidence: number }
import { describe, it, expect } from "@jest/globals";
import { calculateSmartScore } from "./score-calculator.js";

/** Helper: extrai o score numérico do resultado */
function getScore(result) {
  return result?.score ?? result;
}

describe("calculateSmartScore", () => {
  it("deve retornar 0.0 para lista vazia", () => {
    expect(getScore(calculateSmartScore([], null, null))).toBe(0.0);
  });

  it("deve retornar 0.0 para null", () => {
    expect(getScore(calculateSmartScore(null, null, null))).toBe(0.0);
  });

  it("deve retornar score no intervalo [0.0, 10.0]", () => {
    const reviews = [
      { rating: 5, createdAt: "2024-01-01" },
      { rating: 4, createdAt: "2024-01-02" },
      { rating: 3, createdAt: "2024-01-03" },
    ];
    const distribution = { positive: 60, neutral: 20, negative: 20 };
    const score = getScore(calculateSmartScore(reviews, distribution, null));
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(10.0);
  });

  it("deve retornar score com 1 casa decimal", () => {
    const reviews = [
      { rating: 4, createdAt: "2024-01-01" },
      { rating: 3, createdAt: "2024-01-02" },
    ];
    const distribution = { positive: 50, neutral: 25, negative: 25 };
    const score = getScore(calculateSmartScore(reviews, distribution, null));
    const decimalPlaces = (score.toString().split(".")[1] || "").length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });

  it("deve dar score alto para avaliações todas positivas com nota 5", () => {
    const reviews = [
      { rating: 5, createdAt: "2024-01-01" },
      { rating: 5, createdAt: "2024-01-02" },
      { rating: 5, createdAt: "2024-01-03" },
    ];
    const distribution = { positive: 100, neutral: 0, negative: 0 };
    const score = getScore(calculateSmartScore(reviews, distribution, null));
    expect(score).toBeGreaterThanOrEqual(7.0);
  });

  it("deve dar score baixo para avaliações todas negativas com nota 1", () => {
    const reviews = [
      { rating: 1, createdAt: "2024-01-01" },
      { rating: 1, createdAt: "2024-01-02" },
      { rating: 1, createdAt: "2024-01-03" },
    ];
    const distribution = { positive: 0, neutral: 0, negative: 100 };
    const score = getScore(calculateSmartScore(reviews, distribution, null));
    // Com fator Bayesiano (3 avaliações vs threshold 20), score converge para média da plataforma
    // Score bruto seria ~0, mas Bayesiano puxa para 7.0 → resultado entre 0 e 7
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(7.0);
  });

  it("deve usar sentimento neutro (5.0) quando distribuição é null", () => {
    const reviews = [
      { rating: 3, createdAt: "2024-01-01" },
      { rating: 3, createdAt: "2024-01-02" },
      { rating: 3, createdAt: "2024-01-03" },
    ];
    const scoreWithNull = getScore(calculateSmartScore(reviews, null, null));
    const scoreWithNeutral = getScore(calculateSmartScore(
      reviews,
      { positive: 50, neutral: 0, negative: 50 },
      null,
    ));
    // Ambos devem ter sentimento neutro (5.0), então scores devem ser iguais
    expect(scoreWithNull).toBe(scoreWithNeutral);
  });

  it("deve dar mais peso a avaliações recentes no componente de recência", () => {
    // Avaliações recentes boas, antigas ruins
    const reviewsRecentGood = [
      { rating: 1, createdAt: "2024-01-01" },
      { rating: 1, createdAt: "2024-01-02" },
      { rating: 5, createdAt: "2024-06-01" },
      { rating: 5, createdAt: "2024-06-02" },
    ];
    // Avaliações recentes ruins, antigas boas
    const reviewsRecentBad = [
      { rating: 5, createdAt: "2024-01-01" },
      { rating: 5, createdAt: "2024-01-02" },
      { rating: 1, createdAt: "2024-06-01" },
      { rating: 1, createdAt: "2024-06-02" },
    ];
    const dist = { positive: 50, neutral: 0, negative: 50 };
    const scoreRecentGood = getScore(calculateSmartScore(reviewsRecentGood, dist, null));
    const scoreRecentBad = getScore(calculateSmartScore(reviewsRecentBad, dist, null));
    // Score com avaliações recentes boas deve ser maior
    expect(scoreRecentGood).toBeGreaterThan(scoreRecentBad);
  });

  it("deve funcionar com uma única avaliação", () => {
    const reviews = [{ rating: 4, createdAt: "2024-01-01" }];
    const distribution = { positive: 100, neutral: 0, negative: 0 };
    const score = getScore(calculateSmartScore(reviews, distribution, null));
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(10.0);
  });

  it("deve retornar 0.0 para undefined", () => {
    expect(getScore(calculateSmartScore(undefined, null, null))).toBe(0.0);
  });

  it("deve lidar com reviews sem campo rating (undefined)", () => {
    const reviews = [
      { createdAt: "2024-01-01" },
      { createdAt: "2024-01-02" },
      { createdAt: "2024-01-03" },
    ];
    const score = getScore(calculateSmartScore(reviews, null, null));
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(10.0);
  });

  it("deve lidar com reviews sem campo createdAt", () => {
    const reviews = [{ rating: 4 }, { rating: 5 }, { rating: 3 }];
    const distribution = { positive: 70, neutral: 20, negative: 10 };
    const score = getScore(calculateSmartScore(reviews, distribution, null));
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(10.0);
  });

  it("deve retornar score alto para cenário ideal (nota 5, 100% positivo)", () => {
    const reviews = [
      { rating: 5, createdAt: "2024-06-01" },
      { rating: 5, createdAt: "2024-06-02" },
      { rating: 5, createdAt: "2024-06-03" },
    ];
    const distribution = { positive: 100, neutral: 0, negative: 0 };
    const score = getScore(calculateSmartScore(reviews, distribution, null));
    // Com fator Bayesiano (3 avaliações vs threshold 20), score converge para média da plataforma
    expect(score).toBeGreaterThanOrEqual(7.0);
    expect(score).toBeLessThanOrEqual(10.0);
  });

  it("deve retornar score baixo para cenário pior caso (nota 1, 100% negativo)", () => {
    const reviews = [
      { rating: 1, createdAt: "2024-01-01" },
      { rating: 1, createdAt: "2024-01-02" },
      { rating: 1, createdAt: "2024-01-03" },
    ];
    const distribution = { positive: 0, neutral: 0, negative: 100 };
    const score = getScore(calculateSmartScore(reviews, distribution, null));
    // Com fator Bayesiano, score converge para média da plataforma (não chega a 0)
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(7.0);
  });

  it("deve lidar com grande volume de avaliações (100+)", () => {
    const reviews = Array.from({ length: 100 }, (_, i) => ({
      rating: (i % 5) + 1,
      createdAt: `2024-01-${String((i % 28) + 1).padStart(2, "0")}`,
    }));
    const distribution = { positive: 40, neutral: 30, negative: 30 };
    const score = getScore(calculateSmartScore(reviews, distribution, null));
    expect(score).toBeGreaterThanOrEqual(0.0);
    expect(score).toBeLessThanOrEqual(10.0);
  });

  it("deve retornar objeto com score e confidence", () => {
    const reviews = [{ rating: 4, createdAt: "2024-01-01" }];
    const result = calculateSmartScore(reviews, null, null);
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("confidence");
    expect(typeof result.score).toBe("number");
    expect(typeof result.confidence).toBe("number");
  });
});
