import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CollectionSkeleton } from "../index";

describe("CollectionSkeleton", () => {
  const items = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  it("shows skeleton grid when loading", () => {
    const { container } = render(
      <CollectionSkeleton
        items={[]}
        loading={true}
        stubCount={3}
        exitDuration={0}
        renderItem={() => null}
      />
    );
    expect(container.querySelector(".sk-skeleton-grid")).toBeTruthy();
    expect(container.querySelectorAll(".sk-skeleton-bone")).toHaveLength(3);
  });

  it("renders items when not loading", () => {
    render(
      <CollectionSkeleton
        items={items}
        loading={false}
        stubCount={3}
        exitDuration={0}
        renderItem={(item) => <p key={item.id}>{item.name}</p>}
      />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(document.querySelector(".sk-skeleton-grid")).toBeNull();
  });

  it("wraps in SizeRatchet", () => {
    const { container } = render(
      <CollectionSkeleton
        items={[]}
        loading={true}
        stubCount={2}
        exitDuration={0}
        renderItem={() => null}
      />
    );
    expect(container.querySelector(".sk-size-ratchet")).toBeTruthy();
  });
});
