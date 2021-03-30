import { NonDeletedExcalidrawElement } from "../element/types";
import * as exportUtils from "../scene/export";
import * as utils from "../utils";
import { diamondFixture, ellipseFixture } from "./fixtures/elementFixture";

describe("Test isTransparent", () => {
  it("should return true when color is rgb transparent", () => {
    expect(utils.isTransparent("#ff00")).toEqual(true);
    expect(utils.isTransparent("#fff00000")).toEqual(true);
    expect(utils.isTransparent("transparent")).toEqual(true);
  });

  it("should return false when color is not transparent", () => {
    expect(utils.isTransparent("#ced4da")).toEqual(false);
  });
});

describe("exportToSvg", () => {
  const ELEMENT_HEIGHT = 100;
  const ELEMENT_WIDTH = 100;
  const ELEMENTS = [
    { ...diamondFixture, height: ELEMENT_HEIGHT, width: ELEMENT_WIDTH },
    { ...ellipseFixture, height: ELEMENT_HEIGHT, width: ELEMENT_WIDTH },
  ] as NonDeletedExcalidrawElement[];

  const DEFAULT_OPTIONS = {
    exportBackground: false,
    viewBackgroundColor: "#ffffff",
    shouldAddWatermark: false,
  };

  it("with default arguments", () => {
    const svgElement = exportUtils.exportToSvg(ELEMENTS, DEFAULT_OPTIONS);

    expect(svgElement).toMatchSnapshot();
  });

  it("with background color", () => {
    const BACKGROUND_COLOR = "#abcdef";

    const svgElement = exportUtils.exportToSvg(ELEMENTS, {
      ...DEFAULT_OPTIONS,
      exportBackground: true,
      viewBackgroundColor: BACKGROUND_COLOR,
    });

    expect(svgElement.querySelector("rect")).toHaveAttribute(
      "fill",
      BACKGROUND_COLOR,
    );
  });

  it("with watermark", () => {
    const svgElement = exportUtils.exportToSvg(ELEMENTS, {
      ...DEFAULT_OPTIONS,
      shouldAddWatermark: true,
    });

    expect(svgElement.querySelector("text")?.textContent).toMatchInlineSnapshot(
      `"Made with Excalidraw"`,
    );
  });

  it("with dark mode", () => {
    const svgElement = exportUtils.exportToSvg(ELEMENTS, {
      ...DEFAULT_OPTIONS,
      exportWithDarkMode: true,
    });

    expect(svgElement.getAttribute("filter")).toMatchInlineSnapshot(
      `"themeFilter"`,
    );
  });

  it("with exportPadding, metadata", () => {
    const svgElement = exportUtils.exportToSvg(ELEMENTS, {
      ...DEFAULT_OPTIONS,
      exportPadding: 0,
      metadata: "some metadata",
    });

    expect(svgElement.innerHTML).toMatch(/some metadata/);
    expect(svgElement).toHaveAttribute("height", ELEMENT_HEIGHT.toString());
    expect(svgElement).toHaveAttribute("width", ELEMENT_WIDTH.toString());
    expect(svgElement).toHaveAttribute(
      "viewBox",
      `0 0 ${ELEMENT_WIDTH} ${ELEMENT_HEIGHT}`,
    );
  });

  it("with scale", () => {
    const SCALE = 2;

    const svgElement = exportUtils.exportToSvg(ELEMENTS, {
      ...DEFAULT_OPTIONS,
      exportPadding: 0,
      scale: SCALE,
    });

    expect(svgElement).toHaveAttribute(
      "height",
      (ELEMENT_HEIGHT * SCALE).toString(),
    );
    expect(svgElement).toHaveAttribute(
      "width",
      (ELEMENT_WIDTH * SCALE).toString(),
    );
  });
});
