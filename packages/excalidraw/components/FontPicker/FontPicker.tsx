import React, { useCallback } from "react";
import _ from "lodash";
import * as Popover from "@radix-ui/react-popover";

import DropdownMenuItem, {
  DropDownMenuItemBadge,
} from "../dropdownMenu/DropdownMenuItem";
import { ButtonIconSelect } from "../ButtonIconSelect";
import {
  FontFamilyCodeIcon,
  FontFamilyNormalIcon,
  FreedrawIcon,
} from "../icons";
import { ButtonIcon } from "../ButtonIcon";
import { ButtonSeparator } from "../ButtonSeparator";
import { QuickSearch } from "../QuickSearch";
import { ScrollableList } from "../ScrollableList";
import { PropertiesPopover } from "../PropertiesPopover";
import { FontFamilyValues } from "../../element/types";
import { FONT_FAMILY } from "../../constants";
import { t } from "../../i18n";
import { useFilter } from "../../hooks/useFilter";
import { useExcalidrawContainer } from "../App";

import "./FontPicker.scss";

interface FontPickerProps {
  isOpened: boolean;
  selectedFontFamily: FontFamilyValues;
  onChange: (fontFamily: FontFamilyValues) => void;
  onPopupChange: (isOpened: boolean) => void;
}

// interface FontDescriptor {
//   value: number;
//   text: string;
//   icon: JSX.Element;
//   testId?: string | undefined;
//   active?: boolean | undefined;
// }

// FIXME_FONTS: add Map by ID, so we could also find the fonts easily
const DEFAULT_FONTS = [
  {
    value: FONT_FAMILY.Virgil,
    text: t("labels.handDrawn"),
    icon: FreedrawIcon,
    testId: "font-family-virgil",
    badge: "new",
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

const getAllFonts = () => _.range(10).flatMap(() => DEFAULT_FONTS);

const FontPickerList = React.memo(() => {
  const { container } = useExcalidrawContainer();
  const [filteredFonts, filterByCallback] = useFilter(getAllFonts(), "text");

  return (
    <PropertiesPopover container={container} style={{ width: "15rem" }}>
      <QuickSearch
        placeholder={t("quickSearch.placeholder")}
        onChange={filterByCallback}
      />
      <ScrollableList
        className="FontPicker__list dropdown-menu"
        placeholder={t("fontList.empty")}
      >
        {filteredFonts.map((font, index) => (
          <DropdownMenuItem key={index} icon={font.icon} onSelect={() => {}}>
            <span>{font.text}</span>
            {font.badge && (
              <DropDownMenuItemBadge>{font.badge}</DropDownMenuItemBadge>
            )}
          </DropdownMenuItem>
        ))}
      </ScrollableList>
    </PropertiesPopover>
  );
});

export const FontPicker = React.memo(
  ({
    isOpened,
    selectedFontFamily,
    onChange,
    onPopupChange,
  }: FontPickerProps) => {
    const getDefaultFonts = useCallback(() => DEFAULT_FONTS, []);

    return (
      <div role="dialog" aria-modal="true" className="FontPicker__container">
        <ButtonIconSelect<FontFamilyValues | false>
          type="button"
          options={getDefaultFonts()}
          value={selectedFontFamily}
          onClick={(value) => value && onChange(value)}
        />
        <ButtonSeparator />
        <Popover.Root open={true} onOpenChange={onPopupChange}>
          <Popover.Trigger asChild>
            {/* Empty div as trigger so it's stretched 100% due to different button sizes */}
            <div>
              <ButtonIcon
                standalone
                icon={FontFamilyNormalIcon}
                title={t("labels.custom")}
                testId={"font-family-custom"}
                onClick={(event) => {
                  console.error("Function not implemented.");
                }}
              />
            </div>
          </Popover.Trigger>
          <FontPickerList />
        </Popover.Root>
      </div>
    );
  },
  (prev, next) => prev.isOpened !== next.isOpened,
);
