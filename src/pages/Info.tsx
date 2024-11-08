const Info = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Informationen</h1>
      
      <div className="prose prose-slate max-w-2xl space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Über diese Anwendung</h2>
          <p className="text-gray-700 leading-relaxed">
            Diese Anwendung ermöglicht es Hebammen, Rechnungen für das Hebammenwartgeld im Kanton Zug zu erstellen.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Funktionen</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Einfache Erfassung von Patientendaten</li>
            <li>Automatische Generierung von Rechnungen im PDF-Format</li>
            <li>Speicherung von Rechnungsstellerdaten in den Einstellungen</li>
            <li>Unterstützung aller Gemeinden im Kanton Zug</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Verwendung</h2>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700">
            <li>Erfassen Sie zuerst Ihre Daten als Rechnungsstellerin in den Einstellungen</li>
            <li>Füllen Sie das Formular mit den Patientendaten aus</li>
            <li>Generieren Sie die Rechnung mit einem Klick</li>
            <li>Laden Sie die erstellte PDF-Datei herunter</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Datenschutz</h2>
          <p className="text-gray-700 leading-relaxed">
            Diese Anwendung verarbeitet alle Daten ausschliesslich lokal in Ihrem Browser. Es werden keine Daten an externe Server gesendet. 
            Die einzigen gespeicherten Informationen sind Ihre Einstellungen, die im lokalen Speicher (Local Storage) Ihres Browsers gespeichert werden. 
            Es werden keine Cookies verwendet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Kontakt und Infos</h2>
          <p className="text-gray-700 leading-relaxed">
            Armin Zaugg<br />
            <a href="mailto:armin.zaugg@traintown.solutions" className="text-blue-600 hover:underline inline-flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              armin.zaugg@traintown.solutions
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Info;