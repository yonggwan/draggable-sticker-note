'use strict';

// ## constants ##
const MEMO_MIN_WIDTH = 200;
const MEMO_MIN_HEIGHT = 100;

class ZIndexManager {
  static _idx = 0;
  // z-index 자동증감값 반환
  static get zIndex () {
    return ++this._idx;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  /**
   * @description 새로운 Note Element를 반환
   * @param {MouseEvent} ev 이벤트객체
   * @return {HTMLElement}
   */
  function createNote (ev) {
    const template = document.getElementById('template');
    const cloneTemplate = document.importNode(template.content, true);
    const memo = cloneTemplate.querySelector('.memo');
    memo.style.zIndex = ZIndexManager.zIndex;
    memo.style.left = ev.pageX + 'px';
    memo.style.top = ev.pageY + 'px';
    return cloneTemplate;
  }

  function removeNote (ev) {
    ev.target.closest('.memo').remove();
  }
  
  // 우클릭으로 새로운 노트 생성
  document.oncontextmenu = (ev) => {
    ev.preventDefault();
    document.getElementById('wrap').appendChild(createNote(ev));
  }
  
  // 노트 삭제
  document.addEventListener('click', (ev) => {
    if (ev.target.className === 'btn_close') {
      removeNote(ev);
    }
  });
  
  // 드래그기능 및 리사이징 기능 분기처리
  document.addEventListener('mousedown', (ev) => {
    const memo = ev.target.closest('.memo');
    // zindex 상위로 끌어올림
    if (memo) {
      memo.style.zIndex = ZIndexManager.zIndex;
    }

    // 드래그기능 이벤트바인딩
    if (ev.target.className === 'header') {
      draggable(ev);
    }
    
    // 리사이즈 기능 이벤트바인딩
    if (ev.target.className === 'btn_size') {
      resizable(ev);
    }
  });
});

/**
 * @description 드래그 이벤트 바인더
 * @param {MouseEvent} ev 마우스이벤트 객체
 */
function draggable (ev) {
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
  document.addEventListener('mouseup', () => {
    document.removeEventListener('mousemove', handleDragStart)
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
function resizable (ev) {
  const textarea = ev.target.closest('.memo').querySelector('.textarea');
  const originalOffset = {
    width: textarea.offsetWidth,
    height: textarea.offsetHeight
  };
  const originalMouse = {
    x: ev.pageX,
    y: ev.pageY
  };
  document.addEventListener('mousemove', handleResizeStart);
  document.addEventListener('mouseup', () => document.removeEventListener('mousemove', handleResizeStart));
  function handleResizeStart (ev) {
    const newWidth = originalOffset.width + (ev.pageX - originalMouse.x);
    const newHeight = originalOffset.height + (ev.pageY - originalMouse.y);
    if (newWidth > MEMO_MIN_WIDTH) textarea.style.width = newWidth + 'px';
    if (newHeight > MEMO_MIN_HEIGHT) textarea.style.height = newHeight + 'px';
  }
}
