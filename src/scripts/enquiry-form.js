// Shared browser submission flow. Credentials and recipient addresses stay server-side.
export function mountEnquiryForm(kind) {
  const form = document.querySelector(`#${kind}-form`);
  if (!form) return;
  const result = document.querySelector(`#${kind}-result`);
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[type="submit"]');
  const submitLabel = submit.textContent;
  let sending = false,
    previousPayload = '',
    requestId = '';
  submit.disabled = false;
  form.addEventListener('input', (event) => event.target.setCustomValidity?.(''));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    for (const field of form.querySelectorAll('[required]'))
      field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
    if (!form.reportValidity()) return;
    const payload = { kind };
    for (const name of ['name', 'email', 'message', 'company', 'interest', 'website']) {
      const field = form.elements.namedItem(name);
      if (field) payload[name] = field.value.trim();
    }
    const signature = JSON.stringify(payload);
    if (signature !== previousPayload) {
      requestId = crypto.randomUUID();
      previousPayload = signature;
    }
    payload.requestId = requestId;
    sending = true;
    status.hidden = false;
    status.removeAttribute('data-error');
    status.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    const controls = [...form.elements].filter((element) => !element.disabled);
    controls.forEach((element) => {
      element.disabled = true;
    });
    submit.textContent = 'Sending…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(18000),
      });
      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }
      if (!response.ok || data?.ok !== true) {
        const messages = {
          not_configured:
            'Online sending is not enabled yet. Your message has not been sent. Please try again later.',
          rate_limit: 'Too many attempts. Please try again in 10 minutes.',
          validation: 'Please check your details and try again.',
        };
        throw new Error(
          messages[data?.code] ||
            ([404, 405, 501].includes(response.status)
              ? messages.not_configured
              : 'We could not confirm sending. Please try again; your details are still here.'),
        );
      }
      form.reset();
      form.hidden = true;
      result.hidden = false;
      result.querySelector('[tabindex="-1"]').focus();
      requestId = '';
      previousPayload = '';
    } catch (error) {
      status.dataset.error = '';
      status.textContent =
        error.name === 'TimeoutError' || error.name === 'TypeError'
          ? 'We could not confirm sending. Check your connection and try again; your details are still here.'
          : error.message;
    } finally {
      sending = false;
      controls.forEach((element) => {
        element.disabled = false;
      });
      submit.textContent = submitLabel;
      form.removeAttribute('aria-busy');
    }
  });
}
