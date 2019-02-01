import csv

from neuron.models import Item, Category, Tag

f = open("testdata.csv")
reader = csv.reader(f)

for line in reader:
	print(line);
	title = line[0];
	authors = line[1];
	date = line[2];
	type = line[3];
	url = line[4];
	description = line[5];
	category = line[6];
	tags = line[7];
	notes = line[8];

	cat_query = Category.objects.filter(name__exact=category);
	if len(cat_query)==0:
		#if no category exists with that name, create one
		new_cat = Category(name=category)
		new_cat.save();
		item_cat=new_cat;
	else:
		item_cat = cat_query.get();

	# if title authors and notes begin and end with "" remove them
	title.strip('"');
	authors.strip('"');
	notes.strip('"');

	item = Item(title=title, authors=authors, date=date, type=type, url=url, description=description,category=item_cat,notes=notes);

	item.save();

	tags.strip('"');
	tag_list = tags.split(',');

	# if tags begin and end with "" remove them


	for t in tag_list:
		t=t.strip();
		tag_query = Tag.objects.filter(name__exact=t);
		if len(tag_query)==0:
			new_tag = Tag(name=t);
			new_tag.save();
			item_tag = new_tag;
		else:
			item_tag = tag_query.get();
		item.tags.add(item_tag);
