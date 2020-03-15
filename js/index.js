'use strict';

// ## constants ##
const LOCAL_STORAGE_KEY = 'DRAGGABLE_STICKY_NOTES';
const MEMO_MIN_WIDTH = 200;
const MEMO_MIN_HEIGHT = 100;

class ZIndexManager {
  static _idx = 0;
  // z-index 자동증감값 반환
  static get zIndex () {
    return ++this._idx;
  }
};

const store = (container) => localStorage.setItem(LOCAL_STORAGE_KEY, container.innerHTML);
const setStoredValues = (container) => container.innerHTML = localStorage.getItem(LOCAL_STORAGE_KEY);

document.addEventListener('DOMContentLoaded', () => {
  const $wrap = document.getElementById('wrap');
  setStoredValues($wrap);

  /**
   * @description 새로운 Note Element를 반환
   * @param {MouseEvent} ev 이벤트객체
   * @return {HTMLElement}
   */
  const createNote = (ev) => {
    const $template = document.getElementById('template');
    const $cloneTemplate = document.importNode($template.content, true);
    const $memo = $cloneTemplate.querySelector('.memo');
    $memo.style.zIndex = ZIndexManager.zIndex;
    $memo.style.left = ev.pageX + 'px';
    $memo.style.top = ev.pageY + 'px';
    return $cloneTemplate;
  }

  const removeNote = (ev) => {
    ev.target.closest('.memo').remove();
    // store($wrap);
  };
  
  window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    store($wrap);
    e.returnValue = '';
  });

  // 우클릭으로 새로운 노트 생성
  document.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    $wrap.appendChild(createNote(ev));
    // store($wrap);
  });
  
  // 노트 삭제
  document.addEventListener('click', (ev) => {
    if (ev.target.className === 'btn_close') {
      removeNote(ev);
    }
  });

  document.addEventListener('keyup', throttle((ev) => {
    if (ev.target.className === 'textarea') {
      // 100ms 간격의 쓰로틀링을 통해 상태저장
      // store($wrap);
    }
  }, 100));
  
  // 드래그기능 및 리사이징 기능 분기처리
  document.addEventListener('mousedown', (ev) => {
    const memo = ev.target.closest('.memo');
    // zindex 상위로 끌어올림
    if (memo) {
      memo.style.zIndex = ZIndexManager.zIndex;
    }

    // 드래그기능 이벤트바인딩
    if (ev.target.className === 'header') {
      draggable(ev, {
        // onDragEnd: (ev) => store($wrap)
      });
    }
    
    // 리사이즈 기능 이벤트바인딩
    if (ev.target.className === 'btn_size') {
      resizable(ev, {
        // onResizeEnd: (ev) => store($wrap)
      });
    }
  });
});

/**
 * @description 드래그 이벤트 바인더
 * @param {MouseEvent} ev 마우스이벤트 객체
 */
function draggable (ev, { onDragEnd }) {
  const memo = ev.target.closest('.memo');
  const originalOffset = {
    x: memo.getBoundingClientRect().x,
    y: memo.getBoundingClientRect().y
  };
  const originalMouse = {
    x: ev.pageX,
    y: ev.pageY
  };

  document.addEventListener('mousemove', handleDragStart);
  document.addEventListener('mouseup', (mouseupEv) => {
    document.removeEventListener('mousemove', handleDragStart);
    onDragEnd && onDragEnd(mouseupEv);
  });
  function handleDragStart (ev) {
    const newX = originalOffset.x + (ev.pageX - originalMouse.x);
    const newY = originalOffset.y + (ev.pageY - originalMouse.y);
    memo.style.left = newX + 'px';
    memo.style.top = newY + 'px';
  }
}

/**
 * @description 리사이즈 이벤트 바인더
 * @param {MouseEvent} ev 마우스이벤트 객체
 */
function resizable (ev, { onResizeEnd }) {
  const $textarea = ev.target.closest('.memo').querySelector('.textarea');
  const originalOffset = {
    width: $textarea.offsetWidth,
    height: $textarea.offsetHeight
  };
  const originalMouse = {
    x: ev.pageX,
    y: ev.pageY
  };
  document.addEventListener('mousemove', handleResizeStart);
  document.addEventListener('mouseup', (mouseupEv) => {
    document.removeEventListener('mousemove', handleResizeStart);
    onResizeEnd && onResizeEnd(mouseupEv);
  });
  function handleResizeStart (ev) {
    const newWidth = originalOffset.width + (ev.pageX - originalMouse.x);
    const newHeight = originalOffset.height + (ev.pageY - originalMouse.y);
    if (newWidth > MEMO_MIN_WIDTH) $textarea.style.width = newWidth + 'px';
    if (newHeight > MEMO_MIN_HEIGHT) $textarea.style.height = newHeight + 'px';
  }
}
