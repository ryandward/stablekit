import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CollectionSkeleton } from "../index";

describe("CollectionSkeleton", () => {
  const items = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  it("both layers always present in DOM", () => {
    const { container } = render(
      <CollectionSkeleton
        items={items}
        loading={false}
        stubCount={3}
        exitDuration={0}
        renderItem={(item) => <p key={item.id}>{item.name}</p>}
      />
    );
    expect(container.querySelector(".sk-skeleton-grid")).toBeTruthy();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

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
    const skeletonLayer = container.querySelector(".sk-skeleton-grid")!.parentElement as HTMLElement;
    expect(skeletonLayer.style.opacity).toBe("1");
  });

  it("renders items when not loading", () => {
    const { container } = render(
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
    const skeletonLayer = container.querySelector(".sk-skeleton-grid")!.parentElement as HTMLElement;
    expect(skeletonLayer.style.opacity).toBe("0");
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
