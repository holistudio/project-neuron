from django.db import models
from django.contrib.auth.models import User
from datetime import date
# Choice selections

# Model Definitions

class Category(models.Model):
	name = models.CharField(max_length=100, unique = True);

	numItems = models.PositiveIntegerField(default=0,verbose_name = "Number of Items");

	#"toString method"
	def __str__(self):
		return str(f"Category: {self.name}");

class Tag(models.Model):
	name = models.CharField(max_length=100, unique = True);

	#"toString method"
	def __str__(self):
		return str(f"Tag: {self.name}");

class Item(models.Model):
	title = models.CharField(blank=True,max_length=500);

	authors = models.CharField(blank=True,max_length=100);

	date = models.DateField(blank=True,default=date.today().isoformat());

	type = models.CharField(max_length=100, default='Article');

	url = models.URLField(blank=True,max_length=200);

	category = models.ForeignKey(Category, on_delete=models.CASCADE);

	tags = models.ManyToManyField(Tag);

	description = models.TextField(blank=True,max_length=500)

	notes = models.TextField(blank=True,max_length=5000)


	def __str__(self):
		return str(f"Item: {self.title} - {self.authors}");
