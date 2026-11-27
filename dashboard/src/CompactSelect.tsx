import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "./compact-select.css";

// One choice offered by a compact select: `id` is its stable identity and
// `label` what it shows, whose text and image names are its accessible name.
export type CompactSelectOption = {
  readonly id: string;
  readonly label: ReactNode;
};

// A button showing the committed choice that opens a listbox. It is a
// select-only combobox named by `name`, so a screen reader announces the
// shown choice as its value. Arrow keys,
// Home and End move a highlight without changing the choice; Enter, Space or
// a click commits; Escape or a pointer outside dismisses and keeps the
// choice. Either way focus returns to the button. Touch and keyboard share
// this one accessible pattern. Its shared appearance is ./compact-select.css;
// the owner supplies the options, its own styling classes and what committing
// an option means.
export function CompactSelect<Option extends CompactSelectOption>({
  name,
  options,
  value,
  current,
  onCommit,
  rootClassName,
  buttonClassName,
  listClassName,
  buttonData,
}: {
  readonly name: string;
  readonly options: readonly Option[];
  readonly value: string;
  readonly current: ReactNode;
  readonly onCommit: (option: Option) => void;
  readonly rootClassName: string;
  readonly buttonClassName: string;
  readonly listClassName: string;
  readonly buttonData?: Readonly<Record<`data-${string}`, string>>;
}) {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(value);

  useEffect(() => {
    if (!open) {
      setActive(value);
    }
  }, [open, value]);

  useLayoutEffect(() => {
    if (open) {
      list.current?.focus();
    }
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    button.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        root.current?.contains(event.target)
      ) {
        return;
      }
      dismiss();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      dismiss();
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const choose = (id: string) => {
    dismiss();
    const next = options.find((option) => option.id === id);
    if (next !== undefined && next.id !== value) onCommit(next);
  };

  const moveActive = (step: number) => {
    const index = Math.max(
      0,
      options.findIndex((option) => option.id === active),
    );
    setActive(
      options[(index + step + options.length) % options.length]?.id ?? value,
    );
  };

  const highlight: Readonly<Record<string, () => void>> = {
    ArrowDown: () => {
      moveActive(1);
    },
    ArrowUp: () => {
      moveActive(-1);
    },
    Home: () => {
      setActive(options[0]?.id ?? value);
    },
    End: () => {
      setActive(options[options.length - 1]?.id ?? value);
    },
    Enter: () => {
      choose(active);
    },
    " ": () => {
      choose(active);
    },
  };

  return (
    <div className={`compact-select ${rootClassName}`} ref={root}>
      <button
        type="button"
        ref={button}
        role="combobox"
        className={`compact-select-button ${buttonClassName}`}
        {...buttonData}
        aria-label={name}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          setOpen((was) => !was);
        }}
        onKeyDown={(event) => {
          if (
            (event.key === "ArrowDown" ||
              event.key === "Enter" ||
              event.key === " ") &&
            !open
          ) {
            event.preventDefault();
            setOpen(true);
            setActive(value);
          }
        }}
      >
        {current}
      </button>
      {open ? (
        <ul
          id={listId}
          ref={list}
          className={`compact-select-list ${listClassName}`}
          role="listbox"
          aria-label={name}
          tabIndex={-1}
          aria-activedescendant={`${listId}-${active}`}
          onKeyDown={(event) => {
            if (!Object.hasOwn(highlight, event.key)) return;
            event.preventDefault();
            highlight[event.key]?.();
          }}
        >
          {options.map((option) => (
            <li
              key={option.id}
              id={`${listId}-${option.id}`}
              role="option"
              aria-selected={option.id === value}
              data-active={option.id === active ? "true" : undefined}
              onClick={() => {
                choose(option.id);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
