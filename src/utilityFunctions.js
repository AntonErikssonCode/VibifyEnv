function normalize(min, max) {
  var delta = max - min;
  return function (val) {
    return (val - min) / delta;
  };
}

function hslToHex(h, s, l, regularFormat = true ) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  if(regularFormat){
    return `#${f(0)}${f(8)}${f(4)}`;


  }
  else{
    return `0x${f(0)}${f(8)}${f(4)}`;


  }
}

export { normalize, hslToHex };
