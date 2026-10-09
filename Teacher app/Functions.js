const signInWindow = document.getElementById("window");
var textName = "";
var textPassword = "";

drag(signInWindow);
function drag(element) { //this function was coppied from another of my projects 
  const bar = element.querySelector(".logo")
  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;
  bar.addEventListener("mousedown", startDragging);

  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY; 
    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
  }

  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;
    element.style.top = (element.offsetTop - currentY) + "px";
    element.style.left = (element.offsetLeft - currentX) + "px";
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }




}
function SaveInfo(){
  if (Username_required() == false ) {return;}
	if (Password_required() == false ) {return;}
	textName = document.getElementById("username").value.trim();
	textPassword = document.getElementById("password").value.trim();
  console.log("Username: " + textName);
  console.log("Password: " + textPassword);
  document.body.style.backgroundImage = "linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url('./Bonnie.jpg')";
	 signInWindow.style.display = "none";
}

function Username_required() {
   const usernameInput = document.getElementById("username");
   if (usernameInput.value === ""|| usernameInput.value.length <= 4) {
         usernameInput.style.setProperty('--input-focus-color', '#ff0000')
         usernameInput.focus();
         usernameInput.select()
         alert("Username is required and must be at least 5 characters long.");
        return false;
    }
    return true;
}
function Password_required() {
   const passwordInput = document.getElementById("password");
   const value = passwordInput.value.trim();
   if (value === "" || !Number.isFinite(Number(value))|| passwordInput.value.length < 8) {
     passwordInput.style.setProperty("--input-focus-color", "#ff0000");
     passwordInput.focus();
     alert("Password is required and must be a number with at least 8 characters.");
     return false;
    }
    return true;
}
