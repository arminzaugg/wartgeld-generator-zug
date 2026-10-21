import { Link } from "react-router-dom";

const NEW_ADDRESS = "https://wartgeld.nidea.ch/";

/** Shown only on the old Netlify address until it forwards to the new one. */
export const MovedNotice = ({ hostname = window.location.hostname }: { hostname?: string }) => {
  if (!hostname.endsWith(".netlify.app")) return null;

  return (
    <div role="status" className="border-b bg-muted px-4 py-3 text-sm text-center">
      Der Wartgeld Generator ist umgezogen nach{" "}
      <a href={NEW_ADDRESS} className="font-semibold underline">wartgeld.nidea.ch</a>.
      Bitte zuerst hier die{" "}
      <Link to="/settings" className="underline">Einstellungen sichern</Link>{" "}
      und die Datei an der neuen Adresse unter Einstellungen wieder laden.
    </div>
  );
};
