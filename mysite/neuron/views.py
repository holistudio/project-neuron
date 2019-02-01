from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import Item, Category, Tag
import json
from django.core.serializers.json import DjangoJSONEncoder



def index(request):
	template = loader.get_template('neuron/index.html')

	item_list = list(Item.objects.all().values());

	for item in item_list:
		#set item date to ISO string format
		item['date'] = item['date'].isoformat();
		#get item category name
		item['category'] = Category.objects.get(id=item['category_id']).name;
		#get list of tags for each item
		item['tags'] = list(Item.objects.get(id=item['id']).tags.all().values_list('name', flat=True));

	category_list = Category.objects.all();
	tag_list = Tag.objects.all();
	context = {
		'item_list': item_list,
        'category_list': category_list,
        'tag_list': tag_list,
	}
	return HttpResponse(template.render(context, request))
