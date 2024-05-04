import * as Popover from "@radix-ui/react-popover";
import { useDevice } from "./App";
import { useRef, ReactNode } from "react";
import { Island } from "./Island";

interface PropertiesPopoverProps {
  container: HTMLDivElement | null;
  children: ReactNode;
  style?: object;
  onFocusOutside?: Popover.DismissableLayerProps["onFocusOutside"];
  onPointerDownOutside?: Popover.DismissableLayerProps["onPointerDownOutside"];
  onCloseAutoFocus?: Popover.PopoverContentImplProps["onCloseAutoFocus"];
}

export const PropertiesPopover = ({
  container,
  children,
  style,
  onFocusOutside,
  onPointerDownOutside,
  onCloseAutoFocus,
}: PropertiesPopoverProps) => {
  const device = useDevice();
  const popoverRef = useRef<HTMLDivElement>(null);

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
          zIndex: "var(--zIndex-popup)",
        }}
        onFocusOutside={onFocusOutside}
        onPointerDownOutside={onPointerDownOutside}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <Island padding={2} style={style}>
          {children}
        </Island>
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
