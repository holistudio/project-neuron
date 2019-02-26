from django.contrib import admin

from .models import Item, Category, Tag

class ItemAdmin(admin.ModelAdmin):
	list_display = ('title', 'authors', 'type', 'category');
	fields = ['title', 'authors', 'date', 'type', 'url','category','tags' , 'description', 'notes'];

class ItemInline(admin.StackedInline):
	model = Item;
	extra = 0;
	fields = ['title', 'authors', 'type', 'url'];

class TagAdmin(admin.ModelAdmin):
    list_display = ['name'];
    fields = ['name'];

class CategoryAdmin(admin.ModelAdmin):
	list_display=['name'];
	fields = ['name'];
	#display all items in the category
	inlines = [ItemInline];

admin.site.register(Item, ItemAdmin)
admin.site.register(Tag, TagAdmin)
admin.site.register(Category, CategoryAdmin)
