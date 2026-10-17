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
  const signUpMessage = document.getElementById("signUpMessage");
  if (!Username_required() || !Password_required()) return;

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const accounts = JSON.parse(localStorage.getItem("accounts") || "{}");

  if (Object.prototype.hasOwnProperty.call(accounts, username)) {
    showFormMessage(signUpMessage, "This username already exists.");
    return;
  }

  accounts[username] = { password };
  localStorage.setItem("accounts", JSON.stringify(accounts));
  showFormMessage(signUpMessage, "Account created successfully. You can now log in.", "success");
}

function Login() {
  const username = document.getElementById("NAMEtextLog").value.trim();
  const password = document.getElementById("PASSWORDtextLog").value;
  const loginError = document.getElementById("loginError");
  const accounts = JSON.parse(localStorage.getItem("accounts") || "{}");

  if (!Object.prototype.hasOwnProperty.call(accounts, username) ||
      accounts[username].password !== password) {
    loginError.textContent = "Incorrect username or password. Please try again.";
    loginError.hidden = false;
    document.getElementById("PASSWORDtextLog").focus();
    return;
  }

  loginError.hidden = true;
  loginError.textContent = "";
  localStorage.setItem("currentTeacher", username);
  window.location.href = "dashboard.html";
}

function showFormMessage(messageElement, message, type = "error") {
  messageElement.textContent = message;
  messageElement.dataset.type = type;
  messageElement.hidden = false;
}

document.getElementById("form").addEventListener("input", function () {
  const signUpMessage = document.getElementById("signUpMessage");
  signUpMessage.hidden = true;
  signUpMessage.textContent = "";
});

document.getElementById("formLog").addEventListener("input", function () {
  const loginError = document.getElementById("loginError");
  loginError.hidden = true;
  loginError.textContent = "";
});

function Username_required() {
   const usernameInput = document.getElementById("username");
   if (usernameInput.value === ""|| usernameInput.value.length <= 4) {
         usernameInput.style.setProperty('--input-focus-color', '#ff0000');
         usernameInput.focus();
         usernameInput.select();
         showFormMessage(
           document.getElementById("signUpMessage"),
           "Username is required and must be at least 5 characters long."
         );
        return false;
    }
    return true;
}
function Password_required() {
   const passwordInput = document.getElementById("password");
   if (passwordInput.value.length < 8) {
     passwordInput.style.setProperty("--input-focus-color", "#ff0000");
     passwordInput.focus();
     showFormMessage(
       document.getElementById("signUpMessage"),
       "Password must be at least 8 characters long."
     );
     return false;
    }
    return true;
}
