import React from "react";
import { useOutsideClickHook } from "../../hooks/useOutsideClick";
import { useAtomValue, useSetAtom } from "jotai";
import { isMenuOpenAtom } from "../App";
import { Island } from "../Island";
import MenuItem from "./MenuItem";
import MenuButton from "./MenuButton";
import MenuSeparator from "./MenuSeparator";
import * as MenuComponents from "./MenuComponents";
import MenuSocials from "./MenuSocials";
import MenuGroup from "./MenuGroup";
import { getValidMenuChildren } from "./menuUtils";

const OpenMenu = ({ children }: { children?: React.ReactNode }) => {
  const setIsMenuOpen = useSetAtom(isMenuOpenAtom);
  const menuRef = useOutsideClickHook(() => {
    setIsMenuOpen(false);
  });

  const menuChildren = getValidMenuChildren(children);

  return (
    <>
      <MenuButton />

      <div
        ref={menuRef}
        style={{ position: "absolute", top: "100%", marginTop: ".25rem" }}
      >
        {/* the zIndex ensures this menu has higher stacking order,
  see https://github.com/excalidraw/excalidraw/pull/1445 */}
        <Island className="menu-container" padding={2} style={{ zIndex: 1 }}>
          {menuChildren}
        </Island>
      </div>
    </>
  );
};

const Menu = ({ children }: { children?: React.ReactNode }) => {
  const isMenuOpen = useAtomValue(isMenuOpenAtom);

  if (!isMenuOpen) {
    return <MenuButton />;
  }

  return <OpenMenu>{children}</OpenMenu>;
};

Menu.Item = MenuItem;
Menu.Separator = MenuSeparator;
Menu.LoadScene = MenuComponents.LoadScene;
Menu.SaveToActiveFile = MenuComponents.SaveToActiveFile;
Menu.SaveAsImage = MenuComponents.SaveAsImage;
Menu.Help = MenuComponents.Help;
Menu.ClearCanvas = MenuComponents.ClearCanvas;
Menu.ToggleTheme = MenuComponents.ToggleTheme;
Menu.ChangeCanvasBackground = MenuComponents.ChangeCanvasBackground;
Menu.Export = MenuComponents.Export;
Menu.Socials = MenuSocials;
Menu.Group = MenuGroup;

export default Menu;

Menu.displayName = "Menu";
