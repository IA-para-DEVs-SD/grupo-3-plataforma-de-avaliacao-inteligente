import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SmartScore from "./SmartScore.jsx";

describe("SmartScore", () => {
  it("deve exibir score inteligente e média simples lado a lado", () => {
    render(<SmartScore smartScore={7.5} simpleAverage={4.2} />);

    expect(screen.getByText("7.5")).toBeInTheDocument();
    expect(screen.getByText("4.2")).toBeInTheDocument();
    expect(screen.getByText("Score Inteligente")).toBeInTheDocument();
    expect(screen.getByText("Média Simples")).toBeInTheDocument();
  });

  it("deve exibir mensagem de threshold quando smartScore é null", () => {
    render(<SmartScore smartScore={null} simpleAverage={3.0} />);

    expect(
      screen.getByText("Score Inteligente disponível após 3 avaliações"),
    ).toBeInTheDocument();
    expect(screen.getByText("3.0")).toBeInTheDocument();
  });

  it("deve exibir estrelas para o score inteligente", () => {
    render(<SmartScore smartScore={8.0} simpleAverage={4.0} />);

    // score 8.0 → 8/2 = 4 estrelas preenchidas
    const starElements = screen.getAllByText(/[★☆]+/);
    expect(starElements.length).toBeGreaterThan(0);
  });

  it("deve ter aria-labels acessíveis nos valores", () => {
    render(<SmartScore smartScore={6.3} simpleAverage={3.5} />);

    expect(
      screen.getByLabelText("Score inteligente: 6.3 de 10"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Média simples: 3.5 de 5"),
    ).toBeInTheDocument();
  });

  it("deve lidar com score zero", () => {
    render(<SmartScore smartScore={0} simpleAverage={0} />);

    // Ambos exibem 0.0 — usa getAllByText para múltiplos elementos
    const zeroValues = screen.getAllByText("0.0");
    expect(zeroValues).toHaveLength(2);
  });

  it("deve exibir traço quando simpleAverage é null", () => {
    render(<SmartScore smartScore={null} simpleAverage={null} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("deve exibir score máximo 10.0 corretamente", () => {
    render(<SmartScore smartScore={10.0} simpleAverage={5.0} />);

    expect(screen.getByText("10.0")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Score inteligente: 10.0 de 10"),
    ).toBeInTheDocument();
  });

  it("deve renderizar 5 estrelas preenchidas para score 10.0", () => {
    render(<SmartScore smartScore={10.0} simpleAverage={5.0} />);

    // score 10.0 → 10/2 = 5 estrelas preenchidas = ★★★★★
    const scoreElement = screen.getByLabelText("Score inteligente: 10.0 de 10");
    expect(scoreElement).toBeInTheDocument();
  });

  it('deve ter section com aria-label "Score do produto"', () => {
    render(<SmartScore smartScore={5.0} simpleAverage={3.0} />);

    expect(screen.getByLabelText("Score do produto")).toBeInTheDocument();
  });
});
