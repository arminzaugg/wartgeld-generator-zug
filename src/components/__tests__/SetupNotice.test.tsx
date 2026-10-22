import { describe, it, expect, beforeEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import { renderWithProviders } from '@/lib/__tests__/test-utils';
import { SetupNotice } from '@/components/SetupNotice';
import { AppHeader } from '@/components/AppHeader';
import { updateSettings } from '@/lib/presetStorage';

const COMPLETE = { senderInfo: 'Anna Muster', ortRechnungssteller: 'Zug', signature: 'data:image/png;base64,AA' };

// @covers FR-01.06
describe('SetupNotice', () => {
  beforeEach(() => localStorage.clear());

  it('names the number and the items still missing, with a way to the settings', () => {
    renderWithProviders(<SetupNotice />);
    expect(screen.getByText('Noch 3 Angaben bis zur ersten Rechnung')).toBeInTheDocument();
    expect(screen.getByText(/Rechnungsstellerin, Ort der Ausstellung und Unterschrift/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Zu den Einstellungen/ })).toHaveAttribute('href', '/settings');
  });

  it('uses the singular when one item is left', () => {
    localStorage.setItem('form-settings', JSON.stringify({ senderInfo: 'Anna', ortRechnungssteller: 'Zug' }));
    renderWithProviders(<SetupNotice />);
    expect(screen.getByText('Noch 1 Angabe bis zur ersten Rechnung')).toBeInTheDocument();
  });

  it('disappears once everything is saved', () => {
    renderWithProviders(<SetupNotice />);
    act(() => updateSettings(COMPLETE));
    expect(screen.queryByText(/bis zur ersten Rechnung/)).toBeNull();
  });
});

// @covers FR-01.06
describe('AppHeader setup dot', () => {
  beforeEach(() => localStorage.clear());

  it('marks "Einstellungen" as incomplete without changing its name', () => {
    renderWithProviders(<AppHeader current="rechnung" />);
    const link = screen.getByRole('link', { name: 'Einstellungen' });
    expect(link).toHaveAccessibleDescription('Einrichtung unvollständig');
    expect(link.querySelector('[data-setup-dot]')).not.toBeNull();
  });

  it('shows no dot and no description once setup is complete', () => {
    updateSettings(COMPLETE);
    renderWithProviders(<AppHeader current="rechnung" />);
    const link = screen.getByRole('link', { name: 'Einstellungen' });
    expect(link).not.toHaveAttribute('aria-describedby');
    expect(link.querySelector('[data-setup-dot]')).toBeNull();
  });
});
