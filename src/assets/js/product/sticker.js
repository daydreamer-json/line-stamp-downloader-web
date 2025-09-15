import backendApi from '../utils/api.js';

window.addEventListener('DOMContentLoaded', async () => {
  const productId = getUrlQueryParams().id || -1;
  if (productId < 0) {
    productNotFoundFunc();
    return;
  };

  try {
    const productMetaRsp = await backendApi.getMetaSticker(productId, 'ios');
    const productMetaWebRsp = await backendApi.getMetaWebSticker(productId, 'ja');

    console.log(productMetaRsp);
    console.log(productMetaWebRsp);

    buildInfoHtml(productMetaRsp, productMetaWebRsp);
    document.getElementById('productInfo_downloadZipButton').addEventListener('click', () => {
      window.open(`${backendApi.API_BASE_URL}/api/download/sticker/zip/${productMetaRsp.packageId}` + (productMetaRsp.stickerResourceType === 'STATIC' ? '?is_static=true' : ''), '_blank');
    });
    buildStickerListHtml(productMetaRsp, productMetaWebRsp);

    (() => {
      document.getElementById('mainLoadingContainer').classList.add('d-none');
      document.getElementById('mainInnerContainer').classList.remove('d-none');
    })();

    // stickerSingleModalInitialize(350279022, false, true); // for debug
    // stickerSingleModalInitialize(23214968, true, false); // for debug
  } catch (error) {
    if (error.response && error.response.status === 404) {
      productNotFoundFunc();
      return;
    }
    // その他のエラーは再スロー
    throw error;
  }
});

function buildInfoHtml(productMetaRsp, productMetaWebRsp) {
  document.getElementById('productInfo_bigTitle').textContent = productMetaRsp.title.ja || productMetaRsp.title.en;
  document.getElementById('productInfo_description').textContent = productMetaWebRsp.description;
  document.getElementById('productInfo_mainThumb').src = `${backendApi.API_BASE_URL}/api/download/sticker/thumb/${productMetaRsp.packageId}`;
  document.getElementById('productInfo_tableWrapper').innerHTML = `
    <table class="align-middle text-nowrap table table-sm w-auto my-0">
      <tbody>
        <tr><th>Product ID</th><td colspan="2">${productMetaRsp.packageId}</td></tr>
        <tr><th>Resource type</th><td colspan="2">${productMetaRsp.stickerResourceType}</td></tr>
        <tr><th>On sale</th><td colspan="2">${productMetaRsp.onSale ? 'Yes' : 'No'}</td></tr>
        <tr><th>Valid days</th><td colspan="2">${productMetaRsp.validDays || 'Permanent'}</td></tr>
    ${(() => {
      const outArr = [];
      const allEqual = arr => arr.every(val => val === arr[0]);
      if (allEqual(Object.values(productMetaRsp.author))) return `<tr><th>Author</th><td colspan="2">${Object.values(productMetaRsp.author)[0]}</td></tr>`;
      for (let i = 0; i < Object.entries(productMetaRsp.author).length; i++) {
        const kv = Object.entries(productMetaRsp.author)[i];
        outArr.push(`<tr>${i === 0 ? `<th rowspan="${Object.entries(productMetaRsp.author).length}">Author</th>` : ''}<td>${(new Intl.DisplayNames(['en'], { type: 'language' })).of(kv[0])}</td><td>${kv[1]}</td></tr>`);
      }
      return outArr.join('');
    })()}
    ${(() => {
      const outArr = [];
      for (let i = 0; i < productMetaRsp.price.length; i++) {
        const obj = productMetaRsp.price[i];
        outArr.push(`<tr>${i === 0 ? `<th rowspan="${productMetaRsp.price.length}">Price</th>` : ''}<td>${obj.currency} (${obj.country !== '@@' ? (new Intl.DisplayNames(["en"], { type: "region" })).of(obj.country) : 'LINE'})</td><td class="text-end"><span class="font-monospace">${obj.symbol} ${obj.price}</span></td></tr>`);
      }
      return outArr.join('');
    })()}
      </tbody>
    </table>
  `;
}

function buildStickerListHtml(productMetaRsp, productMetaWebRsp) {
  const convertToGif = false;
  productMetaRsp.stickers.forEach(stickerObj => {
    document.getElementById('listOfStickers_container').insertAdjacentHTML('beforeend', `
      <div class="col"><img id="listOfStickers_sticker_${stickerObj.id}" data-id="${stickerObj.id}" class="img-fluid rounded border border-1" src="${backendApi.API_BASE_URL}/api/download/sticker/single/${stickerObj.id}?gif=${convertToGif}&is_static=${productMetaRsp.hasAnimation === false}" /></div>
    `);
    document.getElementById(`listOfStickers_sticker_${stickerObj.id}`).addEventListener('click', () => {
      stickerSingleModalInitialize(stickerObj.id, productMetaRsp.hasAnimation, productMetaRsp.hasSound);
    });
  })
}

function stickerSingleModalInitialize(stickerId, hasAnimation, hasSound) {
  const modal = new bootstrap.Modal(document.getElementById('stickerSingle_modal'));
  const modalTitleEl = document.getElementById('stickerSingle_modal_title');
  const modalBodyEl = document.getElementById('stickerSingle_modal_body');
  const modalCloseBtnEl = document.getElementById('stickerSingle_modal_close');

  modalCloseBtnEl.addEventListener('click', async () => {
    await stickerSingleModalDestroy(modal);
  });
  modalTitleEl.textContent = `Sticker #${stickerId}`;
  modalBodyEl.innerHTML = ''; // clear html before build element

  modalBodyEl.innerHTML = `
    ${(() => {
      if (hasAnimation === true) {
        return `
          <h5 class="mt-0">Animated, APNG</h5>
          <div class="text-center"><img class="img-fluid rounded border border-1" src="${backendApi.API_BASE_URL}/api/download/sticker/single/${stickerId}?gif=false&is_static=false" /></div>
          <hr class="my-4" />
          <h5 class="mt-0">Animated, GIF</h5>
          <div class="text-center"><img class="img-fluid rounded border border-1" src="${backendApi.API_BASE_URL}/api/download/sticker/single/${stickerId}?gif=true&is_static=false" /></div>
          <hr class="my-4" />
        `
      } else { return '' }
    })()}
    ${(() => {
      if (hasSound === true) {
        return `
          <h5 class="mt-0">Sound</h5>
          <div class="text-center align-items-center">
            <audio class="" controls preload="auto" src="${backendApi.API_BASE_URL}/api/download/sticker/sound/single/${stickerId}"></audio>
            <!-- <button
              id="stickerSingle_modal_audioPlay"
              class="btn btn-primary d-flex align-items-center justify-content-center"
            >
              Play
            </button> -->
          </div>
          <hr class="my-4" />
        `
      } else { return '' }
    })()}
    <h5 class="mt-0">Static, PNG</h5>
    <div class="text-center"><img class="img-fluid rounded border border-1" src="${backendApi.API_BASE_URL}/api/download/sticker/single/${stickerId}?gif=false&is_static=true" /></div>
  `

  modal.show();
}

async function stickerSingleModalDestroy(modal) {
  const clonedCloseBtn = document.getElementById('stickerSingle_modal_close').cloneNode(true);
  document.getElementById('stickerSingle_modal_close').replaceWith(clonedCloseBtn);
  modal.hide();
}

function getUrlQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const urlQueryParams = {};
  params.forEach((value, key) => {
    urlQueryParams[key] = value;
  });
  return urlQueryParams;
}

function productNotFoundFunc() {
  window.location.href = '../404.html';
}
