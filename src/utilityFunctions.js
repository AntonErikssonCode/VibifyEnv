function normalize(min, max) {
  var delta = max - min;
  return function (val) {
    return (val - min) / delta;
  };
}

function hslToHex(h, s, l, regularFormat = true) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  if (regularFormat) {
    return `#${f(0)}${f(8)}${f(4)}`;
  } else {
    return `0x${f(0)}${f(8)}${f(4)}`;
  }
}

function hex2(c) {
  c = Math.round(c);
  if (c < 0) c = 0;
  if (c > 255) c = 255;

  var s = c.toString(16);
  if (s.length < 2) s = "0" + s;

  return s;
}

function color(r, g, b) {
  return "#" + hex2(r) + hex2(g) + hex2(b);
}

function shade(col, light) {
  var r = parseInt(col.substr(1, 2), 16);
  var g = parseInt(col.substr(3, 2), 16);
  var b = parseInt(col.substr(5, 2), 16);

  if (light < 0) {
    r = (1 + light) * r;
    g = (1 + light) * g;
    b = (1 + light) * b;
  } else {
    r = (1 - light) * r + light * 255;
    g = (1 - light) * g + light * 255;
    b = (1 - light) * b + light * 255;
  }

  return color(r, g, b);
}

function colorToHexColor(color) {
  if (arguments.length == 1) {
    let withoutHash = color.substring(1);
    return "0x" + withoutHash;
  }
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calculateAverageOfArray(array) {
  const average = array.reduce((p, c) => p + c, 0) / array.length;
  return average;
}

function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

function throttle(cb, delay = 500) {
  let shouldWait = false;
  let waitingArgs;
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false;
    } else {
      cb(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFunc, delay);
    }
  };

  return (...args) => {
    if (shouldWait) {
      waitingArgs = args;
      return;
    }

    cb(...args);
    shouldWait = true;
    setTimeout(timeoutFunc, delay);
  };
}

function debounce(func, wait, immediate) {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;

    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    var callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

export {
  normalize,
  hslToHex,
  shade,
  colorToHexColor,
  getRndInteger,
  calculateAverageOfArray,
  sliceIntoChunks,
  throttle,
  debounce,
};
