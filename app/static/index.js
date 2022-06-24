const ws = new WebSocket("ws://localhost:8080/ws/controller", "echo-protocol");
const inputForm = document.getElementById("inputForm");

ws.onmessage = function(event) {
    var messages = document.getElementById('messages')
    var message = document.createElement('li')
    var content = document.createTextNode(event.data)
    message.appendChild(content)
    messages.appendChild(message)
};
function sendMessage(event) {
    event.preventDefault();
    var input = document.getElementById("messageText")
    ws.send(input.value)
    input.value = ''
    event.preventDefault()
}
inputForm.addEventListener('submit',sendMessage);
// inputForm.onsubmit(sendMessage);
