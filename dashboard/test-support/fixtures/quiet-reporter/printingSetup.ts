// A global setup that prints, so the run itself writes output outside any
// test.
export default function printingSetup(): void {
  console.log("stray chatter from global setup");
}
