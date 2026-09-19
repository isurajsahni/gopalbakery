/*
  Gopal Bakery and Sweets – small enhancements shared by every page:
  - closes the phone menu after a link is tapped
  - runs the two home-page sliders (cakes and reviews): endless loop,
    arrow buttons, swipe on phones, click-and-drag with a mouse,
    and the gold progress bar.
  Without this file the sliders still work as rows you can scroll sideways.
*/
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Phone menu: close it again after a link is chosen ----------
const menuToggle = document.getElementById('menu-toggle');
document.querySelectorAll('.header__menu a').forEach((link) => {
  link.addEventListener('click', () => {
    if (menuToggle) menuToggle.checked = false;
  });
});

// ---------- Sliders ----------
document.querySelectorAll('[data-carousel]').forEach(setupSlider);

function setupSlider(root) {
  const viewport = root.querySelector('[data-carousel-viewport]');
  const track = root.querySelector('[data-carousel-track]');
  if (!viewport || !track) return;

  const slides = [...track.children];
  const count = slides.length;
  if (count < 2) return;

  const centered = root.dataset.carousel === 'center'; // reviews sit in the middle
  const anchor = root.querySelector('.container');      // cakes line up with the page content
  const progressBar = root.querySelector('[data-carousel-progress]');
  const EASE = 'transform 0.55s cubic-bezier(0.22, 0.61, 0.36, 1)';

  // A copy of every card goes before and after the real ones, so the row can
  // keep moving in either direction and then quietly hop back to the real card.
  const copy = (slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.inert = true;
    return clone;
  };
  track.prepend(...slides.map(copy));
  track.append(...slides.map(copy));
  slides.forEach((slide, i) => {
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} of ${count}`);
  });
  root.classList.add('is-ready');

  const cards = track.children;
  let position = count; // index in the whole row; `count` is the first real card
  let offset = 0;       // the row's current translateX in px

  const step = () => cards[1].offsetLeft - cards[0].offsetLeft; // card width + gap
  const realIndex = () => (((position - count) % count) + count) % count;

  // translateX that puts card number `pos` in its resting place
  function restingOffset(pos) {
    const card = cards[pos];
    if (centered) return viewport.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
    const left = anchor ? anchor.getBoundingClientRect().left - viewport.getBoundingClientRect().left : 0;
    return left - card.offsetLeft;
  }

  function setOffset(px, animate) {
    offset = px;
    track.style.transition = animate && !reduceMotion ? EASE : 'none';
    track.style.transform = `translate3d(${px}px, 0, 0)`;
  }

  // where the row is right now, even halfway through an animation
  function visualOffset() {
    return new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
  }

  // If we're on a copy, swap to the matching real card. The copy and the real
  // card look identical, so shifting everything by one full set is invisible.
  function backToRealCards(fromOffset = offset) {
    let px = fromOffset;
    if (position < count) { position += count; px -= count * step(); }
    else if (position >= count * 2) { position -= count; px += count * step(); }
    else return;
    setOffset(px, false);
    void track.offsetWidth; // apply the swap before any new animation starts
  }

  function updateProgress() {
    if (!progressBar) return;
    const room = progressBar.parentElement.clientWidth - progressBar.offsetWidth;
    progressBar.style.transform = `translateX(${(realIndex() / (count - 1)) * room}px)`;
  }

  function move(steps) {
    steps = Math.max(-count, Math.min(count, steps));
    if (position + steps < 0 || position + steps > cards.length - 1) backToRealCards(visualOffset());
    position += steps;
    setOffset(restingOffset(position), true);
    updateProgress();
  }

  track.addEventListener('transitionend', (event) => {
    if (event.target === track && event.propertyName === 'transform') {
      backToRealCards(restingOffset(position));
    }
  });

  root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => move(-1));
  root.querySelector('[data-carousel-next]')?.addEventListener('click', () => move(1));

  // keyboard: ← / → while one of the arrow buttons has focus
  root.addEventListener('keydown', (event) => {
    if (!event.target.closest('[data-carousel-prev], [data-carousel-next]')) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
  });

  // ----- swipe (touch) and click-and-drag (mouse) -----
  let drag = null;

  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') {
      if (event.button !== 0) return;
      event.preventDefault(); // no text selection or image dragging
    }
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: null, dx: 0 };
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    if (drag.start === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;          // hasn't really moved yet
      if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; }   // scrolling the page instead
      const now = visualOffset();
      setOffset(now, false);                                      // catch the row where it is
      backToRealCards(now);
      drag.start = offset;
      root.classList.add('is-dragging');
      try {
        viewport.setPointerCapture(event.pointerId);              // keep following the finger/mouse
      } catch {
        /* pointer already gone – the drag still works without capture */
      }
    }

    drag.dx = dx;
    setOffset(drag.start + dx, false);
  });

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    const { start, dx } = drag;
    drag = null;
    if (start === null) return; // it was a tap, not a drag
    root.classList.remove('is-dragging');

    // settle on the card nearest to where it was let go; a short flick still moves one card
    const size = step();
    let steps = Math.round((restingOffset(position) - (start + dx)) / size);
    if (steps === 0 && Math.abs(dx) > Math.min(60, size * 0.15)) steps = dx < 0 ? 1 : -1;
    move(steps);
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);

  // keep everything lined up when the window changes size
  let frame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      backToRealCards(restingOffset(position));
      setOffset(restingOffset(position), false);
      updateProgress();
    });
  });

  setOffset(restingOffset(position), false);
  updateProgress();
}
