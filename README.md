# Project Neuron
A graphical archive tool with which users can map the relationship between items to various categories and tags. This can assist in interdisciplinary research, where items of interest often fall under multiple categories and have specific themes, subtopics, and ideas that are worth tracking.

## Django
The current version of this webapp lives in the mysite folder as a Django webapp. The neuron folder contains the primary Django framework files (models.py, views.py, admin.py, etc). So to demo the app yourself, clone this repo, open command line in the mysite folder, and type in `python3 manage.py runserver`.

The import.py and testdata.csv files were used to populate the webapp's sqlite database with an existing table of items and associated tags.

## p5.js
The [p5.js](https://p5js.org/reference/) library was used for visualizing the relationship map in the canvas element, with sketch.js file living under mysite/neuron/static/neuron/.
