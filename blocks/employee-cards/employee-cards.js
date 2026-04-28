export default async function decorate(block) {
  const rows = [...block.children];

  // Identify card rows (rows that contain an image in first cell)
  const cardRows = rows.filter((row) => row.querySelector('picture'));

  // Wrap card rows in a grid container
  if (cardRows.length > 0) {
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    cardRows.forEach((card) => {
      card.classList.add('card');
      grid.appendChild(card);
    });
    block.appendChild(grid);
  }
}
