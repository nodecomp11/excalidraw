import clsx from "clsx";
import React, { useState } from "react";
import { ActionManager } from "../actions/manager";
import { CLASSES, LIBRARY_SIDEBAR_WIDTH } from "../constants";
import { exportCanvas } from "../data";
import { isTextElement, showSelectedShapeActions } from "../element";
import { NonDeletedExcalidrawElement } from "../element/types";
import { Language, t } from "../i18n";
import { calculateScrollCenter } from "../scene";
import { ExportType } from "../scene/types";
import { AppProps, AppState, ExcalidrawProps, BinaryFiles } from "../types";
import { muteFSAbortError } from "../utils";
import { SelectedShapeActions, ShapesSwitcher } from "./Actions";
import CollabButton from "./CollabButton";
import { ErrorDialog } from "./ErrorDialog";
import { ExportCB, ImageExportDialog } from "./ImageExportDialog";
import { FixedSideContainer } from "./FixedSideContainer";
import { HintViewer } from "./HintViewer";
import { Island } from "./Island";
import { LoadingMessage } from "./LoadingMessage";
import { LockButton } from "./LockButton";
import { MobileMenu } from "./MobileMenu";
import { PasteChartDialog } from "./PasteChartDialog";
import { Section } from "./Section";
import { HelpDialog } from "./HelpDialog";
import Stack from "./Stack";
import { UserList } from "./UserList";
import Library from "../data/library";
import { JSONExportDialog } from "./JSONExportDialog";
import { LibraryButton } from "./LibraryButton";
import { isImageFileHandle } from "../data/blob";
import { LibraryMenu } from "./LibraryMenu";

import "./LayerUI.scss";
import "./Toolbar.scss";
import { PenModeButton } from "./PenModeButton";
import { trackEvent } from "../analytics";
import { useDevice } from "../components/App";
import { Stats } from "./Stats";
import { actionToggleStats } from "../actions/actionToggleStats";
import Footer from "./Footer";
import {
  HamburgerMenuIcon,
  WelcomeScreenMenuArrow,
  WelcomeScreenTopToolbarArrow,
} from "./icons";
import { MenuLinks, Separator } from "./MenuUtils";
import { useOutsideClickHook } from "../hooks/useOutsideClick";
import WelcomeScreen from "./WelcomeScreen";
import { hostSidebarCountersAtom } from "./Sidebar/Sidebar";
import { jotaiScope } from "../jotai";
import { useAtom } from "jotai";
import { LanguageList } from "../excalidraw-app/components/LanguageList";

interface LayerUIProps {
  actionManager: ActionManager;
  appState: AppState;
  files: BinaryFiles;
  canvas: HTMLCanvasElement | null;
  setAppState: React.Component<any, AppState>["setState"];
  elements: readonly NonDeletedExcalidrawElement[];
  onCollabButtonClick?: () => void;
  onLockToggle: () => void;
  onPenModeToggle: () => void;
  onInsertElements: (elements: readonly NonDeletedExcalidrawElement[]) => void;
  showExitZenModeBtn: boolean;
  langCode: Language["code"];
  isCollaborating: boolean;
  renderTopRightUI?: ExcalidrawProps["renderTopRightUI"];
  renderCustomFooter?: ExcalidrawProps["renderFooter"];
  renderCustomStats?: ExcalidrawProps["renderCustomStats"];
  renderCustomSidebar?: ExcalidrawProps["renderSidebar"];
  libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
  UIOptions: AppProps["UIOptions"];
  focusContainer: () => void;
  library: Library;
  id: string;
  onImageAction: (data: { insertOnCanvasDirectly: boolean }) => void;
  renderWelcomeScreen: boolean;
}
const LayerUI = ({
  actionManager,
  appState,
  files,
  setAppState,
  elements,
  canvas,
  onCollabButtonClick,
  onLockToggle,
  onPenModeToggle,
  onInsertElements,
  showExitZenModeBtn,
  isCollaborating,
  renderTopRightUI,
  renderCustomFooter,
  renderCustomStats,
  renderCustomSidebar,
  libraryReturnUrl,
  UIOptions,
  focusContainer,
  library,
  id,
  onImageAction,
  renderWelcomeScreen,
}: LayerUIProps) => {
  const device = useDevice();

  const renderJSONExportDialog = () => {
    if (!UIOptions.canvasActions.export) {
      return null;
    }

    return (
      <JSONExportDialog
        elements={elements}
        appState={appState}
        files={files}
        actionManager={actionManager}
        exportOpts={UIOptions.canvasActions.export}
        canvas={canvas}
      />
    );
  };

  const renderImageExportDialog = () => {
    if (!UIOptions.canvasActions.saveAsImage) {
      return null;
    }

    const createExporter =
      (type: ExportType): ExportCB =>
      async (exportedElements) => {
        trackEvent("export", type, "ui");
        const fileHandle = await exportCanvas(
          type,
          exportedElements,
          appState,
          files,
          {
            exportBackground: appState.exportBackground,
            name: appState.name,
            viewBackgroundColor: appState.viewBackgroundColor,
          },
        )
          .catch(muteFSAbortError)
          .catch((error) => {
            console.error(error);
            setAppState({ errorMessage: error.message });
          });

        if (
          appState.exportEmbedScene &&
          fileHandle &&
          isImageFileHandle(fileHandle)
        ) {
          setAppState({ fileHandle });
        }
      };

    return (
      <ImageExportDialog
        elements={elements}
        appState={appState}
        files={files}
        actionManager={actionManager}
        onExportToPng={createExporter("png")}
        onExportToSvg={createExporter("svg")}
        onExportToClipboard={createExporter("clipboard")}
      />
    );
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useOutsideClickHook(() => setIsMenuOpen(false));

  const renderCanvasActions = () => (
    <div style={{ position: "relative" }}>
      {renderWelcomeScreen && (
        <div className="virgil WelcomeScreen-decor WelcomeScreen-decor--menu-pointer">
          {WelcomeScreenMenuArrow}
          <div>{t("welcomeScreen.menuHints")}</div>
        </div>
      )}
      <button
        data-prevent-outside-click
        className={clsx("menu-button", "zen-mode-transition", {
          "transition-left": appState.zenModeEnabled,
        })}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        type="button"
      >
        {HamburgerMenuIcon}
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          style={{ position: "absolute", top: "100%", marginTop: ".25rem" }}
        >
          <Section heading="canvasActions">
            {/* the zIndex ensures this menu has higher stacking order,
         see https://github.com/excalidraw/excalidraw/pull/1445 */}
            <Island
              className="menu-container"
              padding={2}
              style={{ zIndex: 1 }}
            >
              {actionManager.renderAction("loadScene")}
              {/* // TODO barnabasmolnar/editor-redesign  */}
              {/* where should this go? */}
              {/* {appState.fileHandle && (
                <>{actionManager.renderAction("saveToActiveFile")}</>
              )} */}
              {renderJSONExportDialog()}
              {renderImageExportDialog()}
              {onCollabButtonClick && (
                <CollabButton
                  isCollaborating={isCollaborating}
                  collaboratorCount={appState.collaborators.size}
                  onClick={onCollabButtonClick}
                />
              )}
              {actionManager.renderAction("toggleShortcuts", undefined, true)}
              {actionManager.renderAction("clearCanvas")}
              <Separator />
              <MenuLinks />
              <Separator />
              <div style={{ marginBottom: ".5rem" }}>
                <div style={{ fontSize: ".75rem", marginBottom: ".5rem" }}>
                  {t("labels.canvasBackground")}
                </div>
                {actionManager.renderAction("changeViewBackgroundColor")}
              </div>
              <div style={{ marginBottom: ".5rem" }}>
                {actionManager.renderAction("toggleTheme")}
              </div>
              <LanguageList style={{ width: "100%" }} />
            </Island>
          </Section>
        </div>
      )}
    </div>
  );

  const renderSelectedShapeActions = () => (
    <Section
      heading="selectedShapeActions"
      className={clsx("selected-shape-actions zen-mode-transition", {
        "transition-left": appState.zenModeEnabled,
      })}
    >
      <Island
        className={CLASSES.SHAPE_ACTIONS_MENU}
        padding={2}
        style={{
          // we want to make sure this doesn't overflow so subtracting 200
          // which is approximately height of zoom footer and top left menu items with some buffer
          // if active file name is displayed, subtracting 248 to account for its height
          maxHeight: `${appState.height - (appState.fileHandle ? 248 : 200)}px`,
        }}
      >
        <SelectedShapeActions
          appState={appState}
          elements={elements}
          renderAction={actionManager.renderAction}
        />
      </Island>
    </Section>
  );

  const renderFixedSideContainer = () => {
    const shouldRenderSelectedShapeActions = showSelectedShapeActions(
      appState,
      elements,
    );

    return (
      <FixedSideContainer side="top">
        <div className="App-menu App-menu_top">
          <Stack.Col
            style={{ width: "192px" }}
            gap={6}
            className={clsx({
              "disable-pointerEvents": appState.zenModeEnabled,
            })}
          >
            {renderCanvasActions()}
            {shouldRenderSelectedShapeActions && renderSelectedShapeActions()}
          </Stack.Col>
          {!appState.viewModeEnabled && (
            <Section heading="shapes">
              {(heading: React.ReactNode) => (
                <div style={{ position: "relative" }}>
                  {renderWelcomeScreen && (
                    <div className="virgil WelcomeScreen-decor WelcomeScreen-decor--top-toolbar-pointer">
                      <div className="WelcomeScreen-decor--top-toolbar-pointer__label">
                        {t("welcomeScreen.toolbarHints")}
                      </div>
                      {WelcomeScreenTopToolbarArrow}
                    </div>
                  )}
                  <Stack.Col gap={4} align="start">
                    <Stack.Row
                      gap={1}
                      className={clsx("App-toolbar-container", {
                        "zen-mode": appState.zenModeEnabled,
                      })}
                    >
                      <Island
                        padding={1}
                        className={clsx("App-toolbar", {
                          "zen-mode": appState.zenModeEnabled,
                        })}
                      >
                        <HintViewer
                          appState={appState}
                          elements={elements}
                          isMobile={device.isMobile}
                          device={device}
                        />
                        {heading}
                        <Stack.Row gap={1}>
                          <PenModeButton
                            zenModeEnabled={appState.zenModeEnabled}
                            checked={appState.penMode}
                            onChange={onPenModeToggle}
                            title={t("toolBar.penMode")}
                            penDetected={appState.penDetected}
                            // TODO barnabasmolnar/editor-redesign
                            // penDetected={true}
                          />
                          <LockButton
                            zenModeEnabled={appState.zenModeEnabled}
                            checked={appState.activeTool.locked}
                            onChange={() => onLockToggle()}
                            title={t("toolBar.lock")}
                          />
                          <div className="App-toolbar__divider"></div>
                          <ShapesSwitcher
                            appState={appState}
                            canvas={canvas}
                            activeTool={appState.activeTool}
                            setAppState={setAppState}
                            onImageAction={({ pointerType }) => {
                              onImageAction({
                                insertOnCanvasDirectly: pointerType !== "mouse",
                              });
                            }}
                          />
                          {/* {actionManager.renderAction("eraser", {
                          // size: "small",
                        })} */}
                        </Stack.Row>
                      </Island>
                      <LibraryButton
                        appState={appState}
                        setAppState={setAppState}
                      />
                    </Stack.Row>
                  </Stack.Col>
                </div>
              )}
            </Section>
          )}
          <div
            className={clsx(
              "layer-ui__wrapper__top-right zen-mode-transition",
              {
                "transition-right": appState.zenModeEnabled,
              },
            )}
          >
            <UserList
              collaborators={appState.collaborators}
              actionManager={actionManager}
            />
            {onCollabButtonClick && (
              <CollabButton
                isInHamburgerMenu={false}
                isCollaborating={isCollaborating}
                collaboratorCount={appState.collaborators.size}
                onClick={onCollabButtonClick}
              />
            )}
            {renderTopRightUI?.(device.isMobile, appState)}
          </div>
        </div>
      </FixedSideContainer>
    );
  };

  const renderSidebars = () => {
    return appState.openSidebar === "customSidebar" ? (
      renderCustomSidebar?.() || null
    ) : appState.openSidebar === "library" ? (
      <LibraryMenu
        appState={appState}
        onInsertElements={onInsertElements}
        libraryReturnUrl={libraryReturnUrl}
        focusContainer={focusContainer}
        library={library}
        id={id}
      />
    ) : null;
  };

  const [hostSidebarCounters] = useAtom(hostSidebarCountersAtom, jotaiScope);

  return (
    <>
      {renderWelcomeScreen && <WelcomeScreen actionManager={actionManager} />}
      {appState.isLoading && <LoadingMessage delay={250} />}
      {appState.errorMessage && (
        <ErrorDialog
          message={appState.errorMessage}
          onClose={() => setAppState({ errorMessage: null })}
        />
      )}
      {appState.showHelpDialog && (
        <HelpDialog
          onClose={() => {
            setAppState({ showHelpDialog: false });
          }}
        />
      )}
      {appState.pasteDialog.shown && (
        <PasteChartDialog
          setAppState={setAppState}
          appState={appState}
          onInsertChart={onInsertElements}
          onClose={() =>
            setAppState({
              pasteDialog: { shown: false, data: null },
            })
          }
        />
      )}
      {device.isMobile && (
        <MobileMenu
          appState={appState}
          elements={elements}
          actionManager={actionManager}
          renderJSONExportDialog={renderJSONExportDialog}
          renderImageExportDialog={renderImageExportDialog}
          setAppState={setAppState}
          onCollabButtonClick={onCollabButtonClick}
          onLockToggle={() => onLockToggle()}
          onPenModeToggle={onPenModeToggle}
          canvas={canvas}
          isCollaborating={isCollaborating}
          renderCustomFooter={renderCustomFooter}
          onImageAction={onImageAction}
          renderTopRightUI={renderTopRightUI}
          renderCustomStats={renderCustomStats}
          renderSidebars={renderSidebars}
          device={device}
        />
      )}

      {!device.isMobile && (
        <>
          <div
            className={clsx("layer-ui__wrapper", {
              "disable-pointerEvents":
                appState.draggingElement ||
                appState.resizingElement ||
                (appState.editingElement &&
                  !isTextElement(appState.editingElement)),
            })}
            style={
              ((appState.openSidebar === "library" &&
                appState.isSidebarDocked) ||
                hostSidebarCounters.docked) &&
              device.canDeviceFitSidebar
                ? { width: `calc(100% - ${LIBRARY_SIDEBAR_WIDTH}px)` }
                : {}
            }
          >
            {renderFixedSideContainer()}
            <Footer
              renderWelcomeScreen={renderWelcomeScreen}
              appState={appState}
              actionManager={actionManager}
              renderCustomFooter={renderCustomFooter}
              showExitZenModeBtn={showExitZenModeBtn}
            />
            {appState.showStats && (
              <Stats
                appState={appState}
                setAppState={setAppState}
                elements={elements}
                onClose={() => {
                  actionManager.executeAction(actionToggleStats);
                }}
                renderCustomStats={renderCustomStats}
              />
            )}
            {appState.scrolledOutside && (
              <button
                className="scroll-back-to-content"
                onClick={() => {
                  setAppState({
                    ...calculateScrollCenter(elements, appState, canvas),
                  });
                }}
              >
                {t("buttons.scrollBackToContent")}
              </button>
            )}
          </div>
          {renderSidebars()}
        </>
      )}
    </>
  );
};

const areEqual = (prev: LayerUIProps, next: LayerUIProps) => {
  const getNecessaryObj = (appState: AppState): Partial<AppState> => {
    const {
      suggestedBindings,
      startBoundElement: boundElement,
      ...ret
    } = appState;
    return ret;
  };
  const prevAppState = getNecessaryObj(prev.appState);
  const nextAppState = getNecessaryObj(next.appState);

  const keys = Object.keys(prevAppState) as (keyof Partial<AppState>)[];

  return (
    prev.renderCustomFooter === next.renderCustomFooter &&
    prev.renderTopRightUI === next.renderTopRightUI &&
    prev.renderCustomStats === next.renderCustomStats &&
    prev.renderCustomSidebar === next.renderCustomSidebar &&
    prev.langCode === next.langCode &&
    prev.elements === next.elements &&
    prev.files === next.files &&
    keys.every((key) => prevAppState[key] === nextAppState[key])
  );
};

export default React.memo(LayerUI, areEqual);
