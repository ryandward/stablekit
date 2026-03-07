import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { LayoutGroup, LayoutView } from "../index";

describe("LayoutGroup + LayoutView", () => {
  it("shows active view and hides inactive views", () => {
    render(
      <LayoutGroup value="a">
        <LayoutView name="a"><p>Alpha</p></LayoutView>
        <LayoutView name="b"><p>Beta</p></LayoutView>
      </LayoutGroup>
    );
    expect(screen.getByText("Alpha").closest("[inert]")).toBeNull();
    expect(screen.getByText("Beta").closest("[inert]")).toBeTruthy();
  });

  it("switches active view when value changes", () => {
    const { rerender } = render(
      <LayoutGroup value="a">
        <LayoutView name="a"><p>Alpha</p></LayoutView>
        <LayoutView name="b"><p>Beta</p></LayoutView>
      </LayoutGroup>
    );

    rerender(
      <LayoutGroup value="b">
        <LayoutView name="a"><p>Alpha</p></LayoutView>
        <LayoutView name="b"><p>Beta</p></LayoutView>
      </LayoutGroup>
    );

    expect(screen.getByText("Alpha").closest("[inert]")).toBeTruthy();
    expect(screen.getByText("Beta").closest("[inert]")).toBeNull();
  });

  it("applies sk-layout-group class", () => {
    const { container } = render(
      <LayoutGroup value="a">
        <LayoutView name="a">A</LayoutView>
      </LayoutGroup>
    );
    expect(container.querySelector(".sk-layout-group")).toBeTruthy();
  });

  it("supports custom className", () => {
    const { container } = render(
      <LayoutGroup value="a" className="my-group">
        <LayoutView name="a">A</LayoutView>
      </LayoutGroup>
    );
    const el = container.querySelector(".sk-layout-group");
    expect(el?.classList.contains("my-group")).toBe(true);
  });

  it("supports custom element via as prop", () => {
    const { container } = render(
      <LayoutGroup value="a" as="section">
        <LayoutView name="a">A</LayoutView>
      </LayoutGroup>
    );
    expect(container.querySelector("section.sk-layout-group")).toBeTruthy();
  });

  it("renders all views in DOM for sizing", () => {
    render(
      <LayoutGroup value="a">
        <LayoutView name="a"><p>Alpha</p></LayoutView>
        <LayoutView name="b"><p>Beta</p></LayoutView>
        <LayoutView name="c"><p>Gamma</p></LayoutView>
      </LayoutGroup>
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("marks inactive views with data-state='inactive'", () => {
    render(
      <LayoutGroup value="a">
        <LayoutView name="a"><p>Alpha</p></LayoutView>
        <LayoutView name="b"><p>Beta</p></LayoutView>
      </LayoutGroup>
    );
    const alphaView = screen.getByText("Alpha").parentElement!;
    const betaView = screen.getByText("Beta").parentElement!;
    expect(alphaView).toHaveAttribute("data-state", "active");
    expect(betaView).toHaveAttribute("data-state", "inactive");
  });

  it("LayoutView defaults to active when no name and no value", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <LayoutGroup>
        <LayoutView><p>Always Active</p></LayoutView>
      </LayoutGroup>
    );
    expect(screen.getByText("Always Active").closest("[inert]")).toBeNull();
    warnSpy.mockRestore();
  });

  it("dev-mode: warns when LayoutGroup has no value prop", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <LayoutGroup>
        <LayoutView name="a">A</LayoutView>
      </LayoutGroup>
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("rendered without a 'value' prop")
    );
    warnSpy.mockRestore();
  });

  it("dev-mode: throws when LayoutView with name is outside LayoutGroup", () => {
    expect(() => {
      render(<LayoutView name="orphan">Orphan</LayoutView>);
    }).toThrow("must be rendered inside a <LayoutGroup> or <LayoutMap>");
  });

  it("dev-mode: does NOT throw for LayoutView without name outside LayoutGroup", () => {
    expect(() => {
      render(<LayoutView>Standalone</LayoutView>);
    }).not.toThrow();
  });
});
