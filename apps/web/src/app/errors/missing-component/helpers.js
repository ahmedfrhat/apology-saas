// Stub helper used by the missing-component error demo page.
// This exists only so the route compiles cleanly; at runtime the
// component simply renders null.
export function SomethingElse() {
  return 'not what you wanted';
}

export function DoesNotExist() {
  return null;
}
