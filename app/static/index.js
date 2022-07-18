const ws = new WebSocket("ws://localhost:8080/ws/controller", "echo-protocol");
const inputForm = document.getElementById("inputForm");
const queue = document.getElementById("queue");
const volDn = document.getElementById('volDn');
const volUp = document.getElementById('volUp');

const enqueueForm = document.getElementById('enqueueForm');

function displayQueue(songs) {
    while(queue.firstChild) {
        queue.removeChild(queue.firstChild);
    }
    for(const song of songs) {
        const queueItem = document.createElement('li');
        const content = document.createTextNode(song);
        queueItem.className = 'list-group-item';
        queueItem.appendChild(content);
        queue.appendChild(queueItem);
    }
}

function displayState(state){
    console.log(state);
    const volume = document.getElementById('volume');
    // volume.appendChild(
    //     document.createTextNode(`${state['vol']}`)
    // );
    volume.innerText = `${state['vol']}`
    displayQueue(state['queue']);
}

ws.onmessage = function(event) {

    try {
        const state = JSON.parse(event.data);
        displayState(state);
    } catch {
        console.log('not json');
    }
};
function sendMessage(event,cmd) {
    event.preventDefault();
    ws.send(JSON.stringify(cmd));
}

volDn.addEventListener('click',(event) => {sendMessage(event,{'cmd':'VOL_DN'})});
volUp.addEventListener('click',(event) => {sendMessage(event,{'cmd':'VOL_UP'})});

function sendEnqueue(event) {
    event.preventDefault();
    enqueueId = document.getElementById('enqueueId').value;
    sendMessage(event,{'cmd':'ENQUEUE','song':enqueueId});
}
enqueueForm.addEventListener('submit',sendEnqueue);

function sendResorting(event) {
    // ws.send(`move ${event.oldIndex} to ${event.newIndex}`);
    sendMessage(event,{
        'cmd':'QSHIFT',
        'song':event.item.innerText,
        'idx':event.newIndex
    })
}

Sortable.create(queue, {
    animation: 100, 
    group: 'queue', 
    draggable: '.list-group-item', 
    handle: '.list-group-item', 
    sort: true, 
    filter: '.sortable-disabled',
    onSort: sendResorting, 
    chosenClass: 'active',
});