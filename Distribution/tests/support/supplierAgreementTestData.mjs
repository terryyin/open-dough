// @ts-check

/** @typedef {ReturnType<typeof import("../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs").normalizeStoryDependency>} SupplierAgreement */

// A story's agreement with its supplier as tests arrange it, needing the
// supplier's endpoint contract unless the test says otherwise:
// `makeMe.aSupplierAgreement.with(facts).please()`.
export const supplierAgreementBuilder = {
  /** @param {Omit<SupplierAgreement, "implementation" | "rationale" | "condition"> & Partial<Pick<SupplierAgreement, "implementation" | "rationale" | "condition">>} facts */
  with({
    supplier,
    implementation = "Shared endpoint interpretation",
    rationale = "The supplier must deliver the endpoint contract before this story can validate its consumer behavior; normal reconciliation cannot supply the missing contract.",
    condition = "The selected endpoint contract is completed and integrated.",
    ...facts
  }) {
    return {
      please: () => ({
        supplier: { identity: supplier.identity, href: supplier.href },
        implementation,
        rationale,
        condition,
        ...facts,
      }),
    };
  },
};
