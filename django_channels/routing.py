from channels.routing import route


channel_routing = [
    route('websocket.receive', 'chat.consumers.ws_echo'),
    route('websocket.connect', 'chat.consumers.ws_add',
          path=r'^/chat/(?P<room>\w+)$'),
]
