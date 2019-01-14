//categories and their coordinates
var categoryNames = [
  'design principles',
  'hardware',
  'software',
  'physical design',
  'interface',
  'occupant initiative'];
var categoryDia = 400;
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
      coordinates: {x:30, y:32}},]
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
    var itemCategory = csvTable.getString(i,'category');
    //if that category isn't in archive, add it to archive
    if(archive[itemCategory] == undefined){
      archive[itemCategory]={"name": itemCategory, "numItems": 0, "items":[]}
    }
    //add the item to appropriate category's items list
    archive[itemCategory].items.push(csvTable.getRow(i).obj);

    //increment category's numItems by 1
    archive[itemCategory].numItems++;
  }

  //find the maximum number of items in a category
  for (category in archive) {
    if (archive[category].numItems>maxNumItems) {
      maxNumItems=archive[category].numItems;
    }
  }

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
    archive[category]["diameter"] = categoryDia * archive[category].numItems / maxNumItems;
    archive[category]["coordinates"] = {x: startX+c*gridX, y:startY+r*gridY}
    for (let i=0; i<archive[category].items.length; i++) {
      const radius = random((archive[category].diameter-itemDia)/2);
      const theta = random(TWO_PI);
      archive[category].items[i]["coordinates"]={x:archive[category].coordinates.x + radius*cos(theta),
        y: archive[category].coordinates.y + radius*sin(theta)};
    }
    if (c<numCols) {
      c++;
    }
    else {
      c=0;
      r++;
    }
  }
  console.log(archive);
  textFont("Gill Sans MT");
  createCanvas(1150, 768);
  background(225);


  noLoop();
}

// function draw() {
//   //for each category
//   fill(0.7*255);
//   noStroke();
//   for(let i=0; i<categoryNames.length; i++){
//   	//draw  a circle of categoryDia
//     ellipse(gridPoints[i][0],gridPoints[i][1],categoryDia ,categoryDia );
//
//   	// with text at the center of that circle
//     push();
//     fill(0);
//     textSize(24);
//     textAlign(CENTER);
//     rectMode(CENTER);
//     text(categoryNames[i].toUpperCase(),gridPoints[i][0],gridPoints[i][1],200,72);
//     pop();
//
//   }
//   //place tagName text in the center of the screen
//   push();
//   fill(0);
//   textSize(24);
//   textAlign(CENTER);
//   rectMode(CENTER);
//   text(tagName,width/2,height/2);
//   pop();
//
//   //Title,Date,Type,URL,Description,Category,Tags,Notes
//
//   //for each item
//   for(let i=0; i<csvTable.getRowCount(); i++){
//     var itemCategory = csvTable.getString(i,'Category');
//
//
//     //(within the category circle)
//   	//if that item has a tag sharing another category name, draw a line between that item
//     //and the category
//     strokeWeight(1);
//     stroke(255, 0, 0);
//     for(let j=0; j<categoryNames.length; j++){
//       if(categoryNames[j]!=itemCategory){
//         if(csvTable.getString(i,'Tags').includes(categoryNames[j])){
//         }
//
//       }
//     }
//     stroke(0, 0, 255);
//     //if that item has a tag sharing tagName, draw a line between that item
//     if(csvTable.getString(i,'Tags').includes(tagName)){
//       line(loc[0],loc[1],width/2,height/2);
//     }
//     noStroke();
//   	//then draw the solid circle representing the item
//     fill(0);
//     ellipse(loc[0],loc[1],10,10);
//
//
//
//   }
//
// }
