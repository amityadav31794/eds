import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const expanded = navSections.querySelector('[aria-expanded="true"]');
    if (expanded && isDesktop.matches) {
      toggleAllNavSections(navSections);
      expanded.focus();
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const expanded = navSections.querySelector('[aria-expanded="true"]');
    if (expanded && isDesktop.matches) toggleAllNavSections(navSections, false);
    else if (!isDesktop.matches) toggleMenu(nav, navSections, false);
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  if (focused.className === 'nav-drop' && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
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
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
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

  // Assign roles: children[0]=brand, children[1]=sections, children[2]=tools
  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Fix brand link styling
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      if (brandLink.closest('.button-container')) {
        brandLink.closest('.button-container').className = '';
      }
    }
  }

  // Wire up primary nav dropdowns
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
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

  // ── Two-row layout: extract tools into a utility bar above the main nav ──
  const navTools = nav.querySelector('.nav-tools');
  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';

  if (navTools && isDesktop.matches) {
    // Create separate utility bar row
    const utilityBar = document.createElement('div');
    utilityBar.className = 'nav-utility-bar';
    const utilityInner = document.createElement('div');
    utilityInner.className = 'nav-utility-inner';
    // Move tools content into utility bar
    utilityInner.appendChild(navTools.cloneNode(true));
    utilityBar.appendChild(utilityInner);
    navWrapper.appendChild(utilityBar);
  }

  navWrapper.append(nav);
  block.append(navWrapper);

  // On resize: re-render utility bar
  isDesktop.addEventListener('change', () => {
    const existingUtil = navWrapper.querySelector('.nav-utility-bar');
    const tools = nav.querySelector('.nav-tools');
    if (isDesktop.matches && !existingUtil && tools) {
      const utilityBar = document.createElement('div');
      utilityBar.className = 'nav-utility-bar';
      const utilityInner = document.createElement('div');
      utilityInner.className = 'nav-utility-inner';
      utilityInner.appendChild(tools.cloneNode(true));
      utilityBar.appendChild(utilityInner);
      navWrapper.insertBefore(utilityBar, nav);
    } else if (!isDesktop.matches && existingUtil) {
      existingUtil.remove();
    }
  });
}
