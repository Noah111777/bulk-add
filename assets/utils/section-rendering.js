export function fetchSection(id) {
  const url = `${window.location.pathname}?section_id=${id}`;
  return fetch(url)
    .then(r => r.text())
    .then(html => {
      const div = document.createElement('div');
      div.innerHTML = html;
      const section = div.querySelector(`#shopify-section-${id}`);
      const target = document.querySelector(`#shopify-section-${id}`);
      if (section && target) target.innerHTML = section.innerHTML;
    });
}
