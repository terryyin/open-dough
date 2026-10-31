import "./product-mark.css";

// Open Dough's own mark: the product's identity at the start of every
// top-level view. On a configured dashboard it is the visual of the Sessions
// toggle (`decorative`); on the unconfigured banner and in System settings it
// is a passive image named "Open Dough". It is the accepted icon export the
// browser tab uses (../server/brandAssetPlugin.ts), drawn at twice its CSS
// size for sharp high-density screens. No view shows the product's name as
// text beside it; the selected project's name lives in the project selector.
export function ProductMark({
  decorative = false,
}: {
  // When true, the mark is the Sessions control's visual: hidden from
  // assistive technology so only that control's name is announced.
  readonly decorative?: boolean;
} = {}) {
  return (
    <img
      className="product-mark"
      src="/icon-64.png"
      alt={decorative ? "" : "Open Dough"}
      width={32}
      height={32}
      draggable={false}
      aria-hidden={decorative ? true : undefined}
    />
  );
}
