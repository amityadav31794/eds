export default async function decorate(block) {
  const rows = [...block.children];

  // Row 0: Image + Heading (intro section)
  // Row 1: Subsection 1 (diversity/inclusion)
  // Row 2: Subsection 2 (charitable donations)

  // Wrap subsections (rows 1 and 2) in a grid container
  if (rows.length >= 3) {
    const subsections = document.createElement('div');
    subsections.className = 'subsections';
    subsections.append(rows[1], rows[2]);
    block.append(subsections);
  }
}
