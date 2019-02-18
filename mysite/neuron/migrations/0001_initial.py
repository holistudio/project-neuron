# Generated by Django 2.1.5 on 2019-01-31 23:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('numItems', models.PositiveIntegerField(default=0, verbose_name='Number of Items')),
            ],
        ),
        migrations.CreateModel(
            name='Item',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(blank=True, max_length=500)),
                ('authors', models.CharField(blank=True, max_length=100)),
                ('date', models.DateField(auto_now=True, null=True)),
                ('type', models.CharField(default='Article', max_length=100)),
                ('url', models.URLField(blank=True)),
                ('description', models.TextField(blank=True, max_length=500)),
                ('notes', models.TextField(blank=True, max_length=5000)),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='neuron.Category')),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='item',
            name='tags',
            field=models.ManyToManyField(to='neuron.Tag'),
        ),
    ]