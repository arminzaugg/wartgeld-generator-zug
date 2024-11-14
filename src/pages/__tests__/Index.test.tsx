import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index from '../Index';

describe('Index', () => {
  it('renders the main heading', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Hebammenwartgeld Kanton Zug')).toBeDefined();
  });
});