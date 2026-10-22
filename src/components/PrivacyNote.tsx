import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

/** Must stay true to the data flow: only the entered address leaves the browser (FR-01.08). */
export const PrivacyNote = ({ compact = false }: { compact?: boolean }) =>
  compact ? (
    <aside className="flex items-center gap-2.5 rounded-lg bg-accent px-3.5 py-3 text-[13px] leading-[18px] text-accent-foreground">
      <ShieldCheck className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <p>
        <b className="font-semibold">Patientendaten bleiben in diesem Browser.</b>{" "}
        Nur die eingegebene Adresse geht über den eigenen Adressdienst an die Schweizerische Post.{" "}
        <Link to="/info" className="font-medium underline underline-offset-[3px]">Mehr erfahren</Link>
      </p>
    </aside>
  ) : (
    <aside className="flex items-start gap-4 rounded-lg bg-accent px-5 py-4 text-accent-foreground">
      <ShieldCheck className="mt-px h-[22px] w-[22px] shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-1 text-sm leading-[21px]">
        <p className="text-[15px] font-semibold">Patientendaten bleiben in diesem Browser.</p>
        <p>
          Nichts davon wird gespeichert oder versendet. Einzig die eingegebene Adresse geht für die Adresssuche
          über den eigenen Adressdienst an die Schweizerische Post.
        </p>
      </div>
      <Link to="/info" className="self-center whitespace-nowrap text-sm font-medium underline underline-offset-[3px] hover:no-underline">
        Mehr erfahren
      </Link>
    </aside>
  );
