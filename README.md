# Katanisland-web
前端：Bootstrap+Jquery+大量纯js
后端：Django+Django-redis

由于采用了css新特性，对部分浏览器不兼容，已知有Edge。
使用Chrome上可以完美运行。

后续内容：
1.使用数据库思想重构
2.完善游戏界面
3.完善游戏体系
4.开发新模组和自定义模式
5.使用其他前端框架重构

一个可用的游戏地址：122.51.21.190/gametest


运行：
目前处于未完善状态，使用游戏入口测试进行游戏。

一、启动服务器
1.环境准备
安装好python（以及python的django、channels、channels-redis），下载redis。
2.配置服务器
将项目中的setting.py文件中的 CHANNEL_LAYERS的端口改为被注释的本地局域网（如果不是在本地测试，则设置为你开放端口的外网地址，如果不理解的话，还是就在本地测试吧）
将项目中的model_Debug文件中“以联机模式加载游戏”的函数中websocket地址设置为本地的ip地址
3.运行服务器
启动redis-server
cmd命令行进入项目目录，使用python manage.py runserver 0.0.0.0:80 命令运行manage.py文件并以此启动服务器。
二、建立游戏
1.检查服务器是否运行成功
服务器运行后，在本地尝试用浏览器在本地访问本地地址(绝大部分网络都是内网地址，不要使用外网地址)，如果弹出了“卡坦岛网页版”的网页则登录成功。
2.建立房间
点击游戏测试，直接进入测试端口。
输入一个自定义的房间密码、设置好玩家数，点击创建房间。提示“创建成功”即可。
3.加入房间(以及测试websocket配置是否正确)
按1,2,3,……的顺序输入player_index，输入房间密码和玩家名并点击加入房间，如果加载出完整的游戏画面，并提示正在等待玩家，则websocket配置正确，等待玩家到齐后即会自动开始游戏。
