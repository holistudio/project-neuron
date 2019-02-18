from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.template import loader
from .models import Item, Category, Tag
from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict

import json
from datetime import date

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

def item_update(request):
	if request.method == 'POST':
		#find item's corresponding category or create one if new category
		category, created = Category.objects.get_or_create(
		name=request.POST['item_category']);

		#check through all tags
		#split tag list into array
		tag_list = request.POST['item_tags'].split(',');
		tag_obj_list = [];

		#for each tag in that array get or create
		for tag in tag_list:
			tag_obj, created = Tag.objects.get_or_create(
			name=tag.strip());
			#then add to another array of tag objects
			tag_obj_list.append(tag_obj);

		#get the item with id from form
		item, created = Item.objects.get_or_create(id = request.POST["item_id"]);
		item_dict = model_to_dict(item);
		for field in Item._meta.get_fields():
			#if the field is category set to category object instead
			if field.name == 'category':
				setattr(item,field.name,category);
			elif field.name =='tags':
				for tag_obj in tag_obj_list:
					item.tags.add(tag_obj);
			elif field.name == 'date':
				datetime_conv = date.fromisoformat(request.POST['item_date'])
				setattr(item,field.name,datetime_conv);
			else:
				request_key = str(f"item_{field.name}");
				setattr(item,field.name,request.POST[request_key]);
		item.save();
	#redirect to index
	return HttpResponseRedirect(reverse("neuron:index"));
