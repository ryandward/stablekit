import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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

  it("hides inactive views with inline visibility hidden", () => {
    render(
      <LayoutGroup value="a">
        <LayoutView name="a"><p>Alpha</p></LayoutView>
        <LayoutView name="b"><p>Beta</p></LayoutView>
      </LayoutGroup>
    );
    const betaView = screen.getByText("Beta").parentElement!;
    expect(betaView.style.visibility).toBe("hidden");
    expect(betaView.style.opacity).toBe("0");
  });

  it("LayoutView defaults to active when no name and no value", () => {
    render(
      <LayoutGroup>
        <LayoutView><p>Always Active</p></LayoutView>
      </LayoutGroup>
    );
    expect(screen.getByText("Always Active").closest("[inert]")).toBeNull();
  });
});
