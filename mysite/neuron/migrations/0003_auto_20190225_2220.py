# Generated by Django 2.1.5 on 2019-02-25 22:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('neuron', '0002_auto_20190225_2216'),
    ]

    operations = [
        migrations.AlterField(
            model_name='item',
            name='date',
            field=models.DateField(blank=True, default='2019-02-25'),
        ),
    ]