import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header.jsx";

// Mock do hook useAuth
const mockLogout = vi.fn();
const mockUseAuth = vi.fn();
vi.mock("../hooks/useAuth.js", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock do useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("usuário não autenticado", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });
    });

    it("deve exibir links de Entrar e Cadastrar", () => {
      renderHeader();

      expect(screen.getByText("Entrar")).toBeInTheDocument();
      expect(screen.getByText("Cadastrar")).toBeInTheDocument();
      expect(screen.queryByText("Sair")).not.toBeInTheDocument();
    });

    it("deve ter link para /login e /register", () => {
      renderHeader();

      expect(screen.getByText("Entrar").closest("a")).toHaveAttribute(
        "href",
        "/login",
      );
      expect(screen.getByText("Cadastrar").closest("a")).toHaveAttribute(
        "href",
        "/register",
      );
    });
  });

  describe("usuário autenticado", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { name: "João Silva" },
        isAuthenticated: true,
        logout: mockLogout,
      });
    });

    it("deve exibir nome do usuário e botão Sair", () => {
      renderHeader();

      expect(screen.getByText("João Silva")).toBeInTheDocument();
      expect(screen.getByText("Sair")).toBeInTheDocument();
      expect(screen.queryByText("Entrar")).not.toBeInTheDocument();
    });

    it('deve chamar logout e navegar para "/" ao clicar em Sair', async () => {
      mockLogout.mockResolvedValueOnce();
      const user = userEvent.setup();
      renderHeader();

      await user.click(screen.getByText("Sair"));

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("busca de produtos", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        logout: mockLogout,
      });
    });

    it("deve renderizar campo de busca com placeholder", () => {
      renderHeader();

      expect(screen.getByLabelText("Buscar produtos")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Buscar produtos..."),
      ).toBeInTheDocument();
    });

    it("deve navegar com query ao submeter busca", async () => {
      const user = userEvent.setup();
      renderHeader();

      await user.type(screen.getByLabelText("Buscar produtos"), "smartphone");
      await user.click(screen.getByRole("button", { name: "Buscar" }));

      expect(mockNavigate).toHaveBeenCalledWith("/?q=smartphone");
    });

    it("não deve navegar quando busca está vazia", async () => {
      const user = userEvent.setup();
      renderHeader();

      await user.click(screen.getByRole("button", { name: "Buscar" }));

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve ter role="search" no formulário de busca', () => {
      renderHeader();

      expect(screen.getByRole("search")).toBeInTheDocument();
    });

    it("deve exibir logo com link para página inicial", () => {
      renderHeader();

      const logo = screen.getByText("InsightReview");
      expect(logo.closest("a")).toHaveAttribute("href", "/");
    });
  });
});
