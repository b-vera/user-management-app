import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Fails if the control value contains any whitespace character.
 * Passes when the value is empty (let `required` handle that case).
 */
export const noWhitespace: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';
  return value.length > 0 && /\s/.test(value) ? { noWhitespace: true } : null;
};

/**
 * Fails if the value is not one of the allowed UserRole values.
 */
export const validRole: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const allowed = ['admin', 'user', 'guest'];
  return control.value && !allowed.includes(control.value) ? { roleInvalid: true } : null;
};
