/** Section heading: mono kicker + serif title whose middle word is the lime italic accent. */
export function SectionTitle({ kicker, title, intro, center }: { kicker: string; title: string[]; intro?: string; center?: boolean }) {
  const [a, b, c] = title
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="label">{kicker}</p>
      <h2 className="display mt-4 text-[clamp(2.6rem,6vw,5rem)]">
        {a} <span className="accent">{b}</span>
        {c ? ` ${c}` : ''}
      </h2>
      {intro && <p className={`mt-5 text-[15px] leading-relaxed text-fg/65 ${center ? 'mx-auto' : ''} max-w-xl`}>{intro}</p>}
    </div>
  )
}
