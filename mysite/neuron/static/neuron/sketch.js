//categories and their coordinates
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
      tags: ['foo1,foo2'],
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
var tDUnitWidth = 10;

var tagDisplayColors = [
  [8,79,205], //blue
  [48,180,97], //green
  [201,48,30], //red
  [249,228,49] // yellow
];


document.addEventListener('DOMContentLoaded', () => {
  // document.querySelectorAll('.editable').forEach( (editable) => {
  //   editable.onclick = () => {
  //     if(!(editable.classList.contains('inEditMode'))){
  //       //only if the classlist doesn't have inEditMode
  //       const text = editable.innerHTML;
  //       let input;
  //       if(editable.id == 'item-notes'){
  //
  //         input = document.createElement('textarea')
  //         input.rows = '10';
  //         input.cols = '40';
  //         input.innerHTML = `${text}`;
  //       }
  //       else{
  //         input = document.createElement('input')
  //         input.type = 'text';
  //         input.value = text;
  //       }
  //
  //       editable.innerHTML = '';
  //       editable.append(input)
  //       //add inEditMode to class list
  //       editable.classList.add("inEditMode");
  //       input.focus();
  //     }
  //
  //   };
  // });

  var overlay = document.getElementById('item-form-overlay');

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

  window.onclick = function(event) {
    //if event target doesn't have 'inEditMode' class,
    // then for each inEditMode
    if (event.target == overlay) {
        overlay.style.display = "none";
    }
    if (!(event.target.classList.contains('inEditMode'))){
      document.querySelectorAll('.inEditMode').forEach( (editable) => {
        const text = editable.firstChild.value;
        editable.innerHTML = text;
        editable.classList.remove('inEditMode');
      });
    }
  }
});


let itemTable;

let maxNumItems = 0;


function preload(){

}

function setup() {
  var itemTable = window.itemTable;
  //for each row in the table,
  for (let i=0; i<itemTable.length; i++) {
    //get the row's category
    const itemCategory = itemTable[i].category;
    //if that category isn't in archive, add it to archive
    if(archive[itemCategory] == undefined){
      archive[itemCategory]={"name": itemCategory, "numItems": 0, "items":[], "active":false}
    }

    //add the item to appropriate category's items list
    archive[itemCategory].items.push(itemTable[i]);

    //initialize the other item object properties
    var itemIndex=archive[itemCategory].numItems;
    archive[itemCategory].items[itemIndex]["coordinates"]={};
    archive[itemCategory].items[itemIndex]["catLineEndPts"]=[];
    archive[itemCategory].items[itemIndex]["tagLineEndPts"]=[];
    archive[itemCategory].items[itemIndex]["active"]=false;

    //increment category's numItems by 1
    archive[itemCategory].numItems++;
  }

  //find the maximum number of items in a category
  for (category in archive) {
    if (archive[category].numItems>maxNumItems) {
      maxNumItems=archive[category].numItems;
    }
  }

  let canvas = createCanvas(windowWidth, windowHeight*0.9);
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

  textFont("sans-serif");

  canvas.parent('canvas-container')
}

function mouseDragged(){
  for (var i = 0; i < displayedTags.length; i++) {
    const e = displayedTags[i];
    const boxW = e.name.length*tDUnitWidth;
    const boxH = 24;


    if (((mouseX <= e.coordinates.x+boxW/2) && (mouseX >= e.coordinates.x-boxW/2)) &&
    ((mouseY <= e.coordinates.y) && (mouseY >= e.coordinates.y-boxH))){
      e.coordinates.x = mouseX;
      e.coordinates.y = mouseY+boxH/2;

    }
  }

}
function mouseClicked(){
  //for each category
  for (category in archive) {
    const radius = archive[category].diameter/2;
    const x = archive[category].coordinates.x;
    const y = archive[category].coordinates.y;
    if(sq(x-mouseX)+sq(y-mouseY)<sq(radius)){
      let itemClicked = false;
      //for each item in the category that the mouse cursor is in
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
            itemClicked = true;

            document.querySelector('#item-form-overlay').style.display = "block";
            const form = document.querySelector('#item-form').children;

            for (let i = 0; i < form.length; i++) {
              //for each child of div item-form-content, get the first element with class "editable"
              const fillTag = form[i].getElementsByClassName('editable')[0]
              if (fillTag != undefined){
                //get that element's id (author, notes, etc)
                const key = fillTag.name.split('_')[1];
                if (item[key] != undefined) {
                  if(key=='notes' || key =='description'){

                    fillTag.innerHTML=`${item[key]}`;
                  }
                  else{
                    fillTag.value=`${item[key]}`;
                  }
                }
              }
            }

          }
        }

      }
      if (archive[category].active && (!itemClicked)) {
        archive[category].active=false;
        const remIndex = selectedCategories.indexOf(archive[category].name);
        selectedCategories.splice(remIndex,1);
      }
      else{
        archive[category].active=true;
        if (!selectedCategories.includes(archive[category].name)){
          selectedCategories.push(archive[category].name);
        }

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

    if (archive[category].active) {
      fill(204, 255, 255);
    }
    else{
      fill(0.9*255);
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

  for (category in archive) {
    //for each item in the category
    for (let i=0; i<archive[category].items.length; i++) {
      const item = archive[category].items[i];
      //if that item has a tag sharing another category name, draw a line between that item
      //and the category's coordinates

      for (let j=0; j<item.catLineEndPts.length; j++) {
        if(item.active){
          stroke(0, 0, 0, 0.8*255);
        }
        else{
          stroke(0, 0, 0, 0.1*255);
        }
        line(item.coordinates.x,item.coordinates.y,item.catLineEndPts[j].x,item.catLineEndPts[j].y);
      }


      //if that item also shares a selected tag name, draw a blue line
      push();
      stroke(8,79,205);
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