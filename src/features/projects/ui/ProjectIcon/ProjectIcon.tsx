import { cx } from "@/shared/lib/cx";

import { splitProjectName, type ProjectColor } from "../../model/project";

import styles from "./ProjectIcon.module.scss";

interface ProjectIconProps {
  name: string;
  color: ProjectColor;
  size?: "small" | "medium" | "large";
  className?: string;
}

// The project emoji, or a dot in the project colour
const ProjectIcon = ({ name, color, size = "medium", className }: ProjectIconProps) => {
  const { emoji } = splitProjectName(name);

  return (
    <span
      className={cx(styles.icon, className)}
      data-size={size}
      data-project-color={color}
      data-emoji={emoji ? "" : undefined}
      aria-hidden="true"
    >
      {emoji ?? <span className={styles.dot} />}
    </span>
  );
};

export default ProjectIcon;
