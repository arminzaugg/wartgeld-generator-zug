import { render, screen, fireEvent } from '@testing-library/react';
import { SignaturePad } from '../SignaturePad';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('SignaturePad', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders signature pad with buttons', () => {
    render(<SignaturePad onSave={mockOnSave} />);
    
    expect(screen.getByText(/Löschen/i)).toBeInTheDocument();
    expect(screen.getByText(/Speichern/i)).toBeInTheDocument();
  });

  it('handles file upload', () => {
    render(<SignaturePad onSave={mockOnSave} />);
    
    const fileInput = screen.getByLabelText(/PNG-Datei/i);
    const file = new File(['dummy content'], 'signature.png', { type: 'image/png' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    
    // Wait for FileReader mock to process
    setTimeout(() => {
      expect(mockOnSave).toHaveBeenCalled();
    }, 0);
  });
});