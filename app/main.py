from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# @app.get("/")
# async def home():
#     data = {
#         "text":"hi"
#         }
#     return {"data":data}

class PlayerState:
    def __init__(self):
        self.n = 4
        self.connections = []
    
    def connect(self,websocket):
        self.connections.append(websocket)
        return True
    
    def disconnect(self,websocket):
        self.connections.remove(websocket)

    async def update_state(self,n):
        self.n = n
        for websocket in self.connections:
            await websocket.send_text(f'new n: {n}')
        return True


playerstate = PlayerState()


app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
async def get():
    return FileResponse("app/static/index.html")


@app.websocket("/ws/controller")
async def websocket_client(websocket: WebSocket):
    print('hi')
    await websocket.accept()
    
    playerstate.connect(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            await playerstate.update_state(data)
    except WebSocketDisconnect:
        await playerstate.disconnect(websocket)
