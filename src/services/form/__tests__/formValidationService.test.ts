import { describe, it, expect } from 'vitest';
import { formValidationService } from '../formValidationService';
import { createFormValues } from '@/lib/__tests__/factories/formFactory';

// @covers FR-01.01
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

    it('requires a 4-digit PLZ once an address is entered', () => {
      expect(formValidationService.validateForm(createFormValues({ plz: '' })))
        .toHaveProperty('plz');
      expect(formValidationService.validateForm(createFormValues({ plz: '630' })))
        .toHaveProperty('plz');
      expect(formValidationService.validateForm(createFormValues({ plz: '6300' })))
        .not.toHaveProperty('plz');
    });

    it('requires a municipality once a Zug address is picked', () => {
      expect(formValidationService.validateForm(createFormValues({ gemeindeBfs: '' })))
        .toMatchObject({ gemeindeBfs: 'Bitte wählen Sie die zuständige Gemeinde' });
      expect(formValidationService.validateForm(createFormValues({ gemeindeBfs: '261' })))
        .toHaveProperty('gemeindeBfs');
    });

    it('rejects a postcode outside canton Zug', () => {
      const errors = formValidationService.validateForm(
        createFormValues({ address: 'Bahnhofstrasse 1, 8001 Zürich', plz: '8001', ort: 'Zürich', gemeindeBfs: '' }));
      expect(errors).toMatchObject({ plz: 'Diese PLZ liegt nicht im Kanton Zug' });
      expect(errors).not.toHaveProperty('gemeindeBfs');
    });

    it('clears the municipality error once one is selected', () => {
      expect(formValidationService.validateField('gemeindeBfs', '')).toBe('Bitte wählen Sie die zuständige Gemeinde');
      expect(formValidationService.validateField('gemeindeBfs', '1704')).toBe('');
    });

    it('reports only the missing address when it is empty', () => {
      const errors = formValidationService.validateForm(createFormValues({ address: '', plz: '' }));
      expect(errors).toHaveProperty('address');
      expect(errors).not.toHaveProperty('plz');
    });
  });
});