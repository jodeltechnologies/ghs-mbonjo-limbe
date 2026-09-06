// The bilingual government header the school already uses, English on the left
// and French on the right, exactly as it appears on its own attestations.
export function Masthead({ cfg }: { cfg: Record<string, string> }) {
  return (
    <header className="bg-paper border-b-[3px] border-green">
      <div className="mx-auto max-w-[1120px] grid grid-cols-1 md:grid-cols-[1fr_76px_1fr] gap-3 items-center px-5 py-4 text-center">
        <div className="text-[10.5px] leading-[1.42] font-semibold text-ink2">
          <b className="block text-ink text-[11.5px]">REPUBLIC OF CAMEROON</b>
          <i className="block not-italic opacity-80">Peace &ndash; Work &ndash; Fatherland</i>
          MINISTRY OF SECONDARY EDUCATION<br />
          {cfg.region_en}<br />{cfg.division_en}
          <b className="block text-ink">GOV&rsquo;T HIGH SCHOOL MBONJO</b>
        </div>
        <div className="order-first md:order-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/shield.png" alt="Shield of Government High School Mbonjo, Limbe"
               width={76} height={76} className="mx-auto" />
        </div>
        <div className="hidden md:block text-[10.5px] leading-[1.42] font-semibold text-ink2">
          <b className="block text-ink text-[11.5px]">REPUBLIQUE DU CAMEROUN</b>
          <i className="block not-italic opacity-80">Paix &ndash; Travail &ndash; Patrie</i>
          MINISTERE DES ENSEIGNEMENTS SECONDAIRES<br />
          {cfg.region_fr}<br />{cfg.division_fr}
          <b className="block text-ink">LYCEE DE MBONJO, LIMBE</b>
        </div>
      </div>
    </header>
  );
}
