function hideShowDisplay() {
 /*  var x = document.getElementById("colors"); */
  var all = document.querySelectorAll(".hiddable");

  for (let index = 0; index < all.length; index++) {
    const x = all[index];
    console.log(x)
    if (x.style.visibility !== "visible") {
      x.style.visibility = "visible";
      console.dir("none")
    } else {
      x.style.visibility = "hidden";
      console.dir("block")
    }
    
  }
  console.dir(all)
 /*  if (x.style.display !== "none") {
    x.style.display = "none";
    console.dir("none")
  } else {
    x.style.display = "block";
    console.dir("block")
  } */
 
  
}
/* const hideButton  = document.getElementById("hideButton");

var timeout;
document.onmousemove = function(){
  clearTimeout(timeout);
  timeout = setTimeout(function(){alert("move your mouse");}, 600);
} */