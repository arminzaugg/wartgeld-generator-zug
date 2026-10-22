import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';

// @covers FR-01.06
describe('Toaster', () => {
  it('shows a check in an accent circle for a confirmation', () => {
    render(<Toaster />);
    act(() => { toast({ title: 'Gespeichert', description: 'Die Einstellungen wurden gespeichert.' }); });
    const icon = screen.getByText('Gespeichert').closest('li')!.querySelector('[data-toast-icon]')!;
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon.querySelector('svg')).toHaveClass('lucide-check');
  });

  it('shows an alert icon in a soft danger circle for an error', () => {
    render(<Toaster />);
    act(() => { toast({ title: 'Fehler', description: 'PDF konnte nicht generiert werden.', variant: 'destructive' }); });
    const icon = screen.getByText('Fehler').closest('li')!.querySelector('[data-toast-icon]')!;
    expect(icon.querySelector('svg')).toHaveClass('lucide-circle-alert');
    expect(icon.className, 'red signal now sits in the icon, not the surface').toContain('bg-destructive-soft');
  });
});
