import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createPrimitive } from "../index";

describe("createPrimitive", () => {
  it("renders the correct HTML tag with the base class", () => {
    const Card = createPrimitive("div", "sk-card");
    render(<Card data-testid="card">hello</Card>);
    const el = screen.getByTestId("card");
    expect(el.tagName).toBe("DIV");
    expect(el.className).toBe("sk-card");
    expect(el.textContent).toBe("hello");
  });

  it("renders a different tag when specified", () => {
    const Section = createPrimitive("section", "sk-section");
    render(<Section data-testid="sec">content</Section>);
    expect(screen.getByTestId("sec").tagName).toBe("SECTION");
  });

  it("supports multiple base classes", () => {
    const Button = createPrimitive("button", "sk-button sk-transition");
    render(<Button data-testid="btn">click</Button>);
    expect(screen.getByTestId("btn").className).toBe("sk-button sk-transition");
  });

  it("maps variant props to data-attributes", () => {
    const Badge = createPrimitive("span", "sk-badge", {
      variant: ["active", "trial", "churned"],
    });
    render(<Badge variant="active" data-testid="badge">Paid</Badge>);
    const el = screen.getByTestId("badge");
    expect(el).toHaveAttribute("data-variant", "active");
    // variant should NOT appear as an HTML attribute
    expect(el).not.toHaveAttribute("variant");
  });

  it("maps multiple variant props to separate data-attributes", () => {
    const Button = createPrimitive("button", "sk-button", {
      variant: ["primary", "secondary"],
      size: ["sm", "md", "lg"],
    });
    render(<Button variant="primary" size="lg" data-testid="btn">go</Button>);
    const el = screen.getByTestId("btn");
    expect(el).toHaveAttribute("data-variant", "primary");
    expect(el).toHaveAttribute("data-size", "lg");
  });

  it("passes through standard HTML attributes", () => {
    const Button = createPrimitive("button", "sk-button");
    render(
      <Button data-testid="btn" type="submit" disabled aria-label="Save">
        Save
      </Button>
    );
    const el = screen.getByTestId("btn");
    expect(el).toHaveAttribute("type", "submit");
    expect(el).toBeDisabled();
    expect(el).toHaveAttribute("aria-label", "Save");
  });

  it("works with no variants (firewall only)", () => {
    const Card = createPrimitive("div", "sk-card");
    render(<Card data-testid="card">content</Card>);
    const el = screen.getByTestId("card");
    expect(el.className).toBe("sk-card");
    expect(el.textContent).toBe("content");
  });
});
