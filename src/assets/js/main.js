function updateUiTheme() {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
}
window.addEventListener('load', () => {
  updateUiTheme();
  admaxOptimize();
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateUiTheme);

function admaxOptimize() {
  const admaxSectionElement = document.getElementById('ads_admax');
  if (admaxSectionElement) {
    console.log('Admax optimized!');
    admaxSectionElement.querySelectorAll(':scope > div > div').forEach(div => {
      div.removeAttribute('style');
      div.parentElement.removeAttribute('style');
    });
    admaxSectionElement.querySelectorAll(':scope > div').forEach(div => {
      div.removeAttribute('style');
      div.setAttribute('style', 'max-width: 100%;')
    });
    admaxSectionElement.querySelectorAll(':scope > div > iframe').forEach(iframe => {
      iframe.removeAttribute('style');
      iframe.setAttribute('style', 'max-width: 100%;')
    });
  }
}
