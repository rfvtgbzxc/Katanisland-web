# mysite/routing.py
from django.urls import path
from django.conf.urls import url
from . import consumer as consumers


websocket_urlpatterns = [
	path('chat/',consumers.ChatConsumer),
	url(r'^ws/room/(?P<room_id>[^/]+)/$',consumers.RoomReady),
]