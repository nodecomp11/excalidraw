import { getFormValue } from "../../actions/actionProperties";
import { DEFAULT_FONT_FAMILY, FONT_FAMILY } from "../../constants";
import { isTextElement } from "../../element";
import { getBoundTextElement } from "../../element/textElement";
import { ExcalidrawElement, FontFamilyValues } from "../../element/types";
import { t } from "../../i18n";
import { AppClassProperties, AppState } from "../../types";
import { ButtonGroupDivider } from "../ButtonGroupDivider";
import { ButtonIconSelect } from "../ButtonIconSelect";
import {
  FontFamilyCodeIcon,
  FontFamilyNormalIcon,
  FreedrawIcon,
} from "../icons";

import "./FontPicker.scss";

interface FontPickerProps {
  elements: readonly ExcalidrawElement[];
  appState: AppState;
  updateData: (formData?: any) => void;
  app: AppClassProperties,
}

export const FontPicker = ({
  elements,
  updateData,
  appState,
  app,
}: FontPickerProps) => {
  const options: {
    value: FontFamilyValues;
    text: string;
    icon: JSX.Element;
    testId: string;
  }[] = [
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
    <>
      <div role="dialog" aria-modal="true" className="font-picker-container">
        <ButtonIconSelect<FontFamilyValues | false>
          group="font-family"
          options={options}
          value={getFormValue(
            elements,
            appState,
            (element) => {
              if (isTextElement(element)) {
                return element.fontFamily;
              }
              const boundTextElement = getBoundTextElement(
                element,
                app.scene.getNonDeletedElementsMap(),
              );
              if (boundTextElement) {
                return boundTextElement.fontFamily;
              }
              return null;
            },
            (element) =>
              isTextElement(element) ||
              getBoundTextElement(
                element,
                app.scene.getNonDeletedElementsMap(),
              ) !== null,
            (hasSelection) =>
              hasSelection
                ? null
                : appState.currentItemFontFamily || DEFAULT_FONT_FAMILY,
          )}
          onChange={(value) => updateData(value)}
        />
        <ButtonGroupDivider />
        <ButtonIconSelect<FontFamilyValues | false>
          group="font-family"
          options={[
            {
              value: FONT_FAMILY.Cascadia,
              text: t("labels.code"),
              icon: FontFamilyCodeIcon,
              testId: "font-family-code",
            },
          ]}
          value={getFormValue(
            elements,
            appState,
            (element) => {
              if (isTextElement(element)) {
                return element.fontFamily;
              }
              const boundTextElement = getBoundTextElement(
                element,
                app.scene.getNonDeletedElementsMap(),
              );
              if (boundTextElement) {
                return boundTextElement.fontFamily;
              }
              return null;
            },
            (element) =>
              isTextElement(element) ||
              getBoundTextElement(
                element,
                app.scene.getNonDeletedElementsMap(),
              ) !== null,
            (hasSelection) =>
              hasSelection
                ? null
                : appState.currentItemFontFamily || DEFAULT_FONT_FAMILY,
          )}
          onChange={(value) => updateData(value)}
        />
      </div>
    </>
  );
};
