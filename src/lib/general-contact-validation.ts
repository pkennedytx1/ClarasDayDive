export type GeneralContactForm = {
  name: string;
  email: string;
  message: string;
};

export type GeneralContactFieldName = keyof GeneralContactForm;
export type GeneralContactFieldErrors = Partial<Record<GeneralContactFieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 2000;

export function validateGeneralContact(form: GeneralContactForm): GeneralContactFieldErrors {
  const errors: GeneralContactFieldErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();

  if (!name) errors.name = 'Please enter your name.';
  else if (name.length < 2) errors.name = 'Name should be at least 2 characters.';
  else if (name.length > MAX_NAME_LENGTH) errors.name = 'Name is too long.';

  if (!email) errors.email = 'Please enter your email.';
  else if (email.length > MAX_EMAIL_LENGTH) errors.email = 'Email address is too long.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Please enter a valid email address.';

  if (!message) errors.message = 'Please enter a message.';
  else if (message.length < MIN_MESSAGE_LENGTH) errors.message = 'Please add a little more detail.';
  else if (message.length > MAX_MESSAGE_LENGTH) errors.message = 'Message is too long.';

  return errors;
}

export function hasGeneralContactErrors(errors: GeneralContactFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
