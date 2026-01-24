/*
D:\QLDT-app\client\src\hooks\useMediaQuery.js
*/

import { useState, useEffect } from 'react';

/**
 * Custom hook để theo dõi sự thay đổi kích thước màn hình dựa trên một media query.
 * @param {string} query - Chuỗi media query (ví dụ: '(max-width: 768px)').
 * @returns {boolean} - Trả về true nếu query khớp, ngược lại là false.
 */
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => {
      setMatches(media.matches);
    };
    // Sửa lỗi: Sử dụng addEventListener và removeEventListener thay vì phương thức cũ
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export default useMediaQuery;