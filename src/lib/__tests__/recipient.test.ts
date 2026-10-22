import { describe, it, expect } from 'vitest';
import { recipientLabel } from '../recipient';

// @covers FR-01.01
describe('recipientLabel', () => {
  it('names the recipient by its title when the title already names the municipality', () => {
    expect(recipientLabel(1701)).toBe('Einwohnergemeinde Baar');
  });

  it('adds the municipality name to a generic title', () => {
    expect(recipientLabel(1704)).toBe('Gemeindeverwaltung Menzingen');
  });

  it('names no recipient for an unknown municipality', () => {
    expect(recipientLabel(9999)).toBeNull();
  });
});
