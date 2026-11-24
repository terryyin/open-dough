import { expect } from "vitest";

const brandAssets = {
  productMark: {
    canonical: new URL(
      "../../../assets/brand/favicon/icon-64.png",
      import.meta.url,
    ),
    contentType: "image/png",
  },
  kneadingAnimation: {
    canonical: new URL(
      "../../../assets/brand/opendough-knead.svg",
      import.meta.url,
    ),
    contentType: "image/svg+xml",
  },
};

export async function expectServedBrandAsset(
  source: string,
  asset: keyof typeof brandAssets,
) {
  const { canonical, contentType } = brandAssets[asset];
  const [served, exported] = await Promise.all([
    fetch(source),
    fetch(canonical),
  ]);
  expect(served.status).toBe(200);
  expect(served.headers.get("content-type")).toBe(contentType);
  expect(exported.status).toBe(200);
  expect(new Uint8Array(await served.arrayBuffer())).toEqual(
    new Uint8Array(await exported.arrayBuffer()),
  );
}
