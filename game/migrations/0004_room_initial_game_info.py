# Generated by Django 2.2.4 on 2020-03-21 13:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_room_event_list'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='initial_game_info',
            field=models.CharField(default='', max_length=100000),
        ),
    ]
