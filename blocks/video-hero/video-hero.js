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

  // Extract background image
  const bgImg = bgRow?.querySelector('img');
  const bgSrc = bgImg?.src || '';

  // Set background image on the block
  if (bgSrc) {
    block.style.backgroundImage = `url('${bgSrc}')`;
  }
  // Remove the bg image row from visible content
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
    videoWrapper.appendChild(videoImg);

    // Add play button overlay
    const playBtn = document.createElement('div');
    playBtn.className = 'video-hero-play';
    playBtn.setAttribute('aria-label', 'Play video');
    playBtn.innerHTML = '<svg viewBox="0 0 64 64" width="64" height="64"><circle cx="32" cy="32" r="30" fill="rgba(0,0,0,0.5)" stroke="#fff" stroke-width="2"/><polygon points="26,20 26,44 46,32" fill="#fff"/></svg>';
    videoWrapper.appendChild(playBtn);

    videoSection.appendChild(videoWrapper);
  }

  content.appendChild(textSection);
  content.appendChild(videoSection);

  // Clear remaining rows and add content
  block.innerHTML = '';
  block.appendChild(content);
}
