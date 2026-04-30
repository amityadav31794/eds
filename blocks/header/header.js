import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code !== 'Escape') return;
  const nav = document.getElementById('nav');
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;
  const expanded = navSections.querySelector('[aria-expanded="true"]');
  if (expanded && isDesktop.matches) { toggleAllNavSections(navSections); expanded.focus(); }
  else if (!isDesktop.matches) { toggleMenu(nav, navSections); nav.querySelector('button').focus(); }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (nav.contains(e.relatedTarget)) return;
  const navSections = nav.querySelector('.nav-sections');
  if (!navSections) return;
  const expanded = navSections.querySelector('[aria-expanded="true"]');
  if (expanded && isDesktop.matches) toggleAllNavSections(navSections, false);
  else if (!isDesktop.matches) toggleMenu(nav, navSections, false);
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  if (focused.className === 'nav-drop' && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((s) => {
    s.setAttribute('aria-expanded', expanded);
  });
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (navSections) {
    const drops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      drops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', () => document.activeElement.addEventListener('keydown', openOnKeydown));
        }
      });
    } else {
      drops.forEach((drop) => { drop.removeAttribute('tabindex'); });
    }
  }

  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Assign roles: [0]=brand [1]=sections [2]=tools
  ['brand', 'sections', 'tools'].forEach((c, i) => {
    if (nav.children[i]) nav.children[i].classList.add(`nav-${c}`);
  });

  // Fix brand: remove button class from logo link, fix img to use svg source
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandBtn = navBrand.querySelector('.button');
    if (brandBtn) {
      brandBtn.className = '';
      brandBtn.closest('.button-container')?.classList.remove('button-container');
    }
    // Force logo img to use svg source instead of webp
    const picture = navBrand.querySelector('picture');
    if (picture) {
      const svgSource = picture.querySelector('source[type="image/svg+xml"]');
      const img = picture.querySelector('img');
      if (svgSource && img) {
        const svgSrcset = svgSource.getAttribute('srcset');
        // Use the 2000w svg (best quality), strip optimize param issues
        const svgUrl = svgSrcset ? svgSrcset.split(' ')[0] : null;
        if (svgUrl) {
          // Replace picture with simple img for reliable rendering
          const logoImg = document.createElement('img');
          logoImg.src = svgUrl;
          logoImg.alt = img.alt || 'Zimmer Biomet';
          logoImg.width = 160;
          logoImg.height = 48;
          logoImg.loading = 'eager';
          picture.replaceWith(logoImg);
        }
      }
    }
  }

  // Wire primary nav dropdowns
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
      if (li.querySelector('ul')) li.classList.add('nav-drop');
      li.addEventListener('click', () => {
        if (isDesktop.matches) {
          const exp = li.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          li.setAttribute('aria-expanded', exp ? 'false' : 'true');
        }
      });
    });
  }

  // Hamburger
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
    <span class="nav-hamburger-icon"></span>
  </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // ── Two-row wrapper ──
  // On desktop: utility bar (tools) on top, main nav below
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  const navTools = nav.querySelector('.nav-tools');

  function buildUtilityBar() {
    const bar = document.createElement('div');
    bar.className = 'nav-utility-bar';
    const inner = document.createElement('div');
    inner.className = 'nav-utility-inner';
    if (navTools) inner.appendChild(navTools);
    bar.appendChild(inner);
    return bar;
  }

  if (isDesktop.matches) {
    navWrapper.appendChild(buildUtilityBar());
  }
  navWrapper.appendChild(nav);
  block.appendChild(navWrapper);

  isDesktop.addEventListener('change', () => {
    const existingBar = navWrapper.querySelector('.nav-utility-bar');
    if (isDesktop.matches && !existingBar) {
      navWrapper.insertBefore(buildUtilityBar(), nav);
    } else if (!isDesktop.matches && existingBar) {
      // Move tools back into nav for mobile menu
      const tools = existingBar.querySelector('.nav-tools');
      if (tools) nav.appendChild(tools);
      existingBar.remove();
    }
  });
}
