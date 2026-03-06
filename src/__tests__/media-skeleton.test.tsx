import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MediaSkeleton, LoadingContext } from "../index";

describe("MediaSkeleton", () => {
  it("renders container with sk-media class and position relative", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={16 / 9} loading={false}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    const el = container.querySelector(".sk-media") as HTMLElement;
    expect(el).toBeTruthy();
    // jsdom doesn't implement aspect-ratio, but position/overflow are applied.
    expect(el.style.position).toBe("relative");
    expect(el.style.overflow).toBe("hidden");
  });

  it("applies absolute positioning to child via cloneElement", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={false}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    const img = container.querySelector("img") as HTMLElement;
    expect(img.style.position).toBe("absolute");
    expect(img.style.width).toBe("100%");
    expect(img.style.height).toBe("100%");
  });

  it("shows shimmer when loading", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={true}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    expect(container.querySelector(".sk-media-shimmer")).toBeTruthy();
    const img = container.querySelector("img") as HTMLElement;
    expect(img.style.opacity).toBe("0");
  });

  it("hides shimmer when not loading", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={false}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    expect(container.querySelector(".sk-media-shimmer")).toBeNull();
    const img = container.querySelector("img") as HTMLElement;
    expect(img.style.opacity).toBe("1");
  });

  it("falls back to LoadingContext", () => {
    const { container } = render(
      <LoadingContext loading={true}>
        <MediaSkeleton aspectRatio={1}>
          <img src="test.jpg" alt="test" />
        </MediaSkeleton>
      </LoadingContext>
    );
    expect(container.querySelector(".sk-media-shimmer")).toBeTruthy();
  });

  it("preserves child inline styles", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={false}>
        <img src="test.jpg" alt="test" style={{ objectFit: "contain" }} />
      </MediaSkeleton>
    );
    const img = container.querySelector("img") as HTMLElement;
    expect(img.style.objectFit).toBe("contain");
  });

  it("applies custom className", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={false} className="rounded-full">
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    const el = container.querySelector(".sk-media");
    expect(el?.classList.contains("rounded-full")).toBe(true);
  });
});
