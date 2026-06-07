export type GetStyleInfo = (resolved: { element: unknown }) => { className: string; styles: Record<string, string> | null };

export function initDesignMode(getStyleInfo: GetStyleInfo) {
  return () => {
    // mock reselect function
  };
}
