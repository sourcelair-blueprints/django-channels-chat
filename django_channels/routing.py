from channels.routing import route


channel_routing = [
    route('websocket.receive', 'chat.consumers.ws_echo'),
]
