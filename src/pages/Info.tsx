import { useId } from "react";
import { FileText, Landmark, Mail, MapPin, ShieldCheck, type LucideIcon } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

const FEATURES: { title: string; text: string; Icon: LucideIcon }[] = [
  { title: "Adresssuche der Post", text: "Strasse tippen, Vorschlag wählen. PLZ und Ort sind sofort korrekt.", Icon: MapPin },
  { title: "Richtige Gemeinde", text: "Die zuständige Zuger Wohngemeinde wird als Empfängerin der Rechnung vorgeschlagen.", Icon: Landmark },
  { title: "PDF zum Drucken", text: "Mit Absender und Unterschrift. Drucken oder speichern.", Icon: FileText },
];

const STEPS: { title: string; text: string }[] = [
  { title: "Einstellungen erfassen", text: "Absender, Ort und Unterschrift einmalig hinterlegen." },
  { title: "Angaben eingeben", text: "Name, Adresse und Geburtsdatum der Wöchnerin." },
  { title: "Leistungen wählen", text: "Betreuung bei der Geburt, Pflege im Wochenbett oder beides." },
  { title: "Rechnung generieren", text: "Vorschau prüfen, dann drucken oder speichern." },
];

const sectionTitle = "text-[28px] leading-[34px]";

const PrivacyBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2.5 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-5">
    <h3 className="text-[13px] font-semibold uppercase tracking-[0.04em] opacity-85">{title}</h3>
    <p className="text-[15px] leading-[23px]">{children}</p>
  </div>
);

const Info = () => {
  const privacyId = useId();

  return (
    <div className="min-h-screen">
      <AppHeader current="info" />
      <main className="mx-auto flex max-w-[1120px] flex-col gap-12 px-5 pb-14 pt-8 md:gap-[72px] md:px-10 md:pb-24 md:pt-16 lg:px-20">
        <div className="flex flex-wrap items-end gap-x-16 gap-y-5">
          <div className="flex min-w-0 flex-[1.1_1_320px] flex-col gap-4">
            <p className="text-sm font-semibold text-primary">Über diese Anwendung</p>
            <h1 className="text-balance text-[36px] leading-[1.08] tracking-[-0.02em] md:text-[52px]">
              Wartgeld-Rechnungen für Hebammen im Kanton Zug.
            </h1>
          </div>
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3 text-[17px] leading-[27px] text-foreground-secondary">
            <p>
              Der Wartgeld Generator erstellt aus wenigen Angaben die Rechnung für das Hebammenwartgeld an die
              Wohngemeinde. Die zuständige Gemeinde wird anhand der Postleitzahl vorgeschlagen.
            </p>
            <p>Gedacht für freischaffende Hebammen, die schnell und ohne Software-Kenntnisse abrechnen möchten.</p>
          </div>
        </div>

        <section className="flex flex-col gap-6" aria-labelledby="info-funktionen">
          <h2 id="info-funktionen" className={sectionTitle}>Funktionen</h2>
          <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
            {FEATURES.map(({ title, text, Icon }) => (
              <li key={title} className="flex flex-col gap-3 rounded-2xl border bg-card p-6 shadow-card">
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="text-[17px] font-semibold">{title}</h3>
                <p className="text-[15px] leading-[23px] text-foreground-secondary">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-6" aria-labelledby="info-verwendung">
          <h2 id="info-verwendung" className={sectionTitle}>Verwendung</h2>
          <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-px overflow-hidden rounded-2xl border bg-border shadow-card">
            {STEPS.map(({ title, text }, index) => (
              <li key={title} className="flex flex-col gap-2.5 bg-card p-6">
                <span aria-hidden="true" className="font-serif text-[32px] font-medium leading-none text-primary">{index + 1}</span>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm leading-[21px] text-foreground-secondary">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby={privacyId}
          className="flex flex-wrap gap-8 rounded-3xl bg-primary px-6 py-7 text-primary-foreground md:p-12"
        >
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
            <ShieldCheck className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
            <h2 id={privacyId} className="text-balance text-[32px] leading-[38px]">
              Datenschutz: Ihre Patientinnendaten bleiben bei Ihnen.
            </h2>
            <p className="text-base leading-[25px] opacity-90">
              Die Anwendung läuft in Ihrem Browser. Es gibt kein Konto und keine gespeicherten Rechnungen.
            </p>
          </div>
          <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
            <PrivacyBox title="Bleibt in Ihrem Browser">
              Name, Geburtsdatum, Leistungen, Ihr Absender, Ihre Unterschrift und das fertige PDF. Ihre Einstellungen
              werden im lokalen Speicher (Local Storage) Ihres Browsers gespeichert. Mit «Einstellungen sichern»
              erstellen Sie eine Datei, die nur auf Ihrem Gerät gespeichert wird.
            </PrivacyBox>
            <PrivacyBox title="Geht an die Schweizerische Post">
              Für die Adressvorschläge wird der Text, den Sie ins Adressfeld eingeben (Strasse, Hausnummer, PLZ und
              Ort, soweit eingegeben), über unseren Adressdienst an eine Schnittstelle der Schweizerischen Post
              gesendet. Die Anfrage läuft dabei über unseren Hosting-Anbieter bunny.net, der wie bei jedem
              Webseitenaufruf Ihre IP-Adresse sieht (über die alte Adresse wartgeld-generator-zug.netlify.app
              zusätzlich über Netlify). Weitere Daten werden nicht übermittelt; der Adressdienst speichert keine
              Adressen.
            </PrivacyBox>
          </div>
        </section>

        <div className="flex flex-wrap gap-4">
          <section aria-labelledby="info-disclaimer" className="flex min-w-0 flex-[1.4_1_320px] flex-col gap-2 rounded-2xl border p-6">
            <h2 id="info-disclaimer" className="font-sans text-base font-semibold">Service-Disclaimer</h2>
            <p className="text-sm leading-[22px] text-foreground-secondary">
              Dieser Service wird auf Best-Effort-Basis bereitgestellt. Der Anbieter garantiert keine ununterbrochene
              Verfügbarkeit, Fehlerfreiheit oder vollständige Funktionalität der Anwendung. Die Nutzung erfolgt auf
              eigenes Risiko.
            </p>
          </section>
          <section aria-labelledby="info-kontakt" className="flex min-w-0 flex-[1_1_280px] flex-col gap-3 rounded-2xl border bg-card p-6 shadow-card">
            <h2 id="info-kontakt" className="font-sans text-base font-semibold">Kontakt</h2>
            <p className="text-sm leading-[22px] text-foreground-secondary">
              Fragen, Fehler oder Anregungen? Schreiben Sie uns.
            </p>
            <p className="text-[15px]">Armin Zaugg</p>
            <a
              href="mailto:armin.zaugg@traintown.solutions"
              className="flex min-h-11 w-fit items-center gap-2 break-all rounded-md text-[15px] font-semibold text-primary underline underline-offset-4 hover:text-primary-hover focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_hsl(var(--background)),0_0_0_4px_hsl(var(--primary))]"
            >
              <Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              armin.zaugg@traintown.solutions
            </a>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Info;
