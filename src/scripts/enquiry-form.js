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
        'Your message wasn’t sent: online sending isn’t available right now. Please try again later.',
      );
    if (response.status === 429)
      throw new Error('Your message wasn’t sent: too many attempts. Please try again later.');
    throw new Error('Your message wasn’t sent. Please try again; your details are still here.');
  }
}

// Inline field errors. The message sits after the field (hidden from the label's name) and is linked
// to it with aria-describedby, so screen readers hear it with the field.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const number = (value) => value.toLocaleString('en-GB');
function fieldError(field) {
  if (field.validity.valueMissing || (field.required && !field.value.trim()))
    return (
      field.dataset.empty ||
      (field.type === 'email' ? 'Enter your email address.' : 'Please fill in this field.')
    );
  if (field.type === 'email' && !EMAIL.test(field.value.trim()))
    return 'Enter an email address like name@company.com.';
  const max = Number(field.dataset.max);
  if (max && field.value.length > max) {
    const over = field.value.length - max;
    return `Shorten your message by ${number(over)} ${over === 1 ? 'character' : 'characters'} to send it (limit ${number(max)}).`;
  }
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
  // A draft survives a refresh or a reloaded phone tab for this tab only, and is cleared once sent.
  // Storage can be unavailable (private mode, blocked site data), so every access is guarded.
  const draftKey = `dipai-draft-${kind}`;
  const draftFields = [
    ...form.querySelectorAll('input[name], textarea[name], select[name]'),
  ].filter((field) => field.type !== 'hidden' && !field.closest('.enquiry-trap'));
  const saveDraft = () => {
    try {
      const draft = Object.fromEntries(draftFields.map((field) => [field.name, field.value]));
      if (Object.values(draft).some((value) => value.trim())) {
        sessionStorage.setItem(draftKey, JSON.stringify(draft));
      } else sessionStorage.removeItem(draftKey);
    } catch {
      /* Drafts are a convenience; the form works without them. */
    }
  };
  const clearDraft = () => {
    try {
      sessionStorage.removeItem(draftKey);
    } catch {
      /* Ignore unavailable storage. */
    }
  };
  // A restored draft is named at the top of the form, with a way to start over. It doesn't claim
  // the message was never sent: after a timeout it may still have arrived.
  const draftNote = document.createElement('div');
  draftNote.className = 'form-draft';
  draftNote.hidden = true;
  const draftText = document.createElement('p');
  draftText.setAttribute('role', 'status');
  const startOver = document.createElement('button');
  startOver.type = 'button';
  startOver.className = 'text-button';
  startOver.textContent = 'Start over';
  draftNote.append(draftText, startOver);
  form.querySelector('input[type="hidden"]')?.after(draftNote);
  const hideDraftNote = () => {
    draftNote.hidden = true;
    draftText.textContent = '';
    startOver.textContent = 'Start over';
  };
  let restored = false;
  try {
    const saved = JSON.parse(sessionStorage.getItem(draftKey) || 'null');
    if (saved)
      draftFields.forEach((field) => {
        if (!field.value && typeof saved[field.name] === 'string' && saved[field.name]) {
          field.value = saved[field.name];
          restored = true;
        }
      });
  } catch {
    /* Ignore unreadable drafts. */
  }
  if (restored) {
    draftNote.hidden = false;
    // Set after insertion so the status is announced.
    requestAnimationFrame(() => {
      draftText.textContent = 'Restored what you wrote earlier.';
    });
  }
  // Start over is reversible: the cleared values are held for ten seconds behind an Undo.
  let draftMode = 'restored';
  let cleared = null;
  let undoTimer;
  const setFields = (values) => {
    draftFields.forEach((field) => {
      field.value = values?.[field.name] ?? '';
      showError(field, '');
      field.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };
  startOver.addEventListener('click', () => {
    if (draftMode === 'undo') {
      clearTimeout(undoTimer);
      draftMode = 'restored';
      setFields(cleared);
      cleared = null;
      saveDraft();
      draftText.textContent = 'Your draft is back.';
      startOver.textContent = 'Start over';
      draftFields.find((field) => !field.value)?.focus() || draftFields.at(-1)?.focus();
      undoTimer = setTimeout(hideDraftNote, 4000);
      return;
    }
    cleared = Object.fromEntries(draftFields.map((field) => [field.name, field.value]));
    draftMode = 'undo';
    setFields(null);
    clearDraft();
    draftText.textContent = 'Draft cleared.';
    startOver.textContent = 'Undo';
    startOver.focus();
    undoTimer = setTimeout(() => {
      cleared = null;
      draftMode = 'restored';
      hideDraftNote();
    }, 10000);
  });
  form.addEventListener('input', () => {
    saveDraft();
    if (
      draftMode === 'restored' &&
      !draftNote.hidden &&
      draftFields.every((field) => !field.value.trim())
    )
      hideDraftNote();
  });
  // Character counters for fields that declare one. Typing stops at the limit, but pasted text is
  // kept even when it runs over, so nothing written is lost; the counter shows how far over it is
  // and sending is blocked until it is trimmed. Without JavaScript the native maxlength applies.
  form.querySelectorAll('[data-count]').forEach((field) => {
    const counter = document.getElementById(field.dataset.count);
    // The announcer sits outside the label so its text never becomes part of the field's name.
    const live = form.querySelector(`[data-count-live="${field.id}"]`);
    const max = field.maxLength;
    field.dataset.max = String(max);
    field.removeAttribute('maxlength');
    let stage = 0;
    const announce = (text) => {
      if (live) live.textContent = text;
    };
    const update = () => {
      const length = field.value.length;
      const near = length > max * 0.9;
      const over = length > max;
      // Over the limit the counter only counts; the field error says what to do.
      let text = `${number(length)} / ${number(max)}`;
      if (!over && length === max) text = `Limit reached: ${number(max)} characters`;
      else if (near && !over) text = `${number(max - length)} characters left`;
      counter.textContent = text;
      counter.toggleAttribute('data-near-limit', near);
      counter.toggleAttribute('data-over', over);
      const next = over ? 3 : length === max ? 2 : near ? 1 : 0;
      if (next > stage && !over) announce(text);
      // Once back under a threshold the old announcement is stale, so clear it.
      if (next < stage) announce('');
      stage = next;
    };
    // Typed characters stop at the limit; pastes and drops are let through and flagged instead.
    field.addEventListener('beforeinput', (event) => {
      const typed = ['insertText', 'insertLineBreak', 'insertCompositionText'].includes(
        event.inputType,
      );
      const replacing = field.selectionEnd - field.selectionStart;
      const adding = event.inputType === 'insertLineBreak' ? 1 : (event.data || '').length;
      if (typed && field.value.length - replacing + adding > max) event.preventDefault();
    });
    field.addEventListener('input', (event) => {
      update();
      // Flag an over-limit paste straight away rather than waiting for submit.
      if (field.value.length > max && !field.hasAttribute('aria-invalid'))
        showError(field, fieldError(field));
      if (event.inputType?.startsWith('insertFrom') && field.value.length > max)
        announce(fieldError(field));
    });
    form.addEventListener('reset', () => requestAnimationFrame(update));
    update();
  });
  // Once a field has shown an error, re-check it as the visitor corrects it.
  // The error summary is kept in step with the fields: it counts down and disappears at zero.
  // Once a submit has found errors, the summary tracks every change until the next send: it
  // counts down, hides below two, and comes back if errors return.
  let summaryArmed = false;
  const refreshSummary = () => {
    if (!summaryArmed) return;
    const remaining = required.filter((field) => field.hasAttribute('aria-invalid')).length;
    if (remaining > 1) {
      status.hidden = false;
      status.dataset.error = '';
      status.dataset.summary = '';
      status.textContent = `${remaining} fields need attention.`;
    } else if (status.hasAttribute('data-summary')) {
      status.hidden = true;
      status.removeAttribute('data-summary');
      status.removeAttribute('data-error');
      status.textContent = '';
    }
  };
  // Corrections are acknowledged at once, but an email is not re-judged mid-word: while it is
  // still being typed its error is set aside, and the blur or submit check brings it back.
  form.addEventListener('input', (event) => {
    const field = event.target;
    if (field.hasAttribute('aria-invalid')) {
      const message = fieldError(field);
      showError(field, field.type === 'email' && message && field.value.trim() ? '' : message);
    }
    refreshSummary();
  });
  form.addEventListener(
    'blur',
    (event) => {
      if (required.includes(event.target) && event.target.value)
        showError(event.target, fieldError(event.target));
      refreshSummary();
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
      summaryArmed = true;
      status.removeAttribute('data-sending');
      refreshSummary();
      invalid[0].focus();
      return;
    }
    // Capture values before disabling controls, which otherwise excludes them from FormData.
    const payload = new FormData(form);
    for (const [name, value] of payload) payload.set(name, value.trim());
    sending = true;
    status.hidden = false;
    status.removeAttribute('data-error');
    status.removeAttribute('data-summary');
    summaryArmed = false;
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
      clearDraft();
      clearTimeout(undoTimer);
      draftMode = 'restored';
      hideDraftNote();
      status.hidden = true;
      next?.setAttribute('data-sent', '');
      form.hidden = true;
      result.hidden = false;
      result.querySelector('[tabindex="-1"]').focus();
    } catch (error) {
      failed = true;
      status.dataset.error = '';
      // A network error means nothing reached us; only a timeout leaves the outcome unknown.
      const message =
        error.name === 'TypeError'
          ? 'Your message wasn’t sent. Check your connection and try again; your details are still here.'
          : error.name === 'TimeoutError'
            ? 'We could not confirm sending. It may still arrive; trying again is safe, and if we receive it twice that’s fine. Your details are still here.'
            : error.message;
      // The first sentence says what happened; it is set in bold so it can be scanned.
      const [lead, ...rest] = message.split(/(?<=[.:])\s/);
      const strong = document.createElement('strong');
      strong.textContent = lead;
      status.replaceChildren(strong, rest.length ? ` ${rest.join(' ')}` : '');
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
