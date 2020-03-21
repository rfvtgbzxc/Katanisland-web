"""blog URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from game import views

from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.init),#基础页面自动前往login.html
    path('login/', views.gotoLogin),
    path('regist/',views.gotoRegist),
    path('hall/',views.gotoHome),
    path('logout/',views.logout),
    path('room/',views.gotoRoom),
    path('test/',views.gotoTest),
    path('maptest/',views.gotoMapTest),
    path('gametest/',views.gotoGameTest),
    path('gamerelease/',views.gotoGameRelease),
    path('websocket_test/',views.gotoWebsocketTest),
    path('ajax/get_room_info/',views.getRoomInfo),
    path('ajax/create_room/',views.createRoom),
    path('ajax/ready_to_start/',views.check_members),
    path('ajax/t_create_map/',views.t_createMap),
    path('ajax/t_create_room/',views.t_createRoom),
    path('ajax/t_load_game/',views.t_load_game),
    path('ajax/t_update_game_info/',views.t_update_game_info),
    path('ajax/t_update_initial_game_info/',views.t_update_initial_game_info),
    path('ajax/t_virtual_websocket/',views.t_virtual_websocket),
    path('ajax/websocket_test_give_delay/',views.websocketTest_delay),
    path('ajax/request_room_state/',views.getRoomInfo), 
    #path('websocket/',views.websoketest),
    #path('ajax/regist',views.giveRegist),
]+static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
