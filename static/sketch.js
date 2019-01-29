//categories and their coordinates
var categoryNames = [
  'design principles',
  'hardware',
  'software',
  'physical design',
  'interface',
  'occupant initiative'];
var categoryDia = 200;
var itemDia = 10;
var archive={}; //JSON so that the keys can be strings
/* {
    "design principles":
    {"name": 'design principles',
    "coordinates": {x:30, y:32},
    "numItems": 10,
    "diameter": 30,
    "items": [
      {"title": 'Foo-1',
      "date": '2014-10-02', //the rest of the object keys should be in parantheses
      type: 'Link',
      url: 'foo.com',
      description: 'foo',
      category:'Design Principles',
      tags: 'foo1,foo2',
      notes: '',
      coordinates: {x:30, y:32}},
      catLineEndPts: [{x:5,y:10},...],
      tagLineEndPts: []},...]
    },
    "hardware":
    {name: 'Hardware',
    coordinates: [5,10],
    numItems: 10,
    diameter: 30,
    items: [
      {title: 'Foo-3',
      date: '2014-10-02',
      type: 'Link',
      URL: 'foo.com',
      description:'foo',
      category:'Hardware',
      tags: ['foo1','foo2'],
      notes: '',
      coordinates: {x:30, y:32}},
      {title: 'Foo-4',
      date: '2014-10-02',
      type: 'Link',
      URL: 'foo.com',
      description:'foo',
      category:'Hardware',
      tags: ['foo1','foo2'],
      notes: '',
      coordinates: {x:35, y:34}},
      diameter: 10]},
    },
    ...
]
*/

var selectedCategories=[];
var displayedTags = [];
/*[
  {name:'tangible',
  coordinates: {x:30, y:32}},
]*/
var tagDisplayStart = {x:100, y:50};
var tagDisplaySpace = 50;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#tag-list').innerHTML = displayedTags.join(', ');
  document.querySelector('#tag-display-form').onsubmit = () => {
    let nextPosition = tagDisplayStart;
    //find the next available spot in the default display position
    for (let i = 0; i < displayedTags.length; i++) {
      if( displayedTags[i].coordinates.x == nextPosition.x && displayedTags[i].coordinates.y == nextPosition.y ) {
        nextPosition.y = nextPosition.y+tagDisplaySpace;
      }
    }
    const tagName = document.querySelector('#tag-display-input').value; //from form
    document.querySelector('#tag-display-input').value = "";
    displayedTags.push({name: tagName, coordinates: {x: nextPosition.x, y: nextPosition.y}});
    if (displayedTags.length<2){
      document.querySelector('#tag-list').innerHTML+=tagName;
    }
    else{
      document.querySelector('#tag-list').innerHTML+=', ' + tagName;
    }

    return false;
  };
});


let csvTable;

let maxNumItems = 0;

function cleanTagList(tagList){
  let tagArray = tagList.split(",");
  tagArray.forEach(function(str,index){
      this[index]=str.trim();
  },tagArray);
  return tagArray.join();
}

function preload() {
  csvTable = loadTable('./assets/testdata.csv', 'csv', 'header');
}

function setup() {

  //for each row in the table,
  for (let i=0; i<csvTable.getRowCount(); i++) {
    //get the row's category
    const itemCategory = csvTable.getString(i,'category');
    //if that category isn't in archive, add it to archive
    if(archive[itemCategory] == undefined){
      archive[itemCategory]={"name": itemCategory, "numItems": 0, "items":[], "active":false}
    }

    //add the item to appropriate category's items list
    archive[itemCategory].items.push(csvTable.getRow(i).obj);

    //initialize the other item object properties
    var itemIndex=archive[itemCategory].numItems;
    archive[itemCategory].items[itemIndex]["coordinates"]={};
    archive[itemCategory].items[itemIndex]["catLineEndPts"]=[];
    archive[itemCategory].items[itemIndex]["tagLineEndPts"]=[];
    archive[itemCategory].items[itemIndex]["active"]=false;

    archive[itemCategory].items[itemIndex].tags=cleanTagList(archive[itemCategory].items[itemIndex].tags);

    //increment category's numItems by 1
    archive[itemCategory].numItems++;
  }

  //find the maximum number of items in a category
  for (category in archive) {
    if (archive[category].numItems>maxNumItems) {
      maxNumItems=archive[category].numItems;
    }
  }

  let canvas = createCanvas(1150*1.25, 768*1.25);
  //calculate where the category abd item circle centers are
  //2 x 3 grid for the six categories
  var numRows = 2;
  var numCols = 3;
  var padding = 200; //to make way for inserted tags
  var gridX = (width-padding)/numCols;
  var gridY = height/numRows;
  var startX = padding + gridX/2;
  var startY = gridY/2;
  let r=0;
  let c=0;
  for (category in archive) {
    //category diameter is in proportion to the number of items
    archive[category]["diameter"] = map(archive[category].numItems,0,maxNumItems,75,categoryDia);
    archive[category]["coordinates"] = {x: startX+c*gridX, y:startY+r*gridY}

    //for each item in the category
    //place it randomly within the category circle
    for (let i=0; i<archive[category].items.length; i++) {
      let radius;
      let theta;
      let x;
      let y;

      let overlap = true;
      while (overlap) {
        overlap = false;
        radius = random((archive[category].diameter-itemDia)/2);
        theta = random(TWO_PI);
        // calculate coordinates
        x = archive[category].coordinates.x + radius*cos(theta);
        y = archive[category].coordinates.y + radius*sin(theta);

        //check if those coordinates are inside any other item circles
        for (let j=0; j<archive[category].items.length; j++){
          const itemTest = archive[category].items[j];
          if(JSON.stringify(itemTest.coordinates)!="{}"){
            if(sq(x-itemTest.coordinates.x)+sq(y-itemTest.coordinates.y)<sq(itemDia)){
              overlap=true;
              break;
            }
          }
        }
      }

      archive[category].items[i]["coordinates"]={ x: x, y: y};
    }
    if (c<numCols-1) {
      c++;
    }
    else {
      c=0;
      r++;
    }
  }

  //calculate endpoints for lines between items and other categories
  for (category in archive) {
    //for each item in the category
    for (let i=0; i<archive[category].items.length; i++) {
      const item = archive[category].items[i];
      //if that item has a tag sharing another category name, draw a line between that item
      //and the category's coordinates
      for (otherCategory in archive) {
        if (otherCategory != category){
          if(item.tags.includes(otherCategory)){
            item.catLineEndPts.push(archive[otherCategory].coordinates);
          }
        }
      }
    }
  }

  textFont("Gill Sans MT");

  canvas.parent('canvas-container')
}

function mouseClicked(){
  for (category in archive) {
    const radius = archive[category].diameter/2;
    const x = archive[category].coordinates.x;
    const y = archive[category].coordinates.y;
    if(sq(x-mouseX)+sq(y-mouseY)<sq(radius)){
      for (let i=0; i<archive[category].items.length; i++){
        const item = archive[category].items[i];
        const itemRadius = itemDia/2;
        const itemX = item.coordinates.x;
        const itemY = item.coordinates.y;
        if(sq(itemX-mouseX)+sq(itemY-mouseY)<sq(itemRadius)){
          if (item.active) {
            item.active=false;
          }
          else{
            item.active=true;
            const form = document.querySelector('.side-form').children;

            for (let i = 0; i < form.length; i++) {
              const key = form[i].firstElementChild.id.split('-')[1];
              form[i].firstElementChild.innerHTML=item[key];
            }

          }
        }

      }
      if (archive[category].active) {
        archive[category].active=false;
        const remIndex = selectedCategories.indexOf(archive[category].name);
        selectedCategories.splice(remIndex,1);
      }
      else{
        archive[category].active=true;
        selectedCategories.push(archive[category].name);
      }
      document.querySelector('#category-list').innerHTML=selectedCategories.join(', ');
    }
  }
}

function draw() {
  background(0.99*255);
  //draw category circles
  for (category in archive) {
    const radius = archive[category].diameter/2;
    const x = archive[category].coordinates.x;
    const y = archive[category].coordinates.y;

    if(sq(x-mouseX)+sq(y-mouseY)<sq(radius)){
      fill(229, 255, 255);
    }
    else{
      if (archive[category].active) {
        fill(204, 255, 255);
      }
      else{
        fill(0.9*255);
      }

    }


    noStroke();
    //draw  a circle of categoryDia
    ellipse(x,y,archive[category].diameter,archive[category].diameter);



    fill(0)
    //draw category labels outside the circles
    textSize(24);
    textAlign(CENTER);
    rectMode(CENTER);

    text(archive[category].name.toUpperCase(),archive[category].coordinates.x,archive[category].coordinates.y-archive[category].diameter/2-12,200,72);
  }

  strokeWeight(1);
  stroke(0, 0, 0, 0.1*255);
  for (category in archive) {
    //for each item in the category
    for (let i=0; i<archive[category].items.length; i++) {
      const item = archive[category].items[i];
      //if that item has a tag sharing another category name, draw a line between that item
      //and the category's coordinates

      for (let j=0; j<item.catLineEndPts.length; j++) {
        line(item.coordinates.x,item.coordinates.y,item.catLineEndPts[j].x,item.catLineEndPts[j].y);
      }
      push();
      stroke(0, 0, 255);
      for (let j = 0; j < displayedTags.length; j++) {
        if(item.tags.includes(displayedTags[j].name)){
          line(item.coordinates.x,item.coordinates.y,displayedTags[j].coordinates.x,displayedTags[j].coordinates.y);
        }
      }
      pop();

    }
  }

  noStroke();

  for (category in archive) {
    //for each item in the category
    for (let i=0; i<archive[category].items.length; i++) {
      const item = archive[category].items[i];
      const radius = itemDia/2;
      const x = item.coordinates.x;
      const y = item.coordinates.y;

      if(sq(x-mouseX)+sq(y-mouseY)<sq(radius)){
        fill(0);
      }
      else{
        if (item.active) {
          fill(51, 204, 255);
        }
        else{
          fill(0,0.3*255);
        }
      }

      //draw items
      ellipse(item.coordinates.x,item.coordinates.y,itemDia,itemDia);

      //add text on mouse hover
      if(sq(x-mouseX)+sq(y-mouseY)<sq(radius)){
        textSize(12);
        textAlign(LEFT);
        rectMode(CORNER);
        text(item.title,x,y-12);
      }
    }
  }

  // place tagName text in the on top of screen
  push();
  fill(0);
  textSize(24);
  textAlign(CENTER);
  rectMode(CENTER);
  for (var i = 0; i < displayedTags.length; i++) {
    text(displayedTags[i].name,displayedTags[i].coordinates.x,displayedTags[i].coordinates.y);
  }
  pop();

  //if that item has a tag sharing tagName, draw a line between that item




}
