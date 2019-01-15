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

var displayedTags = [];
/*[
  {name:'tangible',
  coordinates: {x:30, y:32}},
]*/
//test tag name
var tagName='tangible';

let csvTable;

let maxNumItems = 0;

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
      archive[itemCategory]={"name": itemCategory, "numItems": 0, "items":[]}
    }
    //add the item to appropriate category's items list
    archive[itemCategory].items.push(csvTable.getRow(i).obj);

    //initialize the other item object properties
    var itemIndex=archive[itemCategory].numItems;
    archive[itemCategory].items[itemIndex]["coordinates"]={};
    archive[itemCategory].items[itemIndex]["catLineEndPts"]=[];
    archive[itemCategory].items[itemIndex]["tagLineEndPts"]=[];

    //increment category's numItems by 1
    archive[itemCategory].numItems++;
  }

  //find the maximum number of items in a category
  for (category in archive) {
    if (archive[category].numItems>maxNumItems) {
      maxNumItems=archive[category].numItems;
    }
  }

  createCanvas(1150*1.25, 768*1.25);
  //calculate where the category abd item circle centers are
  //2 x 3 grid for the six categories
  var numRows = 2;
  var numCols = 3;
  var gridX = width/numCols;
  var gridY = height/numRows;
  var startX = gridX/2;
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
      const radius = random((archive[category].diameter-itemDia)/2);
      const theta = random(TWO_PI);
      archive[category].items[i]["coordinates"]={
        x:archive[category].coordinates.x + radius*cos(theta),
        y: archive[category].coordinates.y + radius*sin(theta)};
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

  background(0.99*255);


  noLoop();
}

function draw() {
  //draw category circles
  for (category in archive) {
    // fill(0.7*255); hover color
    fill(0.9*255)
    noStroke();
    //draw  a circle of categoryDia
    ellipse(archive[category].coordinates.x,archive[category].coordinates.y,archive[category].diameter,archive[category].diameter);



    fill(0)
    //draw category labels outside the circles
    textSize(24);
    textAlign(CENTER);
    rectMode(CENTER);

    text(archive[category].name.toUpperCase(),archive[category].coordinates.x,archive[category].coordinates.y-archive[category].diameter/2,200,72);
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
    }
  }

  noStroke();
  fill(0);
  for (category in archive) {
    //for each item in the category
    for (let i=0; i<archive[category].items.length; i++) {
      const item = archive[category].items[i];

      //draw items
      ellipse(item.coordinates.x,item.coordinates.y,itemDia,itemDia);
    }
  }
  //place tagName text in the on top of screen
  // push();
  // fill(0);
  // textSize(24);
  // textAlign(CENTER);
  // rectMode(CENTER);
  // text(tagName,width/2,height/2);
  // pop();

  //if that item has a tag sharing tagName, draw a line between that item
  // stroke(0, 0, 255);
  // if(csvTable.getString(i,'Tags').includes(tagName)){
  //   line(loc[0],loc[1],width/2,height/2);
  // }



}
