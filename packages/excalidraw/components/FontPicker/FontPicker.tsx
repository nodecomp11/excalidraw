import { useRef } from "react";
import * as Popover from "@radix-ui/react-popover";

import { useExcalidrawContainer } from "../App";
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

const FontPickerPopupContent = () => {
  const { container } = useExcalidrawContainer();
  const popoverRef = useRef<HTMLDivElement>(null);

  return (
    <Popover.Portal container={container}>
      <Popover.Content
        ref={popoverRef}
        style={{
          zIndex: "var(--zIndex-layerUI)",
          backgroundColor: "var(--popup-bg-color)",
          maxWidth: "208px",
          maxHeight: window.innerHeight,
          padding: "12px",
          borderRadius: "8px",
          boxSizing: "border-box",
          overflowY: "auto",
          boxShadow:
            "0px 7px 14px rgba(0, 0, 0, 0.05), 0px 0px 3.12708px rgba(0, 0, 0, 0.0798), 0px 0px 0.931014px rgba(0, 0, 0, 0.1702)",
        }}
      >
        <p>Ola senor</p>
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
        open={appState.openPopup === FONT_POPUP_TYPE}
        onOpenChange={(open) => {
          onPopupChange(open ? FONT_POPUP_TYPE : null);
        }}
      >
        <FontPickerTrigger />
        {appState.openPopup === FONT_POPUP_TYPE && <FontPickerPopupContent />}
      </Popover.Root>
    </div>
  );
};
