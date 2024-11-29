import { describe, it, expect } from 'vitest';
import { formValidationService } from '../formValidationService';

describe('formValidationService', () => {
  describe('validateField', () => {
    it('should validate vorname field', () => {
      expect(formValidationService.validateField('vorname', '')).toBe('Mindestens 2 Zeichen erforderlich');
      expect(formValidationService.validateField('vorname', 'a')).toBe('Mindestens 2 Zeichen erforderlich');
      expect(formValidationService.validateField('vorname', 'John')).toBe('');
    });

    it('should validate nachname field', () => {
      expect(formValidationService.validateField('nachname', '')).toBe('Mindestens 2 Zeichen erforderlich');
      expect(formValidationService.validateField('nachname', 'a')).toBe('Mindestens 2 Zeichen erforderlich');
      expect(formValidationService.validateField('nachname', 'Doe')).toBe('');
    });

    it('should validate geburtsdatum field', () => {
      expect(formValidationService.validateField('geburtsdatum', '')).toBe('Bitte geben Sie ein Datum ein');
      expect(formValidationService.validateField('geburtsdatum', '2024-01-01')).toBe('');
    });
  });

  describe('validateForm', () => {
    it('should return errors for invalid form', () => {
      const values = {
        vorname: '',
        nachname: '',
        address: '',
        plz: '',
        ort: '',
        geburtsdatum: '',
        betreuungGeburt: false,
        betreuungWochenbett: false,
      };

      const errors = formValidationService.validateForm(values);
      expect(errors).toHaveProperty('vorname');
      expect(errors).toHaveProperty('nachname');
      expect(errors).toHaveProperty('address');
      expect(errors).toHaveProperty('geburtsdatum');
    });

    it('should return no errors for valid form', () => {
      const values = {
        vorname: 'John',
        nachname: 'Doe',
        address: 'Test Street 1',
        plz: '1234',
        ort: 'Test City',
        geburtsdatum: '2024-01-01',
        betreuungGeburt: true,
        betreuungWochenbett: false,
      };

      const errors = formValidationService.validateForm(values);
      expect(Object.keys(errors).length).toBe(0);
    });
  });
});