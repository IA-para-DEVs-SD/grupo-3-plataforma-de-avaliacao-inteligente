import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateReviewText,
  validateRating,
  validateProductName,
  validateProductDescription,
  validateProductCategory,
} from "./validators.js";

describe("validateEmail", () => {
  it("deve retornar null para e-mail válido", () => {
    expect(validateEmail("usuario@exemplo.com")).toBeNull();
  });

  it("deve retornar erro para e-mail vazio", () => {
    expect(validateEmail("")).toBe("O e-mail é obrigatório");
  });

  it("deve retornar erro para null/undefined", () => {
    expect(validateEmail(null)).toBe("O e-mail é obrigatório");
    expect(validateEmail(undefined)).toBe("O e-mail é obrigatório");
  });

  it("deve retornar erro para formato inválido sem @", () => {
    expect(validateEmail("semArroba")).toBe("Formato de e-mail inválido");
  });

  it("deve retornar erro para formato inválido sem domínio", () => {
    expect(validateEmail("user@")).toBe("Formato de e-mail inválido");
  });

  it("deve retornar erro para string apenas com espaços", () => {
    expect(validateEmail("   ")).toBe("O e-mail é obrigatório");
  });
});

describe("validatePassword", () => {
  it("deve retornar null para senha com 8+ caracteres", () => {
    expect(validatePassword("12345678")).toBeNull();
  });

  it("deve retornar erro para senha com menos de 8 caracteres", () => {
    expect(validatePassword("1234567")).toBe(
      "A senha deve ter no mínimo 8 caracteres",
    );
  });

  it("deve retornar erro para senha vazia", () => {
    expect(validatePassword("")).toBe("A senha é obrigatória");
  });

  it("deve retornar erro para null/undefined", () => {
    expect(validatePassword(null)).toBe("A senha é obrigatória");
    expect(validatePassword(undefined)).toBe("A senha é obrigatória");
  });
});

describe("validateName", () => {
  it("deve retornar null para nome válido", () => {
    expect(validateName("João Silva")).toBeNull();
  });

  it("deve retornar erro para nome vazio", () => {
    expect(validateName("")).toBe("O nome é obrigatório");
  });

  it("deve retornar erro para string apenas com espaços", () => {
    expect(validateName("   ")).toBe("O nome é obrigatório");
  });

  it("deve retornar erro para null/undefined", () => {
    expect(validateName(null)).toBe("O nome é obrigatório");
  });
});

describe("validateReviewText", () => {
  it("deve retornar null para texto com 20+ caracteres", () => {
    expect(
      validateReviewText("Este produto é muito bom e recomendo"),
    ).toBeNull();
  });

  it("deve retornar erro para texto com menos de 20 caracteres", () => {
    expect(validateReviewText("Texto curto")).toBe(
      "O texto da avaliação deve ter no mínimo 20 caracteres",
    );
  });

  it("deve retornar erro para texto vazio", () => {
    expect(validateReviewText("")).toBe("O texto da avaliação é obrigatório");
  });

  it("deve retornar erro para null/undefined", () => {
    expect(validateReviewText(null)).toBe("O texto da avaliação é obrigatório");
  });

  it("deve considerar o texto trimado para contagem de caracteres", () => {
    // 19 caracteres reais + espaços ao redor
    expect(validateReviewText("   texto com poucos   ")).toBe(
      "O texto da avaliação deve ter no mínimo 20 caracteres",
    );
  });
});

describe("validateRating", () => {
  it("deve retornar null para nota válida (1 a 5)", () => {
    for (let i = 1; i <= 5; i++) {
      expect(validateRating(i)).toBeNull();
    }
  });

  it("deve retornar erro para nota 0", () => {
    expect(validateRating(0)).toBe(
      "A nota deve ser um número inteiro entre 1 e 5",
    );
  });

  it("deve retornar erro para nota 6", () => {
    expect(validateRating(6)).toBe(
      "A nota deve ser um número inteiro entre 1 e 5",
    );
  });

  it("deve retornar erro para nota decimal", () => {
    expect(validateRating(3.5)).toBe(
      "A nota deve ser um número inteiro entre 1 e 5",
    );
  });

  it("deve retornar erro para nota negativa", () => {
    expect(validateRating(-1)).toBe(
      "A nota deve ser um número inteiro entre 1 e 5",
    );
  });

  it("deve retornar erro para null/undefined/vazio", () => {
    expect(validateRating(null)).toBe("A nota é obrigatória");
    expect(validateRating(undefined)).toBe("A nota é obrigatória");
    expect(validateRating("")).toBe("A nota é obrigatória");
  });
});

describe("validateProductName", () => {
  it("deve retornar null para nome de produto válido", () => {
    expect(validateProductName("Smartphone XYZ")).toBeNull();
  });

  it("deve retornar erro para nome vazio", () => {
    expect(validateProductName("")).toBe("O nome do produto é obrigatório");
  });

  it("deve retornar erro para null", () => {
    expect(validateProductName(null)).toBe("O nome do produto é obrigatório");
  });
});

describe("validateProductDescription", () => {
  it("deve retornar null para descrição válida", () => {
    expect(validateProductDescription("Um ótimo produto")).toBeNull();
  });

  it("deve retornar erro para descrição vazia", () => {
    expect(validateProductDescription("")).toBe(
      "A descrição do produto é obrigatória",
    );
  });

  it("deve retornar erro para null", () => {
    expect(validateProductDescription(null)).toBe(
      "A descrição do produto é obrigatória",
    );
  });
});

describe("validateProductCategory", () => {
  it("deve retornar null para categoria válida", () => {
    expect(validateProductCategory("Eletrônicos")).toBeNull();
  });

  it("deve retornar erro para categoria vazia", () => {
    expect(validateProductCategory("")).toBe(
      "A categoria do produto é obrigatória",
    );
  });

  it("deve retornar erro para null", () => {
    expect(validateProductCategory(null)).toBe(
      "A categoria do produto é obrigatória",
    );
  });
});

// --- Testes de edge cases adicionais ---

describe("validateEmail — edge cases", () => {
  it("deve aceitar e-mail com caracteres especiais no local part", () => {
    expect(validateEmail("user+tag@exemplo.com")).toBeNull();
  });

  it("deve rejeitar e-mail com espaços no meio", () => {
    expect(validateEmail("user @exemplo.com")).toBe(
      "Formato de e-mail inválido",
    );
  });

  it("deve aceitar e-mail com subdomínio", () => {
    expect(validateEmail("user@mail.exemplo.com.br")).toBeNull();
  });

  it("deve rejeitar e-mail sem parte local", () => {
    expect(validateEmail("@exemplo.com")).toBe("Formato de e-mail inválido");
  });

  it("deve retornar erro para tipo numérico", () => {
    expect(validateEmail(12345)).toBe("O e-mail é obrigatório");
  });
});

describe("validatePassword — edge cases", () => {
  it("deve aceitar senha com exatamente 8 caracteres (limite)", () => {
    expect(validatePassword("abcdefgh")).toBeNull();
  });

  it("deve aceitar senha com caracteres especiais e Unicode", () => {
    expect(validatePassword("sénhã@123")).toBeNull();
  });

  it("deve aceitar senha muito longa (100+ caracteres)", () => {
    expect(validatePassword("a".repeat(200))).toBeNull();
  });

  it("deve retornar erro para tipo numérico", () => {
    expect(validatePassword(12345678)).toBe("A senha é obrigatória");
  });
});

describe("validateReviewText — edge cases", () => {
  it("deve aceitar texto com exatamente 20 caracteres (limite)", () => {
    expect(validateReviewText("12345678901234567890")).toBeNull();
  });

  it("deve rejeitar texto com 19 caracteres reais e espaços extras", () => {
    expect(validateReviewText("  1234567890123456789  ")).toBe(
      "O texto da avaliação deve ter no mínimo 20 caracteres",
    );
  });

  it("deve aceitar texto com emojis e caracteres Unicode", () => {
    expect(
      validateReviewText("Produto muito bom! 👍 Recomendo para todos"),
    ).toBeNull();
  });

  it("deve retornar erro para tipo numérico", () => {
    expect(validateReviewText(12345)).toBe(
      "O texto da avaliação é obrigatório",
    );
  });
});

describe("validateRating — edge cases", () => {
  it("deve aceitar nota como string numérica válida", () => {
    expect(validateRating("3")).toBeNull();
  });

  it("deve rejeitar NaN", () => {
    expect(validateRating(NaN)).toBe(
      "A nota deve ser um número inteiro entre 1 e 5",
    );
  });

  it("deve rejeitar Infinity", () => {
    expect(validateRating(Infinity)).toBe(
      "A nota deve ser um número inteiro entre 1 e 5",
    );
  });

  it("deve rejeitar string não numérica", () => {
    expect(validateRating("abc")).toBe(
      "A nota deve ser um número inteiro entre 1 e 5",
    );
  });
});
