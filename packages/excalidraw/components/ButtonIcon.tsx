import { forwardRef } from "react";
import clsx from "clsx";

import "./ButtonIcon.scss";

interface ButtonIconProps {
  icon: JSX.Element;
  title: string;
  testId?: string;
  /** if not supplied, defaults to value identity check */
  active?: boolean;
  /** if not supplied, styles won't be included to not intefere with parent styles */
  standalone?: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(
  (props, ref) => {
    const { title, testId, active, standalone, icon, onClick } = props;
    return (
      <button
        ref={ref}
        key={title}
        title={title}
        data-testid={testId}
        className={clsx({ active, standalone })}
        onClick={onClick}
      >
        {icon}
      </button>
    );
  },
);
