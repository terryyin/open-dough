// The frame's icons and icon-only controls. Every icon is a Lucide glyph drawn
// at the shared icon size and stroke, and hidden from assistive technology:
// the control around it carries the name. An icon-only control shows that
// name, and its shortcut where it has one, in a styled tooltip when it is
// hovered or holds keyboard focus. The tooltip is hidden from assistive
// technology too, so the name is announced once.

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import "./icon-control.css";

export function Icon({ icon: Glyph }: { readonly icon: LucideIcon }) {
  return (
    <Glyph
      className="icon"
      strokeWidth={2}
      aria-hidden="true"
      focusable="false"
    />
  );
}

export function IconButton({
  label,
  shortcut,
  icon,
  align = "center",
  className,
  groupClassName,
  children,
  ...button
}: {
  // The control's accessible name, shown again in its tooltip.
  readonly label: string;
  // The keyboard shortcut the tooltip adds after the name, such as "⌘B".
  readonly shortcut?: string;
  readonly icon: LucideIcon;
  // Which edge of the control the tooltip lines up with, so a control at
  // either end of the window keeps its tooltip inside the window.
  readonly align?: "start" | "center" | "end";
  // The button's own class, and the class of the group holding the button,
  // its tooltip, and what sits beside it.
  readonly className?: string;
  readonly groupClassName?: string;
  // What sits beside the control, such as a count.
  readonly children?: ReactNode;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "title" | "type" | "children"
>) {
  return (
    <span
      className={`icon-control tooltip-${align}${groupClassName ? ` ${groupClassName}` : ""}`}
    >
      <button
        type="button"
        aria-label={label}
        className={className ? `icon-button ${className}` : "icon-button"}
        {...button}
      >
        <Icon icon={icon} />
      </button>
      <span className="frame-tooltip" aria-hidden="true">
        <span>{shortcut ? `${label} (${shortcut})` : label}</span>
      </span>
      {children}
    </span>
  );
}
