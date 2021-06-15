import { SceneState } from "../../src/scene/types";
import { AppState, NormalizedZoomValue } from "../../src/types";

export const defaultAppState: AppState = {
  isLoading: false,
  errorMessage: null,
  draggingElement: null,
  resizingElement: null,
  multiElement: null,
  selectionElement: null,
  isBindingEnabled: false,
  startBoundElement: null,
  suggestedBindings: null,
  editingElement: null,
  editingLinearElement: null,
  elementType: null,
  elementLocked: null,
  exportBackground: null,
  exportEmbedScene: null,
  exportWithDarkMode: null,
  exportScale: null,
  currentItemStrokeColor: null,
  currentItemBackgroundColor: null,
  currentItemFillStyle: null,
  currentItemStrokeWidth: null,
  currentItemStrokeStyle: null,
  currentItemRoughness: null,
  currentItemOpacity: null,
  currentItemFontFamily: null,
  currentItemFontSize: null,
  currentItemTextAlign: null,
  currentItemStrokeSharpness: null,
  currentItemStartArrowhead: null,
  currentItemEndArrowhead: null,
  currentItemLinearStrokeSharpness: null,
  viewBackgroundColor: null,
  scrollX: null,
  scrollY: null,
  cursorButton: null,
  scrolledOutside: null,
  name: null,
  isResizing: null,
  isRotating: null,
  zoom: {
    translation: {
      x: 0,
      y: 0,
    },
    value: 1 as NormalizedZoomValue,
  },
  openMenu: null,
  openPopup: null,
  lastPointerDownWith: null,
  selectedElementIds: {},
  previousSelectedElementIds: null,
  shouldCacheIgnoreZoom: null,
  showHelpDialog: null,
  toastMessage: null,
  zenModeEnabled: null,
  theme: null,
  gridSize: null,
  viewModeEnabled: null,
  selectedGroupIds: {},
  editingGroupId: null,
  width: null,
  height: null,
  offsetTop: null,
  offsetLeft: null,
  isLibraryOpen: null,
  fileHandle: null,
  collaborators: null,
  showStats: null,
  currentChartType: null,
  pasteDialog: null,
};

export const defaultSceneState: SceneState = {
  zoom: {
    translation: {
      x: 0,
      y: 0,
    },
    value: 1 as NormalizedZoomValue,
  },
  remoteSelectedElementIds: {},
  scrollX: 0,
  scrollY: 0,
  viewBackgroundColor: "ffffff",
  shouldCacheIgnoreZoom: false,
  remotePointerViewportCoords: {},
  remotePointerUsernames: {},
  remotePointerUserStates: {},
};
