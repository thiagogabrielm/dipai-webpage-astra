/** Keep the toggle's accessible name stable while updating its state and visual tooltip. */
export function updateMotionControl(button, paused) {
  button.setAttribute('aria-pressed', String(paused));
  button.title = `${paused ? 'Resume' : 'Pause'} ${button.dataset.motionSubject}`;
}
