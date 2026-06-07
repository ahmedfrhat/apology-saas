// Error demo page: intentionally references a "missing component" pattern.
// Both the stub and the page are self-contained to avoid cross-module
// resolution issues during the server bundle phase.

const DoesNotExist = () => null;

export default function Page() {
  return <div>{DoesNotExist()}</div>;
}
