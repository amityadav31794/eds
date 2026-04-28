export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  // Row 0: header (title + News Feed link)
  const headerRow = rows[0];
  const headerCells = [...headerRow.children];
  const titleEl = headerCells[0]?.querySelector('h2');
  const feedLink = headerCells[1]?.querySelector('a');

  // Row 1: tabs (For Investors label)
  const tabsRow = rows[1];
  const tabLabel = tabsRow.querySelector('p')?.textContent?.trim() || 'For Investors';

  // Rows 2+: news cards
  const cardRows = rows.slice(2);

  // Build new DOM
  block.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'nc-header';
  if (titleEl) {
    const h2 = document.createElement('h2');
    h2.textContent = titleEl.textContent;
    header.appendChild(h2);
  }
  if (feedLink) {
    const link = document.createElement('a');
    link.className = 'nc-feed-link';
    link.href = feedLink.href;
    link.textContent = feedLink.textContent.trim();
    header.appendChild(link);
  }
  block.appendChild(header);

  // Tabs
  const tabs = document.createElement('div');
  tabs.className = 'nc-tabs';
  const tab = document.createElement('span');
  tab.className = 'nc-tab';
  tab.textContent = tabLabel;
  tabs.appendChild(tab);
  block.appendChild(tabs);

  // Carousel track wrapper
  const trackWrapper = document.createElement('div');
  trackWrapper.className = 'nc-track-wrapper';
  const track = document.createElement('div');
  track.className = 'nc-track';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    const heading = cells[0]?.querySelector('h3');
    const link = cells[1]?.querySelector('a');

    const card = document.createElement('div');
    card.className = 'nc-card';

    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent;
      card.appendChild(h3);
    }

    if (link) {
      const footer = document.createElement('div');
      footer.className = 'nc-card-footer';
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent.trim();
      footer.appendChild(a);
      card.appendChild(footer);
    }

    track.appendChild(card);
  });

  trackWrapper.appendChild(track);
  block.appendChild(trackWrapper);

  // Controls
  const controls = document.createElement('div');
  controls.className = 'nc-controls';

  const prevBtn = document.createElement('button');
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.textContent = '\u2190';
  controls.appendChild(prevBtn);

  const indicator = document.createElement('span');
  indicator.className = 'nc-indicator';
  controls.appendChild(indicator);

  const nextBtn = document.createElement('button');
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.textContent = '\u2192';
  controls.appendChild(nextBtn);

  block.appendChild(controls);

  // Carousel logic
  let currentIndex = 0;
  const cards = [...track.children];
  const totalCards = cards.length;

  function getVisibleCount() {
    const wrapperWidth = trackWrapper.offsetWidth;
    if (wrapperWidth >= 1024) return 3;
    if (wrapperWidth >= 640) return 2;
    return 1;
  }

  function updateCarousel() {
    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(0, totalCards - visibleCount);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const gap = 20;
    const cardWidth = (trackWrapper.offsetWidth - gap * (visibleCount - 1)) / visibleCount;

    cards.forEach((card) => {
      card.style.flex = `0 0 ${cardWidth}px`;
    });

    const offset = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    indicator.textContent = `slide ${currentIndex + 1} of ${totalCards}`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  prevBtn.addEventListener('click', () => {
    currentIndex -= 1;
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex += 1;
    updateCarousel();
  });

  // Recalculate on resize
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect.width > 0) {
        updateCarousel();
      }
    }
  });
  resizeObserver.observe(trackWrapper);

  // Also run initial render after a short delay as fallback
  setTimeout(() => updateCarousel(), 100);
}
