// Marci Metzger Homes: page interactions (no libraries)
document.documentElement.classList.add('js');

/* ---------- Header: border on scroll ---------- */
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('main-nav');

function setMenu(open) {
  nav.classList.toggle('open', open);
  document.body.classList.toggle('nav-open', open);
  navToggle.setAttribute('aria-expanded', open);
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Highlight the nav link for the section in view ---------- */
const navLinks = [...nav.querySelectorAll('ul a')];
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = '#' + entry.target.id;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => sectionObserver.observe(s));

/* ---------- Reveal on scroll ---------- */
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Listing search ----------
   The original site uses a third-party MLS/IDX feed we don't have access to,
   so the search turns the criteria into a message for Marci instead. */
const searchForm = document.getElementById('search-form');
const searchNote = document.getElementById('search-note');
const messageBox = document.getElementById('c-message');

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(searchForm);
  const money = v => v ? '$' + Number(v).toLocaleString() : '';

  const parts = [
    data.get('location') && `Location: ${data.get('location')}`,
    data.get('type') && `Type: ${data.get('type')}`,
    data.get('beds') && `Bedrooms: ${data.get('beds')}`,
    data.get('baths') && `Baths: ${data.get('baths')}`,
    (data.get('min') || data.get('max')) &&
      `Price: ${money(data.get('min')) || 'any'} – ${money(data.get('max')) || 'any'}`,
    `Sort: ${data.get('sort')}`
  ].filter(Boolean);

  messageBox.value = `Hi Marci, I'm looking for a home.\n${parts.join('\n')}`;
  searchNote.textContent = "Got it! We've added your search to the message below. Send it and Marci will reply with matching listings.";
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => document.getElementById('c-name').focus({ preventScroll: true }), 700);
});

/* ---------- Contact form (Netlify Forms) ---------- */
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!contactForm.checkValidity()) {
    formStatus.textContent = 'Please enter a valid email address.';
    contactForm.querySelector(':invalid').focus();
    return;
  }

  formStatus.textContent = 'Sending…';
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(contactForm)).toString()
    });
    if (!res.ok) throw new Error(res.status);
    contactForm.reset();
    formStatus.textContent = "Thank you! Marci will be in touch shortly.";
  } catch {
    formStatus.textContent = "Sorry, that didn't go through. Please call (206) 919-6886.";
  }
});

/* ---------- Office hours: open now? (Pahrump is on Pacific time) ---------- */
const openStatus = document.getElementById('open-status');
const pahrumpHour = Number(new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Los_Angeles'
}).format(new Date()));
const isOpen = pahrumpHour >= 8 && pahrumpHour < 19;
openStatus.textContent = isOpen ? 'Open now' : 'Closed now · opens 8:00 am';
openStatus.classList.toggle('is-open', isOpen);

/* ---------- Gallery lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');
const galleryItems = [...document.querySelectorAll('.gallery-item')];
let current = 0;

function showPhoto(i) {
  current = (i + galleryItems.length) % galleryItems.length;
  const item = galleryItems[current];
  lightboxImg.src = item.dataset.full;
  lightboxImg.alt = item.querySelector('img').alt;
}

galleryItems.forEach((item, i) => item.addEventListener('click', () => {
  showPhoto(i);
  lightbox.showModal();
}));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.prev').addEventListener('click', () => showPhoto(current - 1));
lightbox.querySelector('.next').addEventListener('click', () => showPhoto(current + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') showPhoto(current - 1);
  if (e.key === 'ArrowRight') showPhoto(current + 1);
});

/* ---------- Cookie notice ---------- */
const cookieBanner = document.getElementById('cookie-banner');
let cookiesAccepted = false;
try { cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'yes'; } catch {}

if (!cookiesAccepted) {
  cookieBanner.hidden = false;
  document.body.classList.add('cookie-visible');
}
document.getElementById('cookie-accept').addEventListener('click', () => {
  cookieBanner.hidden = true;
  document.body.classList.remove('cookie-visible');
  try { localStorage.setItem('cookiesAccepted', 'yes'); } catch {}
});

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
