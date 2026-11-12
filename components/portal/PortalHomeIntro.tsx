export interface PortalHomeIntroProps {
  intro: string
}

export function PortalHomeIntro({ intro }: PortalHomeIntroProps) {
  return (
    <section className="max-w-3xl py-10">
      <p className="text-base leading-7 text-gray-700 dark:text-gray-300">{intro}</p>
    </section>
  )
}
