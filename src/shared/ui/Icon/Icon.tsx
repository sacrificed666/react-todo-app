import type { SVGProps } from "react";

import { icons, type IconName } from "./icons";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  filled?: boolean;
}

// An outline or filled icon from the shared set, hidden from screen readers
const Icon = ({ name, filled = false, ...props }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d={icons[name]} />
  </svg>
);

export default Icon;
