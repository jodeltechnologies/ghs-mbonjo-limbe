// Attestation of Effective Service and Certificate of Assumption or Resumption
// of Duty. Part 7.2 and 7.3. Line for line against the school's present form,
// so that the Divisional Delegation receives something it recognises.

const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const stamp = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export type SheetProps = {
  type: 'attestation' | 'certificate';
  cfg: Record<string, string>;
  reference: string;
  issuedOn: string;
  principalName: string;
  principalCorps: string;
  staffName: string;
  corps: string;
  matricule: string;
  matriculeLabel: string;
  salaryIndex: string;
  decisionNo: string;
  assumedOn: string;
  functionText: string;
  academicYear: string;
};

function Row({ en, fr, value }: { en: string; fr?: string; value?: string }) {
  return (
    <div className="grid grid-cols-[64mm_1fr] gap-[3mm] mb-[4mm]">
      <div className="text-[10.6pt]">{en}{fr && <i className="block text-[9.2pt] text-neutral-600">{fr}</i>}</div>
      <div className="border-b border-dotted border-neutral-700 min-h-[6mm] font-bold">{value}</div>
    </div>
  );
}

export function DocumentSheet(p: SheetProps) {
  const cert = p.type === 'certificate';
  return (
    <div className="sheet shadow">
      <div className="grid grid-cols-[1fr_28mm_1fr] gap-[4mm] text-center text-[9.4pt] leading-[1.3]">
        <div>
          <b className="block">REPUBLIC OF CAMEROON</b>
          <i className="block text-[8.8pt]">Peace-Work-Fatherland</i>
          <b className="block">MINISTRY OF SECONDARY EDUCATION</b>
          <b className="block">{p.cfg.region_en}</b><b className="block">{p.cfg.division_en}</b>
          <b className="block">GOV&rsquo;T HIGH SCHOOL MBONJO</b>
          <i className="block text-[8.8pt]">Tel: {p.cfg.phone}</i>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <div><img src="/shield.png" alt="" className="w-[26mm] h-[26mm] object-contain mx-auto" /></div>
        <div>
          <b className="block">REPUBLIQUE DU CAMEROUN</b>
          <i className="block text-[8.8pt]">Paix-Travail-Patrie</i>
          <b className="block">MINISTERE DES ENSEIGNEMENTS SECONDAIRES</b>
          <b className="block">{p.cfg.region_fr}</b><b className="block">{p.cfg.division_fr}</b>
          <b className="block">LYCEE DE MBONJO, LIMBE</b>
          <i className="block text-[8.8pt]">Tel: {p.cfg.phone}</i>
        </div>
      </div>
      <hr className="border-black my-[3mm]" />
      <div className="flex justify-between flex-wrap gap-[8mm] text-[10pt]">
        <div>Reg. no {p.cfg.reg_no}<br />Ref. No. <u>&nbsp;{p.reference}&nbsp;</u></div>
        <div>{p.cfg.place}, the <u>&nbsp;{stamp(p.issuedOn)}&nbsp;</u></div>
      </div>

      <div className="text-center my-[8mm]">
        <b className="block underline text-[13pt]">
          {cert ? 'CERTIFICATE OF ASSUMPTION / RESUMPTION OF DUTY' : 'ATTESTATION OF EFFECTIVE SERVICE'}
        </b>
        <i className="block underline text-[11pt]">
          {cert ? 'Certificat de prise / reprise de service' : 'Attestation de présence effective'}
        </i>
        {cert && <div className="mt-[3mm] text-[10.4pt]">ACADEMIC YEAR <b>{p.academicYear}</b></div>}
      </div>

      <Row en="I, the undersigned" fr="Je soussigné" value={p.principalName} />
      <div className="grid grid-cols-[64mm_1fr] gap-[3mm] mb-[4mm]">
        <div /><div>{p.principalCorps}<br />PRINCIPAL / PROVISEUR</div>
      </div>
      <Row en="Principal of" fr="Proviseur du" value={p.cfg.school_en} />
      <div className="grid grid-cols-[64mm_1fr] gap-[3mm] mb-[4mm]"><div /><div>{p.cfg.school_fr}</div></div>
      <Row en="Certify that M." fr="Atteste que M." value={p.staffName.toUpperCase()} />

      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto_1fr] gap-[3mm] items-end mb-[4mm]">
        <div className="text-[10.6pt]">Rank<i className="block text-[9.2pt]">Grade</i></div>
        <div className="border-b border-dotted border-neutral-700 font-bold">{p.corps}</div>
        <div className="text-[10.6pt]">{p.matriculeLabel}<i className="block text-[9.2pt]">Numéro Matricule</i></div>
        <div className="border-b border-dotted border-neutral-700 font-bold">{p.matricule}</div>
        <div className="text-[10.6pt]">Index<i className="block text-[9.2pt]">Indice</i></div>
        <div className="border-b border-dotted border-neutral-700 font-bold">{p.salaryIndex}</div>
      </div>

      <Row en="Appointed / Transferred by Decision No" fr="Nommé(e) / Affecté(e) par Décision No" value={p.decisionNo} />
      <Row en="And Assumed / Resumed duty on" fr="Et a pris service le" value={p.assumedOn} />
      <Row en="Is effectively serving as" fr="Est effectivement en service comme" value={p.functionText} />

      <p className="mt-[8mm] text-[10.6pt]">
        In testimony whereof, this present attestation is issued to serve the purpose for which it is intended.
        <br /><i className="text-[9.4pt]">
          En foi de quoi la présente attestation est délivrée pour servir et valoir ce que de droit.
        </i>
      </p>

      <div className="mt-[14mm] flex justify-end">
        <div className="text-center min-w-[60mm]">
          <div className="text-[10pt]">{p.cfg.place}, the {stamp(p.issuedOn)}</div>
          <div className="border-t border-black mt-[16mm] pt-[2px] text-[9.6pt]">
            {p.principalName}<br />{p.principalCorps}<br />PRINCIPAL / PROVISEUR
          </div>
        </div>
      </div>

      <p className="mt-[10mm] text-[8.4pt] text-neutral-600">
        Verify this reference at the school website, Verify page, or by telephone on {p.cfg.phone}.
      </p>
    </div>
  );
}
