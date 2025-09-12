import ky from 'https://cdn.jsdelivr.net/npm/ky/+esm';

const API_BASE_URL = 'https://daydreamer-json-line-stamp-api-proxy.hf.space';

export default {
  API_BASE_URL: API_BASE_URL,
  getSearchResult: async (category, type, query, offset, limit = 50, lang = 'ja') => {
    // validation
    if (['sticker', 'emoji', 'theme', 'family'].includes(category) === false) throw new Error(`category must be: 'sticker', 'emoji', 'theme', 'family'`);
    if (['ALL', 'OFFICIAL', 'CREATORS', 'SUBSCRIPTION'].includes(type) === false) throw new Error(`type must be: 'ALL', 'OFFICIAL', 'CREATORS', 'SUBSCRIPTION'`);
    if (query.length === 0) throw new Error('query length must be >=1');
    if (parseInt(offset) === NaN || parseInt(offset) < 0) throw new Error(`offset is invalid`);
    if (parseInt(limit) === NaN || parseInt(limit) <= 0) throw new Error(`limit is invalid`);
    if (lang.length === 0) throw new Error(`lang is invalid`);

    const rsp = await ky.get(`${API_BASE_URL}/api/search`, {
      searchParams: { category, type, query, offset: parseInt(offset), limit: parseInt(limit) }
    }).json();
    return rsp;
  },
  getMetaWebSticker: async (id, lang = 'ja') => {
    const rsp = await ky.get(`${API_BASE_URL}/api/meta_web/sticker/${id}`, {
      searchParams: { lang }
    }).json();
    return rsp;
  },
  getMetaWebEmoji: async (id, lang = 'ja') => {
    const rsp = await ky.get(`${API_BASE_URL}/api/meta_web/emoji/${id}`, {
      searchParams: { lang }
    }).json();
    return rsp;
  },
  getMetaSticker: async (id, deviceType = 'ios') => {
    const validDeviceTypes = ['ios', 'android', 'pc'];
    const rsp = await ky.get(`${API_BASE_URL}/api/meta/sticker/${id}`, {
      searchParams: { device_type: deviceType }
    }).json();
    return rsp;
  },
  getMetaEmoji: async (id, deviceType = 'ios') => {
    const validDeviceTypes = ['ios', 'android'];
    const rsp = await ky.get(`${API_BASE_URL}/api/meta/emoji/${id}`, {
      searchParams: { device_type: deviceType }
    }).json();
    return rsp;
  }
}
