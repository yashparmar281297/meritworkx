// Blocks freelancers/clients from sharing contact details or arranging work outside
// the platform in messages and proposals — this is enforced again at the database
// level (see the check_no_contact_info trigger) since this client-side check alone
// can be bypassed by a determined user calling the API directly.

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const URL_RE = /\b((https?:\/\/)|www\.)\S+/i;
const DOMAIN_RE = /\b[a-zA-Z0-9-]{2,}\.(com|net|org|io|co|in|dev|me|app|xyz|info|biz|us|uk|ca|ai|so|gg|site|online)\b/i;
const PHONE_RE = /(\+\d{7,15})|(\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)|(\b\d{10}\b)/;
const KEYWORD_RE =
  /(whatsapp|telegram|\bskype\b|\bdiscord\b|signal me|paypal\.me|\bvenmo\b|\bzelle\b|cash ?app|\bupi\b|outside (the )?platform|off[- ]platform|outside meritworkx|contact me (at|on)|reach me (at|on)|call me( at| on)?|text me( at| on)?|my (personal )?(number|email|phone) is|hit me up|\bdm me\b|message me on|add me on)/i;

export function findContactInfoViolation(text: string): string | null {
  if (!text) return null;
  if (EMAIL_RE.test(text)) return "an email address";
  if (URL_RE.test(text) || DOMAIN_RE.test(text)) return "a website or link";
  if (PHONE_RE.test(text)) return "a phone number";
  if (KEYWORD_RE.test(text)) return "a request to connect outside the platform";
  return null;
}

export const CONTACT_INFO_ERROR =
  "This can't be sent — it looks like it contains contact details or a request to connect outside MeritWorkX. Please keep all communication on the platform.";
