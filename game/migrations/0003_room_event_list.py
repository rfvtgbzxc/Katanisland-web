# Generated by Django 2.2.4 on 2020-03-21 11:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_auto_20190924_2219'),
    ]

    operations = [
        migrations.AddField(
            model_name='room',
            name='event_list',
            field=models.CharField(default='', max_length=1000000),
        ),
    ]