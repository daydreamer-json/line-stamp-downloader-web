import backendApi from '../utils/api.js';

window.addEventListener('DOMContentLoaded', async () => {
  const productId = getUrlQueryParams().id || '';
  if (productId === '') {
    productNotFoundFunc();
    return;
  };

  try {
    const productMetaRsp = await backendApi.getMetaEmoji(productId, 'ios');
    const productMetaWebRsp = await backendApi.getMetaWebEmoji(productId, 'ja');

    console.log(productMetaRsp);
    console.log(productMetaWebRsp);

    buildInfoHtml(productMetaRsp, productMetaWebRsp);
    document.getElementById('productInfo_downloadZipButton').addEventListener('click', () => {
      window.open(`${backendApi.API_BASE_URL}/api/download/emoji/zip/${productMetaRsp.productId}` + ((productMetaRsp.sticonResourceType === 'STATIC') || !('sticonResourceType' in productMetaRsp) ? '?is_static=true' : ''), '_blank');
    });
    buildEmojiListHtml(productMetaRsp, productMetaWebRsp);

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
  document.getElementById('productInfo_bigTitle').textContent = productMetaWebRsp.name;
  document.getElementById('productInfo_description').textContent = productMetaWebRsp.description;
  document.getElementById('productInfo_mainThumb').src = `${backendApi.API_BASE_URL}/api/download/emoji/thumb/${productMetaRsp.productId}`;
  document.getElementById('productInfo_tableWrapper').innerHTML = `
    <table class="align-middle text-nowrap table table-sm w-auto my-0">
      <tbody>
        <tr><th>Product ID</th><td colspan="2">${productMetaRsp.productId}</td></tr>
        <tr><th>Resource type</th><td colspan="2">${'sticonResourceType' in productMetaRsp ? productMetaRsp.sticonResourceType : 'STATIC'}</td></tr>
        <tr><th>On sale</th><td colspan="2">${productMetaRsp.onSale ? 'Yes' : 'No'}</td></tr>
        <tr><th>Valid days</th><td colspan="2">${productMetaRsp.validDays || 'Permanent'}</td></tr>
      </tbody>
    </table>
  `;
}

function buildEmojiListHtml(productMetaRsp, productMetaWebRsp) {
  const convertToGif = false;
  // productMetaRsp.stickers.forEach(stickerObj => {
  //   document.getElementById('listOfStickers_container').insertAdjacentHTML('beforeend', `
  //     <div class="col"><img id="listOfStickers_sticker_${stickerObj.id}" data-id="${stickerObj.id}" class="img-fluid rounded border border-1" src="${backendApi.API_BASE_URL}/api/download/sticker/single/${stickerObj.id}?gif=${convertToGif}&is_static=${productMetaRsp.hasAnimation === false}" /></div>
  //   `);
  //   document.getElementById(`listOfStickers_sticker_${stickerObj.id}`).addEventListener('click', () => {
  //     stickerSingleModalInitialize(stickerObj.id, productMetaRsp.hasAnimation, productMetaRsp.hasSound);
  //   });
  // })
  const suggestedResourceType = 'sticonResourceType' in productMetaRsp ? productMetaRsp.sticonResourceType : 'STATIC';
  productMetaRsp.orders.forEach(iconIndexId => {
    document.getElementById('listOfEmojis_container').insertAdjacentHTML('beforeend', `
      <div class="col"><img id="listOfEmojis_emoji_${productMetaRsp.productId}_${iconIndexId}" data-pid="${productMetaRsp.productId}" data-id="${iconIndexId}" class="img-fluid rounded border border-1" src="${backendApi.API_BASE_URL}/api/download/emoji/single/${productMetaRsp.productId}/${iconIndexId}?gif=${convertToGif}&is_static=${suggestedResourceType === 'STATIC'}" /></div>
    `);
    document.getElementById(`listOfEmojis_emoji_${productMetaRsp.productId}_${iconIndexId}`).addEventListener('click', () => {
      emojiSingleModalInitialize(iconIndexId, productMetaRsp.productId, suggestedResourceType !== 'STATIC');
    });
  });
}

function emojiSingleModalInitialize(emojiIndexId, productId, hasAnimation) {
  const modal = new bootstrap.Modal(document.getElementById('emojiSingle_modal'));
  const modalTitleEl = document.getElementById('emojiSingle_modal_title');
  const modalBodyEl = document.getElementById('emojiSingle_modal_body');
  const modalCloseBtnEl = document.getElementById('emojiSingle_modal_close');

  modalCloseBtnEl.addEventListener('click', async () => {
    await emojiSingleModalDestroy(modal);
  });
  modalTitleEl.textContent = `Emoji #${emojiIndexId}`;
  modalBodyEl.innerHTML = ''; // clear html before build element

  modalBodyEl.innerHTML = `
    ${(() => {
      if (hasAnimation === true) {
        return `
          <h5 class="mt-0">Animated, APNG</h5>
          <div class="text-center"><img class="img-fluid rounded border border-1" src="${backendApi.API_BASE_URL}/api/download/emoji/single/${productId}/${emojiIndexId}?gif=false&is_static=false" /></div>
          <hr class="my-4" />
          <h5 class="mt-0">Animated, GIF</h5>
          <div class="text-center"><img class="img-fluid rounded border border-1" src="${backendApi.API_BASE_URL}/api/download/emoji/single/${productId}/${emojiIndexId}?gif=true&is_static=false" /></div>
          <hr class="my-4" />
        `
      } else { return '' }
    })()}
    <h5 class="mt-0">Static, PNG</h5>
    <div class="text-center"><img class="img-fluid rounded border border-1" src="${backendApi.API_BASE_URL}/api/download/emoji/single/${productId}/${emojiIndexId}?gif=false&is_static=true" /></div>
    
  `

  modal.show();
}

async function emojiSingleModalDestroy(modal) {
  const clonedCloseBtn = document.getElementById('emojiSingle_modal_close').cloneNode(true);
  document.getElementById('emojiSingle_modal_close').replaceWith(clonedCloseBtn);
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
