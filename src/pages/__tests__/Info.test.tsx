import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import Info from '../Info';
import { renderWithProviders } from '@/lib/__tests__/test-utils';

// @covers FR-01.08
describe('Info privacy section', () => {
  const privacyText = () => {
    renderWithProviders(<Info />);
    return screen.getByRole('heading', { name: 'Datenschutz' }).nextElementSibling?.textContent ?? '';
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
});
