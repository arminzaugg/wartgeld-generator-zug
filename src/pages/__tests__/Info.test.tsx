import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Info from '../Info';
import { renderWithProviders } from '@/lib/__tests__/test-utils';

// @covers FR-01.08
describe('Info privacy section', () => {
  const privacyText = () => {
    renderWithProviders(<Info />);
    return screen.getByRole('region', { name: /^Datenschutz/ }).textContent ?? '';
  };

  it('names the typed address text as the only data sent, and to whom', () => {
    const text = privacyText();
    expect(text).toMatch(/Text, den Sie ins Adressfeld eingeben/);
    expect(text).toMatch(/Strasse, Hausnummer, PLZ und Ort/);
    expect(text).toMatch(/Schweizerischen Post/);
    expect(text).toMatch(/Weitere Daten werden nicht übermittelt/);
  });

  it('names bunny.net as host that forwards the lookup and sees the IP address', () => {
    const text = privacyText();
    expect(text).toMatch(/Hosting-Anbieter bunny\.net/);
    expect(text).toMatch(/IP-Adresse/);
  });

  it('mentions Netlify only for the old address', () => {
    expect(privacyText()).toMatch(/alte Adresse wartgeld-generator-zug\.netlify\.app[^.]*Netlify/);
  });

  it('says that saved settings files stay with the user', () => {
    expect(privacyText()).toMatch(/Einstellungen sichern.*nur auf Ihrem Gerät/);
  });

  it('no longer claims that only the street name is sent', () => {
    expect(privacyText()).not.toMatch(/Eingabe des Strassennamens/);
  });

  it('splits what stays in the browser from what goes to the Swiss Post', () => {
    privacyText();
    expect(screen.getByRole('heading', { name: 'Bleibt in Ihrem Browser' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Geht an die Schweizerische Post' })).toBeInTheDocument();
  });
});

// @covers FR-01.08
describe('Info page content', () => {
  it('shows the shared top bar with Information as the current page and one h1', () => {
    renderWithProviders(<Info />);
    expect(screen.getByRole('link', { name: /Information/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Wartgeld-Rechnungen für Hebammen im Kanton Zug.');
  });

  it('says the municipality is proposed, not decided', () => {
    renderWithProviders(<Info />);
    expect(document.body.textContent).toMatch(/Gemeinde wird anhand der Postleitzahl vorgeschlagen/);
  });

  it('lists three functions and four numbered steps', () => {
    renderWithProviders(<Info />);
    const lists = screen.getAllByRole('list');
    expect(lists[0].querySelectorAll('li')).toHaveLength(3);
    expect(lists[1].tagName).toBe('OL');
    expect(lists[1].querySelectorAll('li')).toHaveLength(4);
  });

  it('promises no payment slip on the invoice', () => {
    renderWithProviders(<Info />);
    expect(document.body.textContent).not.toMatch(/Einzahlungsschein|QR-Rechnung/);
  });

  it('keeps the service disclaimer word for word', () => {
    renderWithProviders(<Info />);
    const disclaimer = screen.getByRole('region', { name: 'Service-Disclaimer' }).textContent?.replace(/\s+/g, ' ');
    expect(disclaimer).toContain(
      'Dieser Service wird auf Best-Effort-Basis bereitgestellt. Der Anbieter garantiert keine ununterbrochene ' +
      'Verfügbarkeit, Fehlerfreiheit oder vollständige Funktionalität der Anwendung. Die Nutzung erfolgt auf eigenes Risiko.',
    );
  });

  it('links to the real contact address', () => {
    renderWithProviders(<Info />);
    const contact = screen.getByRole('region', { name: 'Kontakt' });
    expect(contact).toHaveTextContent('Armin Zaugg');
    expect(screen.getByRole('link', { name: 'armin.zaugg@traintown.solutions' }))
      .toHaveAttribute('href', 'mailto:armin.zaugg@traintown.solutions');
  });
});
