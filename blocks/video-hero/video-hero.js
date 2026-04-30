export default async function decorate(block) {
  const rows = [...block.children];
  // Row 0: h1 title
  // Row 1: h2 subtitle
  // Row 2: background image
  // Row 3: video thumbnail

  const titleRow = rows[0];
  const subtitleRow = rows[1];
  const bgRow = rows[2];
  const videoRow = rows[3];

  // Brightcove video config (from source page)
  const BRIGHTCOVE_ACCOUNT = '63783639001';
  const BRIGHTCOVE_PLAYER = 'HJyMISizl_default';
  const BRIGHTCOVE_VIDEO_ID = '6263803950001';
  const BRIGHTCOVE_EMBED_URL = `https://players.brightcove.net/${BRIGHTCOVE_ACCOUNT}/${BRIGHTCOVE_PLAYER}/index.html?videoId=${BRIGHTCOVE_VIDEO_ID}`;

  // Extract background image
  const bgImg = bgRow?.querySelector('img');
  const bgSrc = bgImg?.src || '';

  // Set background image on the block
  if (bgSrc) {
    block.style.backgroundImage = `url('${bgSrc}')`;
  }
  if (bgRow) bgRow.remove();

  // Build content area
  const content = document.createElement('div');
  content.className = 'video-hero-content';

  // Text section
  const textSection = document.createElement('div');
  textSection.className = 'video-hero-text';

  const h1 = titleRow?.querySelector('h1');
  const h2 = subtitleRow?.querySelector('h2');

  if (h1) textSection.appendChild(h1);
  if (h2) textSection.appendChild(h2);

  // Video section
  const videoSection = document.createElement('div');
  videoSection.className = 'video-hero-video';

  const videoImg = videoRow?.querySelector('picture');
  if (videoImg) {
    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'video-hero-player';
    videoWrapper.setAttribute('role', 'button');
    videoWrapper.setAttribute('tabindex', '0');
    videoWrapper.setAttribute('aria-label', 'Play Zimmer Biomet Overview video');
    videoWrapper.appendChild(videoImg);

    // Play button overlay
    const playBtn = document.createElement('div');
    playBtn.className = 'video-hero-play';
    playBtn.innerHTML = '<svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.5)" stroke="#fff" stroke-width="2"/><polygon points="26,20 26,44 46,32" fill="#fff"/></svg>';
    videoWrapper.appendChild(playBtn);

    videoSection.appendChild(videoWrapper);

    // --- Modal ---
    const modal = document.createElement('div');
    modal.className = 'video-hero-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Video player');
    modal.innerHTML = `
      <div class="video-hero-modal-overlay"></div>
      <div class="video-hero-modal-content">
        <button class="video-hero-modal-close" aria-label="Close video">&times;</button>
        <div class="video-hero-modal-player"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const modalPlayer = modal.querySelector('.video-hero-modal-player');
    const closeBtn = modal.querySelector('.video-hero-modal-close');
    const overlay = modal.querySelector('.video-hero-modal-overlay');

    function openModal() {
      // Lazy-load iframe only when opened
      if (!modalPlayer.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = BRIGHTCOVE_EMBED_URL;
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media');
        iframe.setAttribute('frameborder', '0');
        modalPlayer.appendChild(iframe);
      }
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      // Pause video by removing src and re-adding on next open
      const iframe = modalPlayer.querySelector('iframe');
      if (iframe) iframe.remove();
      videoWrapper.focus();
    }

    videoWrapper.addEventListener('click', openModal);
    videoWrapper.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
    });
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  content.appendChild(textSection);
  content.appendChild(videoSection);

  // Clear remaining rows and add content
  block.innerHTML = '';
  block.appendChild(content);
}
