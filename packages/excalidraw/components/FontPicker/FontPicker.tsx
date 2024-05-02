import { useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import _ from "lodash";

import { searchIcon } from "../icons";
import { useDevice, useExcalidrawContainer } from "../App";
import { ButtonIconSelect } from "../ButtonIconSelect";
import {
  FontFamilyCodeIcon,
  FontFamilyNormalIcon,
  FreedrawIcon,
} from "../icons";
import { ButtonIcon } from "../ButtonIcon";
import { ButtonDivider } from "../ButtonDivider";
import { FontFamilyValues } from "../../element/types";
import { AppState } from "../../types";
import { FONT_FAMILY } from "../../constants";
import { t } from "../../i18n";

import "./FontPicker.scss";

const FONT_POPUP_TYPE = "fontFamily";

interface FontPickerProps {
  fontFamily: FontFamilyValues;
  appState: AppState;
  onChange: (fontFamily: FontFamilyValues) => void;
  onPopupChange: (openType: typeof FONT_POPUP_TYPE | null) => void;
}

// interface FontDescriptor {
//   value: number;
//   text: string;
//   icon: JSX.Element;
//   testId?: string | undefined;
//   active?: boolean | undefined;
// }

const FontPickerPopupContent = () => {
  const { container } = useExcalidrawContainer();
  const device = useDevice();
  const popoverRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const allFonts = _.range(10).flatMap(
    () => [
      {
        value: FONT_FAMILY.Virgil,
        text: t("labels.handDrawn"),
        icon: FreedrawIcon,
        testId: "font-family-virgil",
        tag: "new",
      },
      {
        value: FONT_FAMILY.Helvetica,
        text: t("labels.normal"),
        icon: FontFamilyNormalIcon,
        testId: "font-family-normal",
      },
      {
        value: FONT_FAMILY.Cascadia,
        text: t("labels.code"),
        icon: FontFamilyCodeIcon,
        testId: "font-family-code",
      },
    ],
    10,
  );

  const searchTermNormalized = searchTerm.trim().toLowerCase();

  const filteredFonts = searchTermNormalized
    ? allFonts.filter((collaborator) =>
        collaborator.text?.toLowerCase().includes(searchTerm),
      )
    : allFonts;

  return (
    <Popover.Portal container={container}>
      <Popover.Content
        ref={popoverRef}
        className="focus-visible-none"
        data-prevent-outside-click
        side={
          device.editor.isMobile && !device.viewport.isLandscape
            ? "bottom"
            : "right"
        }
        align={
          device.editor.isMobile && !device.viewport.isLandscape
            ? "center"
            : "start"
        }
        alignOffset={-16}
        sideOffset={20}
        style={{
          zIndex: "var(--zIndex-layerUI)",
          backgroundColor: "var(--popup-bg-color)",
          width: "236px",
          maxHeight: window.innerHeight,
          padding: "12px 12px 0 12px",
          borderRadius: "8px",
          boxSizing: "border-box",
          boxShadow:
            "0px 7px 14px rgba(0, 0, 0, 0.05), 0px 0px 3.12708px rgba(0, 0, 0, 0.0798), 0px 0px 0.931014px rgba(0, 0, 0, 0.1702)",
          overflow: "hidden",
        }}
      >
        <div
          className="UserList__search-wrapper"
          style={{
            borderBottom:
              "1px solid var(--userlist-collaborators-border-color)",
          }}
        >
          {searchIcon}
          <input
            className="UserList__search"
            type="text"
            placeholder={t("userList.search.placeholder")}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
        <div
          className="dropdown-menu UserList__collaborators"
          style={{
            maxHeight: "calc(366px - 4.625rem)",
            padding: "0",
            paddingRight: "0.125rem",
            margin: "0.75rem -0.375rem 0.75rem 0",
            border: "none",
            fontSize: "0.875rem",
          }}
        >
          {filteredFonts.length === 0 && (
            <div className="UserList__collaborators__empty">
              {t("userList.search.empty")}
            </div>
          )}
          {filteredFonts.map((font) => (
            <div
              className={`UserList__collaborator UserList__collaborator--avatar-only dropdown-menu-item dropdown-menu-item-base}`}
              // style={{ display: "flex", alignItems: "center" }}
            >
              <span style={{ display: "inline-block", margin: "0 0.5rem" }}>
                {font.icon}
              </span>
              <span>{font.text}</span>
              {font.tag && (
                <span
                  style={{
                    position: "absolute",
                    right: "0.375rem",
                    textTransform: "lowercase",
                    fontSize: "0.625rem",
                    padding: "0px 4px 1px 4px",
                    borderRadius: "8px",
                    background: "#D3FFD2",
                    color: "#0B6513",
                    border: "1.5px solid white",
                  }}
                >
                  {font.tag}
                </span>
              )}
            </div>
          ))}
        </div>
        <Popover.Arrow
          width={20}
          height={10}
          style={{
            fill: "var(--popup-bg-color)",
            filter: "drop-shadow(rgba(0, 0, 0, 0.05) 0px 3px 2px)",
          }}
        />
      </Popover.Content>
    </Popover.Portal>
  );
};

const FontPickerTrigger = () => {
  return (
    <Popover.Trigger asChild>
      <ButtonIcon
        standalone
        icon={FontFamilyNormalIcon}
        title={t("labels.custom")}
        testId={"font-family-custom"}
        onClick={(event) => {
          console.error("Function not implemented.");
        }}
      />
    </Popover.Trigger>
  );
};

export const FontPicker = ({
  fontFamily,
  appState,
  onChange,
  onPopupChange,
}: FontPickerProps) => {
  const defaultFonts = [
    {
      value: FONT_FAMILY.Virgil,
      text: t("labels.handDrawn"),
      icon: FreedrawIcon,
      testId: "font-family-virgil",
    },
    {
      value: FONT_FAMILY.Helvetica,
      text: t("labels.normal"),
      icon: FontFamilyNormalIcon,
      testId: "font-family-normal",
    },
    {
      value: FONT_FAMILY.Cascadia,
      text: t("labels.code"),
      icon: FontFamilyCodeIcon,
      testId: "font-family-code",
    },
  ];

  return (
    <div role="dialog" aria-modal="true" className="font-picker-container">
      <ButtonIconSelect<FontFamilyValues | false>
        type="button"
        options={defaultFonts}
        value={fontFamily}
        onClick={(value) => {
          if (value && appState.currentItemFontFamily !== value) {
            onChange(value);
          }
        }}
      />
      <ButtonDivider />
      <Popover.Root
        open={true}
        onOpenChange={(open) => {
          onPopupChange(open ? FONT_POPUP_TYPE : null);
        }}
      >
        <FontPickerTrigger />
        <FontPickerPopupContent />
        {/* {appState.openPopup === FONT_POPUP_TYPE && <FontPickerPopupContent />} */}
      </Popover.Root>
    </div>
  );
};
