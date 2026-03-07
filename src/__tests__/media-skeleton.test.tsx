import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MediaSkeleton, LoadingContext } from "../index";

/** Simulate the image loading in jsdom (which doesn't fire onLoad natively). */
function simulateImageLoad(container: HTMLElement) {
  const img = container.querySelector("img") as HTMLImageElement;
  fireEvent.load(img);
}

describe("MediaSkeleton", () => {
  it("renders container with sk-media class and position relative", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={16 / 9} loading={false}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    const el = container.querySelector(".sk-media") as HTMLElement;
    expect(el).toBeTruthy();
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

  it("shimmer always present in DOM", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={false}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    simulateImageLoad(container);
    expect(container.querySelector(".sk-media-shimmer")).toBeTruthy();
  });

  it("shows shimmer when loading", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={true}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    const shimmer = container.querySelector(".sk-media-shimmer") as HTMLElement;
    expect(shimmer.style.opacity).toBe("1");
    const img = container.querySelector("img") as HTMLElement;
    expect(img.style.opacity).toBe("0");
  });

  it("shows shimmer when not loading but media has not loaded yet", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={false}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    const shimmer = container.querySelector(".sk-media-shimmer") as HTMLElement;
    expect(shimmer.style.opacity).toBe("1");
    const img = container.querySelector("img") as HTMLElement;
    expect(img.style.opacity).toBe("0");
  });

  it("hides shimmer after media fires onLoad", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={false}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    simulateImageLoad(container);
    const shimmer = container.querySelector(".sk-media-shimmer") as HTMLElement;
    expect(shimmer.style.opacity).toBe("0");
    const img = container.querySelector("img") as HTMLElement;
    expect(img.style.opacity).toBe("1");
  });

  it("keeps shimmer while loading even if media fires onLoad", () => {
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={true}>
        <img src="test.jpg" alt="test" />
      </MediaSkeleton>
    );
    simulateImageLoad(container);
    const shimmer = container.querySelector(".sk-media-shimmer") as HTMLElement;
    expect(shimmer.style.opacity).toBe("1");
  });

  it("falls back to LoadingContext", () => {
    const { container } = render(
      <LoadingContext loading={true}>
        <MediaSkeleton aspectRatio={1}>
          <img src="test.jpg" alt="test" />
        </MediaSkeleton>
      </LoadingContext>
    );
    const shimmer = container.querySelector(".sk-media-shimmer") as HTMLElement;
    expect(shimmer.style.opacity).toBe("1");
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

  it("preserves existing onLoad handler on child", () => {
    let handlerCalled = false;
    const { container } = render(
      <MediaSkeleton aspectRatio={1} loading={false}>
        <img src="test.jpg" alt="test" onLoad={() => { handlerCalled = true; }} />
      </MediaSkeleton>
    );
    simulateImageLoad(container);
    expect(handlerCalled).toBe(true);
    const shimmer = container.querySelector(".sk-media-shimmer") as HTMLElement;
    expect(shimmer.style.opacity).toBe("0");
  });
});
