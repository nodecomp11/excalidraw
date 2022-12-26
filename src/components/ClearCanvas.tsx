import { useState } from "react";
import { t } from "../i18n";
import { TrashIcon } from "./icons";

import ConfirmDialog from "./ConfirmDialog";
import MenuItem from "./menu/MenuItem";

const ClearCanvas = ({ onConfirm }: { onConfirm: () => void }) => {
  const [showDialog, setShowDialog] = useState(false);
  const toggleDialog = () => {
    setShowDialog(!showDialog);
  };

  return (
    <>
      <MenuItem
        icon={TrashIcon}
        onClick={toggleDialog}
        dataTestId="clear-canvas-button"
      >
        {t("buttons.clearReset")}
      </MenuItem>

      {showDialog && (
        <ConfirmDialog
          onConfirm={() => {
            onConfirm();
            toggleDialog();
          }}
          onCancel={toggleDialog}
          title={t("clearCanvasDialog.title")}
        >
          <p className="clear-canvas__content"> {t("alerts.clearReset")}</p>
        </ConfirmDialog>
      )}
    </>
  );
};

export default ClearCanvas;
