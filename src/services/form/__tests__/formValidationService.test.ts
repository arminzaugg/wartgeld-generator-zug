import { describe, it, expect } from 'vitest';
import { formValidationService } from '../formValidationService';
import { createFormValues } from '@/lib/__tests__/factories/formFactory';

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
      const invalidValues = createFormValues({
        vorname: '',
        nachname: '',
        address: '',
        geburtsdatum: '',
      });

      const errors = formValidationService.validateForm(invalidValues);
      expect(errors).toHaveProperty('vorname');
      expect(errors).toHaveProperty('nachname');
      expect(errors).toHaveProperty('address');
      expect(errors).toHaveProperty('geburtsdatum');
    });

    it('should return no errors for valid form', () => {
      const validValues = createFormValues({
        vorname: 'John',
        nachname: 'Doe',
        address: 'Test Street 1',
        geburtsdatum: '2024-01-01',
      });

      const errors = formValidationService.validateForm(validValues);
      expect(Object.keys(errors).length).toBe(0);
    });
  });
});