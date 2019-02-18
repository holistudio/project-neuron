from django.urls import path

from . import views

app_name = 'neuron'

urlpatterns = [
	path("", views.index, name="index"),
	path("itemupdate/", views.item_update, name="item_update"),
]
