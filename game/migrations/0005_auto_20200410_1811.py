# Generated by Django 2.2.4 on 2020-04-10 10:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_room_initial_game_info'),
    ]

    operations = [
        migrations.CreateModel(
            name='Extend',
            fields=[
                ('ID', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=20)),
                ('name_Ch', models.CharField(max_length=40)),
            ],
        ),
        migrations.AddField(
            model_name='room',
            name='extend_list',
            field=models.CharField(default='', max_length=200),
        ),
    ]
