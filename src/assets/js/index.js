import ky from 'https://cdn.jsdelivr.net/npm/ky/+esm';
import { DateTime, Duration } from 'https://cdn.jsdelivr.net/npm/luxon@3.5/+esm';
import backendApi from './utils/api.js';
import mathUtils from './utils/mathUtils.js';

await (async () => {
  // 検索系の処理

  const PAGENATION_LIMIT = 30;
  const searchButton = document.getElementById('searchSection_searchButton');
  let currentPage = 1;
  let totalPages = 1;
  let currentQuery = '';
  let currentCategory = '';
  let currentType = '';

  // ページネーションUIの要素
  const paginationRoot = document.getElementById('searchSection_pagenation_root');
  const paginationBack = document.getElementById('searchSection_pagenation_back');
  const paginationNext = document.getElementById('searchSection_pagenation_next');
  const paginationStart = document.getElementById('searchSection_pagenation_start');
  const paginationEnd = document.getElementById('searchSection_pagenation_end');

  function generatePageNumbers() {
    // 既存のページ番号を削除
    const existingPages = paginationRoot.querySelectorAll('.page-number');
    existingPages.forEach(page => page.remove());

    // 現在のページを中心とした前後5ページを表示
    const startPage = Math.max(1, currentPage - 5);
    const endPage = Math.min(totalPages, currentPage + 5);

    const fragment = document.createDocumentFragment();

    for (let page = startPage; page <= endPage; page++) {
      const li = document.createElement('li');
      li.className = `page-item page-number ${page === currentPage ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" data-page="${page}">${page}</a>`;
      fragment.appendChild(li);
    }

    // 次へボタンの前に挿入
    paginationNext.before(...fragment.children);
  }

  function updatePaginationUI() {
    // 前へ/次へボタンの有効化/無効化
    if (currentPage <= 1) {
      paginationBack.classList.add('disabled');
      paginationStart.classList.add('disabled');
    } else {
      paginationBack.classList.remove('disabled');
      paginationStart.classList.remove('disabled');
    }

    if (currentPage >= totalPages) {
      paginationNext.classList.add('disabled');
      paginationEnd.classList.add('disabled');
    } else {
      paginationNext.classList.remove('disabled');
      paginationEnd.classList.remove('disabled');
    }

    generatePageNumbers();
  }

  async function searchFunc(offset = 0, isPagination = false) {
    if (document.getElementById('searchSection_textBox').value.trim().length === 0) return;

    if (!isPagination) {
      searchButton.disabled = true; // 検索ボタンの場合のみロック
      currentPage = 1;
      paginationRoot.parentNode.classList.remove('d-none');
    }

    const params = {
      category: document.getElementById('searchSection_categorySelect').value,
      type: document.getElementById('searchSection_typeSelect').value,
      query: document.getElementById('searchSection_textBox').value,
      offset: offset,
      limit: PAGENATION_LIMIT,
      lang: 'ja'
    };

    // 現在のクエリ情報を保存
    currentQuery = params.query;
    currentCategory = params.category;
    currentType = params.type;

    try {
      const rsp = await backendApi.getSearchResult(...Object.values(params));
      console.log(rsp)
      document.getElementById('searchSection_resultCardContainer').innerHTML = '';

      if (rsp.items && rsp.items.length > 0) {
        rsp.items.forEach(el => {
          document.getElementById('searchSection_resultCardContainer').insertAdjacentHTML('beforeend', `<div class="col"><div class="card"><img src="${backendApi.API_BASE_URL}/api/download/${currentCategory}/thumb/${el.id}" class="card-img-top" /><div class="card-body"><p class="card-text">${el.title}</p></div></div></div>`);
        });

        // totalPagesを計算 (total_countがあれば使用、なければ推定)
        totalPages = rsp.totalCount ? Math.ceil(rsp.totalCount / PAGENATION_LIMIT) : Math.max(1, totalPages);
        if (rsp.items.length < PAGENATION_LIMIT) {
          totalPages = currentPage; // あまりない場合、現在のページまで
        }
      } else {
        totalPages = 1;
      }
    } catch (error) {
      console.error('Search error:', error);
      totalPages = 1;
    }

    updatePaginationUI();
    searchButton.disabled = false;
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    const offset = (currentPage - 1) * PAGENATION_LIMIT;
    searchFunc(offset, true);
  }

  // イベントリスナー
  searchButton.addEventListener('click', () => searchFunc());

  paginationBack.addEventListener('click', () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  });

  paginationNext.addEventListener('click', () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  });

  paginationStart.addEventListener('click', () => goToPage(1));

  paginationEnd.addEventListener('click', () => goToPage(totalPages));

  // ページ番号クリックイベント（イベントデリゲーション）
  paginationRoot.addEventListener('click', (event) => {
    const pageLink = event.target.closest('.page-link[data-page]');
    if (pageLink && !pageLink.closest('.page-item').classList.contains('disabled')) {
      event.preventDefault();
      const page = parseInt(pageLink.dataset.page);
      if (page !== currentPage) {
        goToPage(page);
      }
    }
  });

  // 初期設定
  updatePaginationUI();
})();

// To-Do: A-ADS, Ninja Admax
