export default async function decorate(block) {
  // Block has one row with two cells: [image] [text content]
  // The EDS framework already structured the DOM, nothing extra needed.
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children];
    // First cell = image, second cell = text
    // Add semantic classes for styling hooks
    if (cells[0]) cells[0].classList.add('mission-principles-image');
    if (cells[1]) cells[1].classList.add('mission-principles-content');
  });
}
