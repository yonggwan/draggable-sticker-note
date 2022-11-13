const throttle = (callback, delay = 0) => {
  let timer = null;
  return function () {
    if (!timer) {
      timer = setTimeout(() => {
        callback(...arguments);
        timer = false;
      }, delay);
    }
  }
};
