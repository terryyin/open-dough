// The frame's icons, icon-only controls and styled tooltip. Every icon is a
// Lucide glyph drawn at the shared icon size and stroke, and hidden from
// assistive technology: the control around it carries the name. An icon-only
// control shows that name, and its shortcut where it has one, in the styled
// tooltip when it is hovered or holds keyboard focus; a labelled button can
// show its description there the same way. The tooltip is hidden from
// assistive technology too, so its words are announced once, as the control's
// name or as the description that refers to them.

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
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

// The styled tooltip of the button beside it in a `tooltip-control` group,
// shown below that button while it is hovered or holds keyboard focus. A
// button the tooltip describes names `id` in its `aria-describedby`.
export function FrameTooltip({
  id,
  children,
}: {
  readonly id?: string;
  readonly children: ReactNode;
}) {
  return (
    <span className="frame-tooltip" aria-hidden="true">
      <span id={id}>{children}</span>
    </span>
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
  // The button itself, for a caller that returns the keyboard to it.
  readonly ref?: Ref<HTMLButtonElement>;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "title" | "type" | "children"
>) {
  return (
    <span
      className={`tooltip-control tooltip-${align}${groupClassName ? ` ${groupClassName}` : ""}`}
    >
      <button
        type="button"
        aria-label={label}
        className={className ? `icon-button ${className}` : "icon-button"}
        {...button}
      >
        <Icon icon={icon} />
      </button>
      <FrameTooltip>{shortcut ? `${label} (${shortcut})` : label}</FrameTooltip>
      {children}
    </span>
  );
}
