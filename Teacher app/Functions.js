const signInWindow = document.getElementById("window");
const LoginWindow = document.getElementById("windowLog");
var textName = "";
var textPassword = "";

drag(signInWindow);
drag(LoginWindow);
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
function SaveInfo() {
  if (!Username_required() || !Password_required()) return;

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const accounts = JSON.parse(localStorage.getItem("accounts") || "{}");

  if (Object.prototype.hasOwnProperty.call(accounts, username)) {
    alert("This username already exists!");
    return;
  }

  accounts[username] = { password };
  localStorage.setItem("accounts", JSON.stringify(accounts));
  alert("Account saved!");
  signInWindow.style.display = "none";
}

function Login() {
  const username = document.getElementById("NAMEtextLog").value.trim();
  const password = document.getElementById("PASSWORDtextLog").value.trim();
  const accounts = JSON.parse(localStorage.getItem("accounts") || "{}");

  if (!Object.prototype.hasOwnProperty.call(accounts, username)) {
    alert("Username does not exist!");
    return;
  }

  if (accounts[username].password !== password) {
    alert("Incorrect password!");
    return;
  }

  window.location.href = "dashboard.html";
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
