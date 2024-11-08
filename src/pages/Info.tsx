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
          <h2 className="text-2xl font-semibold mb-4">Impressum</h2>
          <p className="text-gray-700 leading-relaxed">
            Entwickelt von:<br />
            Armin Zaugg
          </p>
        </section>
      </div>
    </div>
  );
};

export default Info;