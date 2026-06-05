import { FormBuilder, FormControl, Validators } from '@angular/forms';

import { noWhitespace, validRole } from './user.validators';

function buildUserForm() {
  return new FormBuilder().group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3), noWhitespace]],
    email: ['', [Validators.required, Validators.email]],
    role: ['', [Validators.required, validRole]],
  });
}

describe('noWhitespace validator', () => {
  it('returns null for a string without spaces and noWhitespace error for one with spaces', () => {
    expect(noWhitespace(new FormControl('juanperez'))).toBeNull();
    expect(noWhitespace(new FormControl('juan perez'))).toEqual({ noWhitespace: true });
  });

  it('returns null for an empty string (required handles that case)', () => {
    expect(noWhitespace(new FormControl(''))).toBeNull();
  });
});

describe('UserFormComponent FormGroup', () => {
  it('is invalid when username is empty', () => {
    const form = buildUserForm();
    form.setValue({
      first_name: 'Juan',
      last_name: 'Pérez',
      username: '',
      email: 'juan@example.com',
      role: 'user',
    });

    expect(form.invalid).toBeTrue();
    expect(form.get('username')?.hasError('required')).toBeTrue();
  });

  it('is valid with all fields correctly filled', () => {
    const form = buildUserForm();
    form.setValue({
      first_name: 'Juan',
      last_name: 'Pérez',
      username: 'juanperez',
      email: 'juan@example.com',
      role: 'user',
    });

    expect(form.valid).toBeTrue();
  });
});
