import ky from 'https://cdn.jsdelivr.net/npm/ky/+esm';

function updateUiTheme() {
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light');
}

const adblockerDetectedMessage = `<section><h2>Ad blocker detected!</h2><p>Please disable your ad blocker and reload the page.</p></section>`;

window.addEventListener('DOMContentLoaded', async () => {
  updateUiTheme();
  await (async () => {
    const adblockerDetectResult = await detectAdBlocker();
    if (adblockerDetectResult === true && !(getUrlQueryParams().adblockDetect && getUrlQueryParams().adblockDetect === 'false')) document.getElementById('mainContainer').innerHTML = adblockerDetectedMessage;
  })();
});
window.addEventListener('load', () => {
  admaxOptimize();
  (() => {
    const adblockerDetectResult = detectAdBlockerByElementSize();
    if (adblockerDetectResult === true && !(getUrlQueryParams().adblockDetect && getUrlQueryParams().adblockDetect === 'false')) document.getElementById('mainContainer').innerHTML = adblockerDetectedMessage;
  })();
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

async function detectAdBlocker(url = 'https://adm.shinobi.jp/o/38f0bc01bfd6e18afca9fddd3ca6ba32') {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store"
    });
    return false;
  } catch (error) {
    return true;
  }
}

function detectAdBlockerByElementSize() {
  const admaxElement = document.getElementById('ads_admax');
  if (!admaxElement) {
    return false;
  }
  const height = admaxElement.offsetHeight;
  return height <= 5;
}

function getUrlQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const urlQueryParams = {};
  params.forEach((value, key) => {
    urlQueryParams[key] = value;
  });
  return urlQueryParams;
}
