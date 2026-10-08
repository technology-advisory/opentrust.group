(() => {
  'use strict';
  const input = document.getElementById('global-search');
  const chips = [...document.querySelectorAll('[data-query]')];
  const items = [...document.querySelectorAll('.searchable')];
  const apply = (value) => {
    const q = (value || '').trim().toLocaleLowerCase('es');
    items.forEach((item) => {
      const haystack = `${item.textContent || ''} ${item.dataset.search || ''}`.toLocaleLowerCase('es');
      item.classList.toggle('is-dimmed', Boolean(q) && !haystack.includes(q));
    });
  };
  if (input) input.addEventListener('input', (event) => apply(event.target.value));
  chips.forEach((button) => button.addEventListener('click', () => {
    const wasActive = button.classList.contains('active');
    chips.forEach((chip) => chip.classList.remove('active'));
    button.classList.toggle('active', !wasActive);
    const value = wasActive ? '' : button.dataset.query;
    if (input) input.value = value;
    apply(value);
  }));
})();