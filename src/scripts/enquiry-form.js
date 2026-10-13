// Netlify manages submissions and notification recipients; no email credentials reach the browser.
export async function submitEnquiry(data, fetcher = fetch) {
  if (data.get('website')) throw new Error('Unable to submit this form.');
  const response = await fetcher('/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data).toString(),
    signal: AbortSignal.timeout(18000),
  });
  if (!response.ok) {
    if ([404, 405, 501, 503].includes(response.status))
      throw new Error(
        'Online sending is not enabled yet. Your message has not been sent. Please try again later.',
      );
    if (response.status === 429)
      throw new Error('Your message wasn’t sent: too many attempts. Please try again later.');
    throw new Error('Your message wasn’t sent. Please try again; your details are still here.');
  }
}

// Inline field errors. The message sits after the field (hidden from the label's name) and is linked
// to it with aria-describedby, so screen readers hear it with the field.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function fieldError(field) {
  if (field.validity.valueMissing || (field.required && !field.value.trim()))
    return (
      field.dataset.empty ||
      (field.type === 'email' ? 'Enter your email address.' : 'Please fill in this field.')
    );
  if (field.type === 'email' && !EMAIL.test(field.value.trim()))
    return 'Enter an email address like name@company.com.';
  return '';
}
function showError(field, message) {
  if (!message && !field.errorElement) {
    field.removeAttribute('aria-invalid');
    return;
  }
  let error = field.errorElement;
  if (!error) {
    error = document.createElement('span');
    error.className = 'field-error';
    error.id = `${field.id || field.name}-error`;
    error.setAttribute('aria-hidden', 'true');
    // Place the message straight after the field, ahead of any character counter.
    field.after(error);
    field.errorElement = error;
    const described = field.getAttribute('aria-describedby');
    field.setAttribute('aria-describedby', [error.id, described].filter(Boolean).join(' '));
  }
  error.textContent = message;
  error.hidden = !message;
  if (message) field.setAttribute('aria-invalid', 'true');
  else field.removeAttribute('aria-invalid');
}

// When sending fails, offer a route that does not depend on the form: a pre-filled email and the
// phone number, so a carefully written enquiry is never lost.
function showFallback(status, form, payload) {
  const email = form.dataset.fallbackEmail;
  if (!email) return;
  const phone = form.dataset.fallbackPhone;
  // Mail links have a practical length limit, so long messages are shortened and the visitor told.
  const full = String(payload.get('message') || '');
  const shortened = full.length > 1500;
  const message = shortened
    ? `${full.slice(0, 1500)}…\n\n[Shortened: paste the rest from the form.]`
    : full;
  const name = String(payload.get('name') || '');
  const subject = `Enquiry from ${name || 'the website'}`;
  const body = [message, '', name, payload.get('company'), payload.get('email')]
    .filter((line) => line !== null && line !== undefined)
    .join('\n')
    .trim();
  const fallback = document.createElement('span');
  fallback.className = 'form-fallback';
  const mail = document.createElement('a');
  mail.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  mail.textContent = `email it to ${email}`;
  fallback.append(' You can also ', mail);
  if (phone) {
    const tel = document.createElement('a');
    tel.href = `tel:${phone.replace(/\s/g, '')}`;
    tel.textContent = phone;
    fallback.append(' or call ', tel);
  }
  fallback.append('.');
  if (shortened)
    fallback.append(
      ' The email holds the first 1,500 characters; paste in the rest before sending.',
    );
  status.append(fallback);
}

// Progressive enhancement: without JavaScript, Netlify handles the native form submission.
export function mountEnquiryForm(kind) {
  const form = document.querySelector(`#${kind}-form`);
  if (!form) return;
  // The script validates with its own inline messages instead of browser bubbles.
  form.noValidate = true;
  const result = document.querySelector(`#${kind}-result`);
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[type="submit"]');
  const submitLabel = submit.textContent;
  const required = [...form.querySelectorAll('[required]')];
  const next = form.parentElement?.querySelector('.contact-next');
  let sending = false;
  // Character counters for fields that declare one. Near the limit the counter says what is left,
  // and a polite live region announces crossing the threshold once rather than every keystroke.
  form.querySelectorAll('[data-count]').forEach((field) => {
    const counter = document.getElementById(field.dataset.count);
    const live = field.closest('label')?.querySelector('[data-count-live]');
    const max = field.maxLength;
    let stage = 0;
    let clipped = false;
    const announce = (text) => {
      if (live) live.textContent = text;
    };
    const update = () => {
      const length = field.value.length;
      const left = max - length;
      const near = length > max * 0.9;
      let text = `${length} / ${max}`;
      if (length >= max)
        text = clipped
          ? `Pasted text was cut at ${max.toLocaleString('en-GB')} characters`
          : `Limit reached: ${max.toLocaleString('en-GB')} characters`;
      else if (near) text = `${left.toLocaleString('en-GB')} characters left`;
      counter.textContent = text;
      counter.toggleAttribute('data-near-limit', near);
      const next = length >= max ? 2 : near ? 1 : 0;
      if (next > stage) announce(text);
      stage = next;
      if (length < max) clipped = false;
    };
    // Pasting past the limit is cut by the browser without warning; note it in the counter.
    field.addEventListener('paste', (event) => {
      const pasted = event.clipboardData?.getData('text') || '';
      const room = max - field.value.length + (field.selectionEnd - field.selectionStart);
      clipped = pasted.length > room;
    });
    field.addEventListener('input', update);
    form.addEventListener('reset', () => requestAnimationFrame(update));
    update();
  });
  // Once a field has shown an error, re-check it as the visitor corrects it.
  form.addEventListener('input', (event) => {
    if (event.target.hasAttribute('aria-invalid'))
      showError(event.target, fieldError(event.target));
  });
  form.addEventListener(
    'blur',
    (event) => {
      if (required.includes(event.target) && event.target.value)
        showError(event.target, fieldError(event.target));
    },
    true,
  );
  // After a successful send, let the visitor write another message without reloading.
  result?.querySelector('[data-send-another]')?.addEventListener('click', () => {
    result.hidden = true;
    form.hidden = false;
    status.hidden = true;
    next?.removeAttribute('data-sent');
    required.forEach((field) => showError(field, ''));
    (required.find((field) => !field.value) || required[0])?.focus();
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    const invalid = required.filter((field) => {
      const message = fieldError(field);
      showError(field, message);
      return message;
    });
    if (invalid.length) {
      // A short summary in the status region when more than one field needs attention.
      if (invalid.length > 1) {
        status.hidden = false;
        status.dataset.error = '';
        status.removeAttribute('data-sending');
        status.textContent = `${invalid.length} fields need attention.`;
      } else if (status.hasAttribute('data-error') && !status.querySelector('.form-fallback')) {
        status.hidden = true;
      }
      invalid[0].focus();
      return;
    }
    // Capture values before disabling controls, which otherwise excludes them from FormData.
    const payload = new FormData(form);
    for (const [name, value] of payload) payload.set(name, value.trim());
    sending = true;
    status.hidden = false;
    status.removeAttribute('data-error');
    // The button shows progress visually; the status line announces it to screen readers only.
    status.dataset.sending = '';
    status.textContent = 'Sending your message…';
    form.setAttribute('aria-busy', 'true');
    const controls = [...form.elements].filter((element) => !element.disabled);
    controls.forEach((element) => {
      element.disabled = true;
    });
    submit.textContent = 'Sending…';
    let failed = false;
    try {
      await submitEnquiry(payload);
      const echo = result.querySelector('[data-result-email]');
      if (echo) echo.textContent = payload.get('email');
      // Keep who they are for a follow-up message; clear only what they wrote.
      const kept = [...form.querySelectorAll('input[autocomplete]')]
        .filter((field) => ['name', 'email', 'organization', 'tel'].includes(field.autocomplete))
        .map((field) => [field, field.value]);
      form.reset();
      kept.forEach(([field, value]) => {
        field.value = value;
      });
      status.hidden = true;
      next?.setAttribute('data-sent', '');
      form.hidden = true;
      result.hidden = false;
      result.querySelector('[tabindex="-1"]').focus();
    } catch (error) {
      failed = true;
      status.dataset.error = '';
      status.textContent =
        error.name === 'TimeoutError' || error.name === 'TypeError'
          ? 'We could not confirm sending. Check your connection and try again; your details are still here.'
          : error.message;
      showFallback(status, form, payload);
    } finally {
      sending = false;
      status.removeAttribute('data-sending');
      controls.forEach((element) => {
        element.disabled = false;
      });
      submit.textContent = submitLabel;
      form.removeAttribute('aria-busy');
      // Disabled controls drop focus; return it to the button so the visitor can retry.
      if (failed) submit.focus();
    }
  });
}
