import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LayoutMap } from "../index";

describe("LayoutMap", () => {
  it("shows the active view and hides others", () => {
    render(
      <LayoutMap
        value="profile"
        map={{
          profile: <p>Profile Content</p>,
          invoices: <p>Invoice Content</p>,
        }}
      />
    );
    expect(screen.getByText("Profile Content").closest("[inert]")).toBeNull();
    expect(screen.getByText("Invoice Content").closest("[inert]")).toBeTruthy();
  });

  it("switches views when value changes", () => {
    const { rerender } = render(
      <LayoutMap
        value="profile"
        map={{
          profile: <p>Profile</p>,
          invoices: <p>Invoices</p>,
        }}
      />
    );

    rerender(
      <LayoutMap
        value="invoices"
        map={{
          profile: <p>Profile</p>,
          invoices: <p>Invoices</p>,
        }}
      />
    );

    expect(screen.getByText("Profile").closest("[inert]")).toBeTruthy();
    expect(screen.getByText("Invoices").closest("[inert]")).toBeNull();
  });

  it("renders all views in DOM for stable sizing", () => {
    render(
      <LayoutMap
        value="a"
        map={{
          a: <p>Alpha</p>,
          b: <p>Beta</p>,
          c: <p>Gamma</p>,
        }}
      />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("passes extra props to the container", () => {
    const { container } = render(
      <LayoutMap
        value="a"
        map={{ a: <p>A</p> }}
        data-testid="my-map"
      />
    );
    expect(container.querySelector("[data-testid='my-map']")).toBeTruthy();
  });
});
