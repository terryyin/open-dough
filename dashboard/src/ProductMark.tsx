import "./product-mark.css";

// Open Dough's own mark: the product's passive identity at the start of every
// top-level view -- the dashboard's banner, the banner shown while no project
// is configured, and System settings -- whichever project is selected. It is
// the accepted icon export the browser tab uses (../server/brandAssetPlugin.ts),
// drawn at twice its CSS size for sharp high-density screens. Its alternative
// text names the product once: no view shows the product's name as text beside
// it, and the selected project's own name, even "Open Dough", is that
// project's heading. It is an image, never a control or link.
export function ProductMark() {
  return (
    <img
      className="product-mark"
      src="/icon-64.png"
      alt="Open Dough"
      width={32}
      height={32}
      draggable={false}
    />
  );
}
