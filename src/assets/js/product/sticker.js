import backendApi from '../utils/api.js';

window.addEventListener('DOMContentLoaded', async () => {
  const productId = getUrlQueryParams().id || -1;
  if (productId < 0) return;

  const productMetaRsp = await backendApi.getMetaSticker(productId, 'ios');
  const productMetaWebRsp = await backendApi.getMetaWebSticker(productId, 'ja');

  console.log(productMetaRsp);
  console.log(productMetaWebRsp);

  buildInfoHtml(productMetaRsp, productMetaWebRsp);
  document.getElementById('productInfo_downloadZipButton').addEventListener('click', () => {
    window.open(`${backendApi.API_BASE_URL}/api/download/sticker/zip/${productMetaRsp.packageId}`, '_blank');
  });
  buildStickerListHtml(productMetaRsp, productMetaWebRsp);

  (() => {
    document.getElementById('mainLoadingContainer').classList.add('d-none');
    document.getElementById('mainInnerContainer').classList.remove('d-none');
  })()
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
    `)
  })

}

function getUrlQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const urlQueryParams = {};
  params.forEach((value, key) => {
    urlQueryParams[key] = value;
  });
  return urlQueryParams;
}
