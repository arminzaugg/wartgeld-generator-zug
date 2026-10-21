import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MovedNotice } from '../MovedNotice';
import { renderWithProviders } from '@/lib/__tests__/test-utils';

// @covers FR-01.06
describe('notice on the old Netlify address', () => {
  it('tells users on the old address to save their settings and move', () => {
    renderWithProviders(<MovedNotice hostname="wartgeld-generator-zug.netlify.app" />);
    expect(screen.getByRole('link', { name: 'wartgeld.nidea.ch' })).toHaveAttribute('href', 'https://wartgeld.nidea.ch/');
    expect(screen.getByRole('link', { name: 'Einstellungen sichern' })).toHaveAttribute('href', '/settings');
  });

  it.each(['wartgeld.nidea.ch', 'localhost', 'deploy-preview-1--wartgeld-generator-zug.netlify.app.evil.example'])(
    'stays hidden on %s', hostname => {
      renderWithProviders(<MovedNotice hostname={hostname} />);
      expect(screen.queryByText(/ist umgezogen/)).not.toBeInTheDocument();
    });
});
