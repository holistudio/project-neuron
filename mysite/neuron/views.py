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

	category_list = list(Category.objects.all().values());
	tag_list = list(Tag.objects.all().values());
	context = {
		'item_list': item_list,
        'category_list': category_list,
        'tag_list': tag_list,
	}
	return HttpResponse(template.render(context, request))

def category_update(request):
	if request.method == 'POST':
		#if delete item is in the keys of the request
		if 'delete_button' in request.POST.keys():
			#delete the item instead of updating
			cat = Category.objects.get(id = request.POST["category_id"]);
			cat.delete();
		else:
			#find item's corresponding category or create one if new category
			category, created = Category.objects.get_or_create(
			id=request.POST['category_id']);

			#update the category's name
			category.name = request.POST['category_name'];
			category.save();
	#redirect to index
	return HttpResponseRedirect(reverse("neuron:index"));
def item_update(request):
	if request.method == 'POST':
		#if delete item is in the keys of the request
		if 'delete_button' in request.POST.keys():
			#delete the item instead of updating
			item = Item.objects.get(id = request.POST["item_id"]);
			item.delete();
			item.category.save();
		else:
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
			#if the item id is not found, it's a new item and is created
			#in that case, the new item is automatically assigned the category
			#in the form.
			item, created = Item.objects.get_or_create(id = request.POST["item_id"],
			defaults = {'category': category});
			item_dict = model_to_dict(item);
			#for each model field of Item, update with the corresponding
			#POST request object
			for field in Item._meta.get_fields():
				#if the field is category set to category object instead
				if field.name == 'category':
					setattr(item,field.name,category);
				elif field.name =='tags':
					for tag_obj in tag_obj_list:
						item.tags.add(tag_obj);
				elif field.name == 'date':
					if request.POST['item_date']!='':
						datetime_conv = date.fromisoformat(request.POST['item_date']);
						setattr(item,field.name,datetime_conv);
				else:
					request_key = str(f"item_{field.name}");
					setattr(item,field.name,request.POST[request_key]);
			item.save();
	#redirect to index
	return HttpResponseRedirect(reverse("neuron:index"));
