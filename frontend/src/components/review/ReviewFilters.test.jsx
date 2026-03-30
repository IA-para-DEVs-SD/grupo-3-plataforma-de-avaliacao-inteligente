import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReviewFilters from "./ReviewFilters.jsx";

describe("ReviewFilters — filtros de sentimento e ordenação", () => {
  it("deve renderizar seletores de sentimento e ordenação", () => {
    render(
      <ReviewFilters
        sentiment=""
        sort=""
        onFilterChange={() => {}}
        onSortChange={() => {}}
      />,
    );

    expect(screen.getByLabelText("Sentimento")).toBeInTheDocument();
    expect(screen.getByLabelText("Ordenar por")).toBeInTheDocument();
  });

  it("deve chamar onFilterChange ao alterar sentimento", async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <ReviewFilters
        sentiment=""
        sort=""
        onFilterChange={onFilterChange}
        onSortChange={() => {}}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Sentimento"), "positive");

    expect(onFilterChange).toHaveBeenCalledWith("positive");
  });

  it("deve chamar onSortChange ao alterar ordenação", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    render(
      <ReviewFilters
        sentiment=""
        sort=""
        onFilterChange={() => {}}
        onSortChange={onSortChange}
      />,
    );

    await user.selectOptions(
      screen.getByLabelText("Ordenar por"),
      "rating_asc",
    );

    expect(onSortChange).toHaveBeenCalledWith("rating_asc");
  });

  it("deve refletir valores selecionados nas props", () => {
    render(
      <ReviewFilters
        sentiment="negative"
        sort="rating_desc"
        onFilterChange={() => {}}
        onSortChange={() => {}}
      />,
    );

    expect(screen.getByLabelText("Sentimento")).toHaveValue("negative");
    expect(screen.getByLabelText("Ordenar por")).toHaveValue("rating_desc");
  });

  it('deve ter role="group" com aria-label acessível', () => {
    render(
      <ReviewFilters
        sentiment=""
        sort=""
        onFilterChange={() => {}}
        onSortChange={() => {}}
      />,
    );

    expect(screen.getByRole("group")).toHaveAttribute(
      "aria-label",
      "Filtros de avaliações",
    );
  });

  it("deve exibir todas as opções de sentimento", () => {
    render(
      <ReviewFilters
        sentiment=""
        sort=""
        onFilterChange={() => {}}
        onSortChange={() => {}}
      />,
    );

    const sentimentSelect = screen.getByLabelText("Sentimento");
    const options = sentimentSelect.querySelectorAll("option");
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent("Todos");
    expect(options[1]).toHaveTextContent("Positivas");
    expect(options[2]).toHaveTextContent("Neutras");
    expect(options[3]).toHaveTextContent("Negativas");
  });

  it("deve exibir todas as opções de ordenação", () => {
    render(
      <ReviewFilters
        sentiment=""
        sort=""
        onFilterChange={() => {}}
        onSortChange={() => {}}
      />,
    );

    const sortSelect = screen.getByLabelText("Ordenar por");
    const options = sortSelect.querySelectorAll("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Mais recentes");
    expect(options[1]).toHaveTextContent("Nota crescente");
    expect(options[2]).toHaveTextContent("Nota decrescente");
  });

  it('deve permitir resetar filtro de sentimento para "Todos"', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();
    render(
      <ReviewFilters
        sentiment="positive"
        sort=""
        onFilterChange={onFilterChange}
        onSortChange={() => {}}
      />,
    );

    await user.selectOptions(screen.getByLabelText("Sentimento"), "");

    expect(onFilterChange).toHaveBeenCalledWith("");
  });
});
