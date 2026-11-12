/** Static ad layout shells only — no SDK or ad content in Phase 4.4. */
export function DetailAdSlots() {
  return (
    <aside
      className="mx-auto flex max-w-full flex-col items-center gap-6 py-6 lg:flex-row lg:justify-center"
      aria-hidden
    >
      <div
        className="hidden w-[300px] max-w-full shrink-0 border border-dashed border-gray-300 bg-gray-50 lg:block dark:border-gray-600 dark:bg-gray-900/30"
        style={{ height: 250 }}
      />
      <div
        className="w-[336px] max-w-[calc(100%-2rem)] shrink-0 border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900/30"
        style={{ height: 280 }}
      />
    </aside>
  )
}
