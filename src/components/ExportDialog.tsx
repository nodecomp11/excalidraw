import "./ExportDialog.css";

import React, { useState, useEffect, useRef } from "react";

import { Modal } from "./Modal";
import { ToolIcon } from "./ToolIcon";
import { clipboard, exportFile, downloadFile } from "./icons";
import { Island } from "./Island";
import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
import { getExportCanvasPreview } from "../scene/data";
import { ActionsManagerInterface, UpdaterFn } from "../actions/types";
import Stack from "./Stack";

const probablySupportsClipboard =
  "toBlob" in HTMLCanvasElement.prototype &&
  "clipboard" in navigator &&
  "write" in navigator.clipboard &&
  "ClipboardItem" in window;

export function ExportDialog({
  elements,
  appState,
  exportPadding = 10,
  actionManager,
  syncActionResult,
  onExportToPng,
  onExportToClipboard
}: {
  appState: AppState;
  elements: readonly ExcalidrawElement[];
  exportPadding?: number;
  actionManager: ActionsManagerInterface;
  syncActionResult: UpdaterFn;
  onExportToPng(elements: readonly ExcalidrawElement[]): void;
  onExportToClipboard(elements: readonly ExcalidrawElement[]): void;
}) {
  const someElementIsSelected = elements.some(element => element.isSelected);
  const [modalIsShown, setModalIsShown] = useState(false);
  const [exportSelected, setExportSelected] = useState(someElementIsSelected);
  const previeRef = useRef<HTMLDivElement>(null);
  const { exportBackground, viewBackgroundColor } = appState;

  const exportedElements = exportSelected
    ? elements.filter(element => element.isSelected)
    : elements;

  useEffect(() => {
    setExportSelected(someElementIsSelected);
  }, [someElementIsSelected]);

  useEffect(() => {
    const previewNode = previeRef.current;
    const canvas = getExportCanvasPreview(exportedElements, {
      exportBackground,
      viewBackgroundColor,
      exportPadding
    });
    previewNode?.appendChild(canvas);
    return () => {
      previewNode?.removeChild(canvas);
    };
  }, [
    modalIsShown,
    exportedElements,
    exportBackground,
    exportPadding,
    viewBackgroundColor
  ]);

  function handleClose() {
    setModalIsShown(false);
    setExportSelected(someElementIsSelected);
  }

  return (
    <>
      <ToolIcon
        onClick={() => setModalIsShown(true)}
        icon={exportFile}
        type="button"
        aria-label="Show export dialog"
      />
      {modalIsShown && (
        <Modal maxWidth={640} onCloseRequest={handleClose}>
          <Island padding={4}>
            <h2>Export</h2>
            <div className="ExportDialog__preview" ref={previeRef}></div>
            <div className="ExportDialog__actions">
              <Stack.Row gap={2}>
                <ToolIcon
                  type="button"
                  icon={downloadFile}
                  title="Export to PNG"
                  aria-label="Export to PNG"
                  onClick={() => onExportToPng(exportedElements)}
                />

                {probablySupportsClipboard && (
                  <ToolIcon
                    type="button"
                    icon={clipboard}
                    title="Copy to clipboard"
                    aria-label="Copy to clipboard"
                    onClick={() => onExportToClipboard(exportedElements)}
                  />
                )}
              </Stack.Row>

              {actionManager.renderAction(
                "changeProjectName",
                elements,
                appState,
                syncActionResult
              )}
              <Stack.Col gap={1}>
                {actionManager.renderAction(
                  "changeExportBackground",
                  elements,
                  appState,
                  syncActionResult
                )}
                {someElementIsSelected && (
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={exportSelected}
                        onChange={e =>
                          setExportSelected(e.currentTarget.checked)
                        }
                      />{" "}
                      Only selected
                    </label>
                  </div>
                )}
              </Stack.Col>
            </div>
          </Island>
        </Modal>
      )}
    </>
  );
}
