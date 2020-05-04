import { AppState } from "../types";
import { SHIFT_LOCKING_ANGLE } from "../constants";
import { getSelectedElements, globalSceneState } from "../scene";
import { rescalePoints } from "../points";

import { rotate, adjustXYWithRotation } from "../math";
import {
  ExcalidrawLinearElement,
  NonDeletedExcalidrawElement,
  NonDeleted,
  ResizeArrowFnType,
} from "./types";
import {
  getElementAbsoluteCoords,
  getCommonBounds,
  getResizedElementAbsoluteCoords,
} from "./bounds";
import { isLinearElement } from "./typeChecks";
import { mutateElement } from "./mutateElement";
import { getPerfectElementSize } from "./sizeHelpers";
import {
  resizeTest,
  getCursorForResizingElement,
  normalizeResizeHandle,
} from "./resizeTest";
import {
  getResizeCenterPointKey,
  getResizeWithSidesSameLengthKey,
} from "../keys";

type ResizeTestType = ReturnType<typeof resizeTest>;

const arrowResizeOrigin: ResizeArrowFnType = (
  element,
  pointIndex,
  deltaX,
  deltaY,
  pointerX,
  pointerY,
  sidesWithSameLength,
) => {
  const [px, py] = element.points[pointIndex];
  let x = element.x + deltaX;
  let y = element.y + deltaY;
  let pointX = px - deltaX;
  let pointY = py - deltaY;

  if (sidesWithSameLength) {
    const { width, height } = getPerfectElementSize(
      element.type,
      px + element.x - pointerX,
      py + element.y - pointerY,
    );
    x = px + element.x - width;
    y = py + element.y - height;
    pointX = width;
    pointY = height;
  }

  mutateElement(element, {
    x,
    y,
    points: element.points.map((point, i) =>
      i === pointIndex ? ([pointX, pointY] as const) : point,
    ),
  });
};

const arrowResizeEnd: ResizeArrowFnType = (
  element,
  pointIndex,
  deltaX,
  deltaY,
  pointerX,
  pointerY,
  sidesWithSameLength,
) => {
  const [px, py] = element.points[pointIndex];
  if (sidesWithSameLength) {
    const { width, height } = getPerfectElementSize(
      element.type,
      pointerX - element.x,
      pointerY - element.y,
    );
    mutateElement(element, {
      points: element.points.map((point, i) =>
        i === pointIndex ? ([width, height] as const) : point,
      ),
    });
  } else {
    mutateElement(element, {
      points: element.points.map((point, i) =>
        i === pointIndex ? ([px + deltaX, py + deltaY] as const) : point,
      ),
    });
  }
};

const applyResizeArrowFn = (
  element: NonDeleted<ExcalidrawLinearElement>,
  resizeArrowFn: ResizeArrowFnType | null,
  setResizeArrowFn: (fn: ResizeArrowFnType) => void,
  isResizeEnd: boolean,
  sidesWithSameLength: boolean,
  x: number,
  y: number,
  lastX: number,
  lastY: number,
) => {
  const angle = element.angle;
  const [deltaX, deltaY] = rotate(x - lastX, y - lastY, 0, 0, -angle);
  if (!resizeArrowFn) {
    if (isResizeEnd) {
      resizeArrowFn = arrowResizeEnd;
    } else {
      resizeArrowFn = arrowResizeOrigin;
    }
  }
  resizeArrowFn(element, 1, deltaX, deltaY, x, y, sidesWithSameLength);
  setResizeArrowFn(resizeArrowFn);
};

export const resizeElements = (
  resizeHandle: ResizeTestType,
  setResizeHandle: (nextResizeHandle: ResizeTestType) => void,
  appState: AppState,
  setAppState: (obj: any) => void,
  resizeArrowFn: ResizeArrowFnType | null, // XXX eliminate in #1339
  setResizeArrowFn: (fn: ResizeArrowFnType) => void, // XXX eliminate in #1339
  event: PointerEvent, // XXX we want to make it independent?
  xPointer: number,
  yPointer: number,
  lastX: number, // XXX eliminate in #1339
  lastY: number, // XXX eliminate in #1339
) => {
  setAppState({
    isResizing: resizeHandle !== "rotation",
    isRotating: resizeHandle === "rotation",
  });
  const selectedElements = getSelectedElements(
    globalSceneState.getElements(),
    appState,
  );
  const handleOffset = 4 / appState.zoom; // XXX import constant
  const dashedLinePadding = 4 / appState.zoom; // XXX import constant
  const offsetPointer = handleOffset + dashedLinePadding;
  const minSize = 0;
  if (selectedElements.length === 1) {
    const [element] = selectedElements;
    const [x1, y1, x2, y2] = getElementAbsoluteCoords(element);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    if (resizeHandle === "rotation") {
      let angle = (5 * Math.PI) / 2 + Math.atan2(yPointer - cy, xPointer - cx);
      if (event.shiftKey) {
        angle += SHIFT_LOCKING_ANGLE / 2;
        angle -= angle % SHIFT_LOCKING_ANGLE;
      }
      if (angle >= 2 * Math.PI) {
        angle -= 2 * Math.PI;
      }
      mutateElement(element, { angle });
    } else if (
      isLinearElement(element) &&
      element.points.length === 2 &&
      (resizeHandle === "nw" ||
        resizeHandle === "ne" ||
        resizeHandle === "sw" ||
        resizeHandle === "se")
    ) {
      const [, [px, py]] = element.points;
      const isResizeEnd =
        (resizeHandle === "nw" && (px < 0 || py < 0)) ||
        (resizeHandle === "ne" && px >= 0) ||
        (resizeHandle === "sw" && px <= 0) ||
        (resizeHandle === "se" && (px > 0 || py > 0));
      applyResizeArrowFn(
        element,
        resizeArrowFn,
        setResizeArrowFn,
        isResizeEnd,
        event.shiftKey,
        xPointer,
        yPointer,
        lastX,
        lastY,
      );
    } else if (resizeHandle) {
      const side = resizeHandle;
      // rotation with current angle
      const [rotatedX, rotatedY] = rotate(
        xPointer,
        yPointer,
        cx,
        cy,
        -element.angle,
      );
      // XXX this might be slow with closure
      const adjustWithOffsetPointer = (wh: number) => {
        if (wh > offsetPointer) {
          return wh - offsetPointer;
        } else if (wh < -offsetPointer) {
          return wh + offsetPointer;
        }
        return 0;
      };
      let scaleX = 1;
      let scaleY = 1;
      if (side === "e" || side === "ne" || side === "se") {
        scaleX = adjustWithOffsetPointer(rotatedX - x1) / (x2 - x1);
      }
      if (side === "s" || side === "sw" || side === "se") {
        scaleY = adjustWithOffsetPointer(rotatedY - y1) / (y2 - y1);
      }
      if (side === "w" || side === "nw" || side === "sw") {
        scaleX = adjustWithOffsetPointer(x2 - rotatedX) / (x2 - x1);
      }
      if (side === "n" || side === "nw" || side === "ne") {
        scaleY = adjustWithOffsetPointer(y2 - rotatedY) / (y2 - y1);
      }
      let nextWidth = element.width * scaleX;
      let nextHeight = element.height * scaleY;
      if (getResizeWithSidesSameLengthKey(event)) {
        nextWidth = nextHeight = Math.max(nextWidth, nextHeight);
      }
      const [nextX1, nextY1, nextX2, nextY2] = getResizedElementAbsoluteCoords(
        element,
        nextWidth,
        nextHeight,
      );
      const deltaX1 = (x1 - nextX1) / 2;
      const deltaY1 = (y1 - nextY1) / 2;
      const deltaX2 = (x2 - nextX2) / 2;
      const deltaY2 = (y2 - nextY2) / 2;
      const [
        finalX1,
        finalY1,
        finalX2,
        finalY2,
      ] = getResizedElementAbsoluteCoords(
        {
          ...element,
          ...(isLinearElement(element)
            ? {
                points: rescalePoints(
                  0,
                  nextWidth,
                  rescalePoints(1, nextHeight, element.points),
                ),
              }
            : {}),
        },
        Math.abs(nextWidth),
        Math.abs(nextHeight),
      );
      let flipDiffX = 0;
      let flipDiffY = 0;
      if (nextWidth < 0) {
        if (side === "e" || side === "ne" || side === "se") {
          if (isLinearElement(element)) {
            flipDiffX += (finalX2 - nextX1) * Math.cos(element.angle);
            flipDiffY += (finalX2 - nextX1) * Math.sin(element.angle);
          } else {
            flipDiffX += finalX2 - nextX1;
          }
        }
        if (side === "w" || side === "nw" || side === "sw") {
          if (isLinearElement(element)) {
            flipDiffX += (finalX1 - nextX2) * Math.cos(element.angle);
            flipDiffY += (finalX1 - nextX2) * Math.sin(element.angle);
          } else {
            flipDiffX += finalX1 - nextX2;
          }
        }
      }
      if (nextHeight < 0) {
        if (side === "s" || side === "se" || side === "sw") {
          if (isLinearElement(element)) {
            flipDiffY += (finalY2 - nextY1) * Math.cos(element.angle);
            flipDiffX += (finalY2 - nextY1) * -Math.sin(element.angle);
          } else {
            flipDiffY += finalY2 - nextY1;
          }
        }
        if (side === "n" || side === "ne" || side === "nw") {
          if (isLinearElement(element)) {
            flipDiffY += (finalY1 - nextY2) * Math.cos(element.angle);
            flipDiffX += (finalY1 - nextY2) * -Math.sin(element.angle);
          } else {
            flipDiffY += finalY1 - nextY2;
          }
        }
      }
      const resized = {
        width: nextWidth,
        height: nextHeight,
        ...adjustXYWithRotation(
          resizeHandle,
          element.x - flipDiffX,
          element.y - flipDiffY,
          element.angle,
          deltaX1,
          deltaY1,
          deltaX2,
          deltaY2,
          getResizeCenterPointKey(event),
        ),
      };
      if (
        Math.abs(resized.width) > minSize &&
        Math.abs(resized.height) > minSize &&
        !Number.isNaN(resized.x) &&
        !Number.isNaN(resized.y)
      ) {
        mutateElement(element, {
          ...resized,
          ...(isLinearElement(element)
            ? {
                points: rescalePoints(
                  0,
                  resized.width,
                  rescalePoints(1, resized.height, element.points),
                ),
              }
            : {}),
        });
      }
    }

    if (resizeHandle) {
      setResizeHandle(normalizeResizeHandle(element, resizeHandle));
      if (element.width < 0) {
        mutateElement(element, {
          width: -element.width,
        });
      }
      if (element.height < 0) {
        mutateElement(element, {
          height: -element.height,
        });
      }
    }

    // do we need this?
    document.documentElement.style.cursor = getCursorForResizingElement({
      element,
      resizeHandle,
    });
    // why do we need this?
    if (appState.resizingElement) {
      mutateElement(appState.resizingElement, {
        x: element.x,
        y: element.y,
      });
    }

    return true;
  } else if (selectedElements.length > 1) {
    const [x1, y1, x2, y2] = getCommonBounds(selectedElements);
    const minScale = Math.max(minSize / (x2 - x1), minSize / (y2 - y1));
    switch (resizeHandle) {
      case "se": {
        const scale = Math.max(
          (xPointer - offsetPointer - x1) / (x2 - x1),
          (yPointer - offsetPointer - y1) / (y2 - y1),
        );
        if (scale > minScale) {
          selectedElements.forEach((element) => {
            const width = element.width * scale;
            const height = element.height * scale;
            const x = element.x + (element.x - x1) * (scale - 1);
            const y = element.y + (element.y - y1) * (scale - 1);
            mutateElement(element, { width, height, x, y });
          });
        }
        return true;
      }
      case "nw": {
        const scale = Math.max(
          (x2 - offsetPointer - xPointer) / (x2 - x1),
          (y2 - offsetPointer - yPointer) / (y2 - y1),
        );
        if (scale > minScale) {
          selectedElements.forEach((element) => {
            const width = element.width * scale;
            const height = element.height * scale;
            const x = element.x - (x2 - element.x) * (scale - 1);
            const y = element.y - (y2 - element.y) * (scale - 1);
            mutateElement(element, { width, height, x, y });
          });
        }
        return true;
      }
      case "ne": {
        const scale = Math.max(
          (xPointer - offsetPointer - x1) / (x2 - x1),
          (y2 - offsetPointer - yPointer) / (y2 - y1),
        );
        if (scale > minScale) {
          selectedElements.forEach((element) => {
            const width = element.width * scale;
            const height = element.height * scale;
            const x = element.x + (element.x - x1) * (scale - 1);
            const y = element.y - (y2 - element.y) * (scale - 1);
            mutateElement(element, { width, height, x, y });
          });
        }
        return true;
      }
      case "sw": {
        const scale = Math.max(
          (x2 - offsetPointer - xPointer) / (x2 - x1),
          (yPointer - offsetPointer - y1) / (y2 - y1),
        );
        if (scale > minScale) {
          selectedElements.forEach((element) => {
            const width = element.width * scale;
            const height = element.height * scale;
            const x = element.x - (x2 - element.x) * (scale - 1);
            const y = element.y + (element.y - y1) * (scale - 1);
            mutateElement(element, { width, height, x, y });
          });
        }
        return true;
      }
    }
  }
  return false;
};

export const canResizeMutlipleElements = (
  elements: readonly NonDeletedExcalidrawElement[],
) => {
  return elements.every((element) =>
    ["rectangle", "diamond", "ellipse"].includes(element.type),
  );
};
