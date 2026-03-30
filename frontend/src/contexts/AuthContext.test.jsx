import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext.jsx";

// Mock do módulo api
vi.mock("../services/api.js", () => ({
  default: {
    post: vi.fn(),
  },
}));

import api from "../services/api.js";

// Componente auxiliar para testar o hook useAuth
function TestConsumer() {
  const { user, isAuthenticated, loading, login, register, logout } = useAuth();

  // Captura erros de logout para evitar unhandled rejection nos testes
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      /* esperado em testes de falha */
    }
  };

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user ? user.name : "null"}</span>
      <button onClick={() => login("test@email.com", "senha1234")}>
        Login
      </button>
      <button onClick={() => register("Teste", "test@email.com", "senha1234")}>
        Register
      </button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("deve iniciar com usuário null e loading false após mount", async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("null");
  });

  it("deve restaurar sessão do localStorage ao montar", async () => {
    localStorage.setItem("token", "token-existente");
    localStorage.setItem("user", JSON.stringify({ name: "Maria" }));

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("Maria");
  });

  it("deve limpar localStorage corrompido ao montar", async () => {
    localStorage.setItem("token", "token-existente");
    localStorage.setItem("user", "json-invalido{{{");

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("deve autenticar usuário após login com sucesso", async () => {
    api.post.mockResolvedValueOnce({
      data: { token: "jwt-token", user: { name: "João" } },
    });
    const user = userEvent.setup();
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("João");
    });
    expect(localStorage.getItem("token")).toBe("jwt-token");
  });

  it("deve autenticar usuário após registro com sucesso", async () => {
    api.post.mockResolvedValueOnce({
      data: { token: "jwt-token-reg", user: { name: "Teste" } },
    });
    const user = userEvent.setup();
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("Teste");
    });
    expect(api.post).toHaveBeenCalledWith("/auth/register", {
      name: "Teste",
      email: "test@email.com",
      password: "senha1234",
    });
  });

  it("deve limpar estado e localStorage após logout", async () => {
    localStorage.setItem("token", "token-existente");
    localStorage.setItem("user", JSON.stringify({ name: "Ana" }));
    api.post.mockResolvedValueOnce({});

    const user = userEvent.setup();
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Ana");
    });

    await user.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("deve limpar estado local mesmo quando API de logout falha", async () => {
    localStorage.setItem("token", "token-existente");
    localStorage.setItem("user", JSON.stringify({ name: "Carlos" }));
    api.post.mockRejectedValueOnce(new Error("Erro de rede"));

    const user = userEvent.setup();
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("Carlos");
    });

    await user.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("deve lançar erro quando useAuth é usado fora do AuthProvider", () => {
    // Suprime o console.error do React para este teste
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth deve ser usado dentro de um AuthProvider",
    );

    spy.mockRestore();
  });
});
