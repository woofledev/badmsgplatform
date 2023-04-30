var roomid = document.getElementById("roomid").innerText;
var socket = io();
$(() => {
    $("#send").click(()=>{
        sendMessage({name: $("#name").val(), message: $("#message").val(), pfpuri: localStorage.getItem("pfpurl"), room_id: roomid});
    })

    getMessages()
})

socket.on(roomid, addMessages);

function addMessages(message){
  console.log("added messages")
  const converter = new showdown.Converter();
  const htmlContent = twemoji.parse(converter.makeHtml(message.message), { folder: 'svg', ext:'.svg' });
  const messageDiv = $('<div>').attr('id', 'message-' + 'box').addClass('msg')
    .append($('<img>').attr({"src": message.pfpuri, "class": "pfp"}))
    .append($('<h4>').text(message.name))
    .append($('<pre>').html(htmlContent))
  $('#messages').append(messageDiv).append($('<hr>'));
  var links = document.querySelectorAll('a');
  links.forEach(link => {
    link.setAttribute('target', '_blank');
  });
  $('#messages').scrollTop($('#messages')[0].scrollHeight);
}

function getMessages(){
  console.log("getted messages")
  $.get(location.origin+'/messages?room_id='+roomid, (data) => {
    data.forEach(addMessages);
  });
}
function sendMessage(message){
  console.log("sendde messages")
  pfpurl=localStorage.getItem("pfpurl")
  if(!message.pfpuri){message.pfpuri='';}
  if(pfpurl.value===""){
    $.post(location.origin+'/messages/', message, () => {
      $("#message").val('');
      $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });
  } else {
    $.post(location.origin+'/messages/', message, () => {
      $("#message").val('');
      $('#messages').scrollTop($('#messages')[0].scrollHeight);
    });
  }}

$('#logout').click(() => {
$.get('/logout', () => {
window.location.href = '/login';
});
});
var settingsExists = false;
function App_Functions_ToggleSettingsDiv(){
  var settingsDiv = document.querySelector('.settings-div')
  if (settingsDiv){
    settingsDiv.remove()
    return;
  }
  const newDiv = document.createElement('div');
  newDiv.classList.add('settings-div');
  newDiv.style.position = 'fixed';
  newDiv.style.top = '50%';
  newDiv.style.left = '50%';
  newDiv.style.transform = 'translate(-50%, -50%)';
  newDiv.style.padding = '140px';
  newDiv.style.borderRadius = '10px';
  newDiv.style.outline="solid 2px";
  newDiv.style.outlineColor="#808080"
  newDiv.style.backgroundColor = '#000000';
  newDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
  newDiv.innerHTML = `
    <h3 id="divtext">Settings</h3>
    <br>
    <input type="url" id="settings_input_pfp" placeholder="your pfp url">
    <br>
    <input type="checkbox"> <text id="divtext">enable images <strong>(DANGEROUS)</strong></text>
  `;
  document.body.appendChild(newDiv);
}

var messageInput = document.getElementById('message');
messageInput.addEventListener('keydown', function(event) {
  if (event.keyCode === 13 && !event.shiftKey) { // Enter key without Shift
    if(messageInput.value===''){
      alert('whitespace moment LAUGH AT THIS PERSON!!!1!')
    } else {
      event.preventDefault(); // Prevent default form submit
      document.getElementById('send').click();
    }
  } else if (event.keyCode === 13 && event.shiftKey) { // Enter key with Shift
    messageInput.value += ' '; // Add new line
  }
});
document.addEventListener('DOMNodeInserted', function(event) {
  if (event.target.classList.contains('settings-div')) {
    settingsExists = true;
    // Add event listener to input field
    var settingsInputPfp = document.getElementById("settings_input_pfp");
    settingsInputPfp.value = localStorage.getItem("pfpurl")
    settingsInputPfp.addEventListener("change", function() {
      console.log("changed input valueeeeee")
      localStorage.setItem("pfpurl", settingsInputPfp.value);
    });
  }
});
document.addEventListener('DOMNodeRemoved', function(event) {
  if (event.target.classList.contains('settings-div')) {
    settingsExists = false;
  }
});
function DANGEROUS_ONLYIFYOUKNOWWHATYOUREDOING_DIRV(){
  g = confirm('THIS WILL ENABLE PEOPLE TO SEE YOUR LOCATION/IP ADDRESS.\n\nOnly press "OK" if you know what you\'re doing.')
  if (g){
    localStorage.setItem("DANGEROUS_ONLYIFYOUKNOWWHATYOUREDOING_IMGSHOW", "true")
    location.reload()
  } else {
    localStorage.setItem("DANGEROUS_ONLYIFYOUKNOWWHATYOUREDOING_IMGSHOW", "false")
  }
}