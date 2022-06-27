const ws = new WebSocket("ws://localhost:8080/ws/controller", "echo-protocol");
const inputForm = document.getElementById("inputForm");
const messages = document.getElementById("messages");

ws.onmessage = function(event) {
    var messages = document.getElementById('messages')
    var message = document.createElement('li')
    var content = document.createTextNode(event.data)
    message.className = 'list-group-item';
    console.log(message);
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

function sendResorting(event) {
    ws.send(`move ${event.oldIndex} to ${event.newIndex}`);
}

Sortable.create(messages, {
    animation: 100, 
    group: 'messages', 
    draggable: '.list-group-item', 
    handle: '.list-group-item', 
    sort: true, 
    filter: '.sortable-disabled',
    onSort: sendResorting, 
    chosenClass: 'active',
});