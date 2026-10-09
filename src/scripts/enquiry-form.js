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
    if (response.status === 429) throw new Error('Too many attempts. Please try again later.');
    throw new Error('We could not confirm sending. Please try again; your details are still here.');
  }
}

// Progressive enhancement: without JavaScript, Netlify handles the native form submission.
export function mountEnquiryForm(kind) {
  const form = document.querySelector(`#${kind}-form`);
  if (!form) return;
  const result = document.querySelector(`#${kind}-result`);
  const status = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[type="submit"]');
  const submitLabel = submit.textContent;
  let sending = false;
  form.addEventListener('input', (event) => event.target.setCustomValidity?.(''));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending) return;
    for (const field of form.querySelectorAll('[required]'))
      field.setCustomValidity(field.value.trim() ? '' : 'Please complete this field.');
    if (!form.reportValidity()) return;
    // Capture values before disabling controls, which otherwise excludes them from FormData.
    const payload = new FormData(form);
    for (const [name, value] of payload) payload.set(name, value.trim());
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
      await submitEnquiry(payload);
      form.reset();
      form.hidden = true;
      result.hidden = false;
      result.querySelector('[tabindex="-1"]').focus();
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
