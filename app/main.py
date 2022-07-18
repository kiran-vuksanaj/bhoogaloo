from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import json

app = FastAPI()

# @app.get("/")
# async def home():
#     data = {
#         "text":"hi"
#         }
#     return {"data":data}

INITIAL_VOLUME = 20

class Song:
    def __init__(self,obj):
        self.id = obj.id
        self.start = obj.start
        self.end = obj.end

class PlayerState:
    def __init__(self):
        self.vol = INITIAL_VOLUME
        self.queue = []
    
    def update_state(self,json_cmd):
        cmd_type = json_cmd['cmd']
        CMD_MAP = {
            'VOL_UP': self.vol_up,
            'VOL_DN': self.vol_dn,
            'MUTE': self.mute,
            'ENQUEUE': self.enqueue,
            'QSHIFT': self.qshift
        }
        CMD_MAP[cmd_type](json_cmd)

    # COMMAND EXECUTIONS    
    
    def vol_up(self,cmd):
        self.vol += 5
    
    def vol_dn(self,cmd):
        self.vol -= 5
    
    def mute(self,cmd):
        self.vol = 0

    def enqueue(self,cmd):
        new_song = cmd['song']
        self.queue.append(new_song)

    def qshift(self,cmd):
        song = cmd['song']
        idx = cmd['idx']
        self.queue.remove(song)
        self.queue.insert(idx,song)

    def to_json(self):
        return json.dumps({
            'vol':self.vol,
            'queue':self.queue
        })

class SocketBoard:
    def __init__(self):
        self.state = PlayerState()
        self.connections = []
    
    async def send_state(self,websocket):
        print('sending state')
        await websocket.send_text(self.state.to_json())

    async def connect(self,websocket):
        self.connections.append(websocket)
        await self.send_state(websocket)
        return True
    
    def disconnect(self,websocket):
        self.connections.remove(websocket)
        return True

    async def update_state(self,cmd):
        try:
            self.state.update_state(json.loads(cmd))
            for websocket in self.connections:
                await self.send_state(websocket)
            return True
        except:
            return False


socketboard = SocketBoard()


app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
async def get():
    return FileResponse("app/static/index.html")


@app.websocket("/ws/controller")
async def websocket_client(websocket: WebSocket):
    print('hi')
    await websocket.accept()
    
    await socketboard.connect(websocket)

    try:
        while True:
            cmd = await websocket.receive_text()
            successful_update = await socketboard.update_state(cmd)
            if not successful_update:
                websocket.send_text
    except WebSocketDisconnect:
        await socketboard.disconnect(websocket)
