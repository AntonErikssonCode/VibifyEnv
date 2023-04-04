function hideShowDisplay() {
  var all = document.querySelectorAll(".hiddable");

  for (let index = 0; index < all.length; index++) {
    const x = all[index];
    console.log(x);
    if (x.style.visibility !== "visible") {
      x.style.visibility = "visible";
      console.dir("none");
    } else {
      x.style.visibility = "hidden";
      console.dir("block");
    }
  }
}
