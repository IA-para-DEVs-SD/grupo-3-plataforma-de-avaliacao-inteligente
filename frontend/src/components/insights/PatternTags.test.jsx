import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PatternTags from "./PatternTags.jsx";

describe("PatternTags", () => {
  const patterns = {
    strengths: ["durabilidade", "design"],
    weaknesses: ["preço", "peso"],
  };

  it("deve exibir tags de pontos fortes e fracos", () => {
    render(<PatternTags patterns={patterns} onPatternClick={() => {}} />);

    expect(screen.getByText("durabilidade")).toBeInTheDocument();
    expect(screen.getByText("design")).toBeInTheDocument();
    expect(screen.getByText("preço")).toBeInTheDocument();
    expect(screen.getByText("peso")).toBeInTheDocument();
  });

  it("deve chamar onPatternClick ao clicar em uma tag", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<PatternTags patterns={patterns} onPatternClick={handleClick} />);

    await user.click(screen.getByText("durabilidade"));

    expect(handleClick).toHaveBeenCalledWith("durabilidade");
  });

  it("não deve renderizar nada quando patterns é null", () => {
    const { container } = render(
      <PatternTags patterns={null} onPatternClick={() => {}} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("não deve renderizar nada quando ambas as listas estão vazias", () => {
    const { container } = render(
      <PatternTags
        patterns={{ strengths: [], weaknesses: [] }}
        onPatternClick={() => {}}
      />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("deve ter aria-labels acessíveis nos botões de tag", () => {
    render(<PatternTags patterns={patterns} onPatternClick={() => {}} />);

    expect(
      screen.getByLabelText("Filtrar por: durabilidade"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Filtrar por: preço")).toBeInTheDocument();
  });

  it("deve renderizar apenas pontos fortes quando weaknesses está vazio", () => {
    render(
      <PatternTags
        patterns={{ strengths: ["qualidade", "design"], weaknesses: [] }}
        onPatternClick={() => {}}
      />,
    );

    expect(screen.getByText("Pontos Fortes")).toBeInTheDocument();
    expect(screen.queryByText("Pontos Fracos")).not.toBeInTheDocument();
    expect(screen.getByText("qualidade")).toBeInTheDocument();
    expect(screen.getByText("design")).toBeInTheDocument();
  });

  it("deve renderizar apenas pontos fracos quando strengths está vazio", () => {
    render(
      <PatternTags
        patterns={{ strengths: [], weaknesses: ["preço", "entrega"] }}
        onPatternClick={() => {}}
      />,
    );

    expect(screen.queryByText("Pontos Fortes")).not.toBeInTheDocument();
    expect(screen.getByText("Pontos Fracos")).toBeInTheDocument();
    expect(screen.getByText("preço")).toBeInTheDocument();
    expect(screen.getByText("entrega")).toBeInTheDocument();
  });

  it("deve funcionar sem callback onPatternClick (não lançar erro)", async () => {
    const user = userEvent.setup();
    render(<PatternTags patterns={patterns} onPatternClick={undefined} />);

    // Não deve lançar erro ao clicar
    await user.click(screen.getByText("durabilidade"));
    expect(screen.getByText("durabilidade")).toBeInTheDocument();
  });

  it('deve ter section com aria-label "Padrões recorrentes"', () => {
    render(<PatternTags patterns={patterns} onPatternClick={() => {}} />);

    expect(screen.getByLabelText("Padrões recorrentes")).toBeInTheDocument();
  });
});
