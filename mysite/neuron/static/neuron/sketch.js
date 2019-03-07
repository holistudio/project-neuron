let maxNumItems = 0; //max number of items in a category, which will scale the
                     //diameters of the category circles drawn.
var archive={}; //JSON of the database items organized by category
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

//maxItemID and maxCategoryID are used to track the largest max IDs of Database
//objects so that when new items or categories are created, the next largest id
//can be assigned

let maxItemID = 0;
let maxCategoryID = 0;

//array of categories and tags selected on the canvas, to be displayed in the DOM
var selectedCategories=[];
var displayedTags = [];
/*[
  {name:'tangible',
  coordinates: {x:30, y:32}},
]*/

//tag colors
var tagDisplayColors = [
  [8,79,205], //blue
  [48,180,97], //green
  [201,48,30], //red
  [249,228,49] // yellow
];

//buttons for adding things to the canvas
let buttons = [
  {
    name: 'addItem',
    text: 'Add Item'},
  {
    name: 'addCategory',
    text: 'Add Category'
  }];

let mouseEnabled = true; //mouse enable/disable variable for disabling mouse clicks in canvas when forms are active.

//canvas object sizing parameters
let scale;
let categoryDia;
let itemDia;

//canvas buttons
let buttonWidth;
let buttonHeight;
let buttonPadding;
let buttonMenuCoord; //bottom left corner of the menu

//tag display area
let tagDisplayStart;
let tagDisplaySpace;
let tDUnitWidth;

function displaySideForm(formType, formNew, obj){
  console.log('in displaySideForm')
  //formType is type of form (item, category, etc)
  //formNew is a boolean, true if for a new item or category
  //obj is the object to be updated, (archive[category] or item)
  let formQuerySelector=`#${formType}-form`;
  let maxID;
  let submitButtonText='';

  document.querySelector('#side-form-overlay').style.display = "block";

  if(formType=='item'){
    //display item form and side form overlay while hiding the category form
    document.querySelector('#item-form').style.display = "block";
    document.querySelector('#category-form').style.display = "none";

  }
  if(formType=='category'){
    //show the category form, hide the item form
    document.querySelector('#item-form').style.display = "none";
    document.querySelector('#category-form').style.display = "block";
  }

  if(formNew){
    if(formType=='item'){
      maxID = maxItemID;
    }
    if(formType=='category'){
      maxID = maxCategoryID;
    }

    submitButtonText = 'Add';

    document.querySelectorAll('.delete-button').forEach( (b) => {
      b.style.display="none";
    });
  }
  else{
    document.querySelectorAll('.delete-button').forEach( (b) => {
      b.style.display="block";
    });

    submitButtonText = 'Update';

    if(formType=='category'){
      for (let j = 0; j < obj.items.length; j++) {
        const item = obj.items[j]
        const title = obj.items[j].title;
        const bullet = document.createElement('li');
        const link = document.createElement('a');
        link.innerHTML = title;
        link.href = '#'
        bullet.onclick = () => {
          displaySideForm('item',false,item);
        };
        bullet.appendChild(link);
        document.querySelector('#item-list').appendChild(bullet);
      }
    }
  }

  const form = document.querySelector(formQuerySelector).children;
  for (let i = 0; i < form.length; i++) {
    //for each child of div side-form-content, get the first element with class "editable"
    const formElement = form[i].firstElementChild;
    if (formElement != undefined){
      if(formElement.classList.contains('editable')){
        //get that element's name (author, notes, etc)
        const key = formElement.name.split('_')[1];

        if(formNew){
          if(key=='notes' || key =='description'){
            formElement.innerHTML='';
          }
          else if (key=='id') {
            //assign new id
            formElement.value=maxID+1;
          }
          else{
            formElement.value='';
          }
        }
        else{
          //fill in the form with the existing item's data
          if (obj[key] != undefined) {
            if(key=='notes' || key =='description'){
              formElement.innerHTML=`${obj[key]}`;
            }
            else{
              formElement.value=`${obj[key]}`;
            }
          }
        }
      }
      else{
        //Change submit button's text as appropriate
        if (formElement.name=='submit_button'){
          formElement.innerHTML= `${submitButtonText} ${formType}`;
        }
      }
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  var overlay = document.getElementById('side-form-overlay');

  //Display the selected tags as a list in the DOM
  document.querySelector('#tag-list').innerHTML = displayedTags.join(', ');

  //Pressing Enter in the "Selected Tags" input box inserts tags into the canvas
  document.querySelector('#tag-display-form').onsubmit = () => {
    let nextPosition = tagDisplayStart;
    //find the next available spot in the default display position
    for (let i = 0; i < displayedTags.length; i++) {
      if( displayedTags[i].coordinates.x == nextPosition.x && displayedTags[i].coordinates.y == nextPosition.y ) {
        nextPosition.y = nextPosition.y+tagDisplaySpace;
      }
    }

    //get the tag name from the form
    const tagName = document.querySelector('#tag-display-input').value;

    //clear the input
    document.querySelector('#tag-display-input').value = "";

    //add the tag name to displayedTags
    displayedTags.push({name: tagName, coordinates: {x: nextPosition.x, y: nextPosition.y}});

    //if there is only one item, display the tag, otherwise add a comma before
    //the tag name so the list shows up with the correct placement of commas
    if (displayedTags.length<2){
      document.querySelector('#tag-list').innerHTML+=tagName;
    }
    else{
      document.querySelector('#tag-list').innerHTML+=', ' + tagName;
    }

    return false;
  };

  //pressing cancel on the side form will close the form and re-enable the mouse
  document.querySelectorAll('.cancel-button').forEach( (b) => {
    b.onclick = () => {
      overlay.style.display = "none";
      mouseEnabled = true;
      document.querySelector('#item-list').innerHTML='';
      return false;
    }
  });

  window.onclick = function(event) {
    //if the sideform is on display
    if(overlay.style.display != "" && overlay.style.display != "none"){
      //check the mouse click's target
      if (event.target == overlay) {
        // if the click is outside the form, hide the form and enable the mouse click
        overlay.style.display = "none";
        mouseEnabled = true;
        document.querySelector('#item-list').innerHTML='';
      }
      else{
        // else if the click is inside the form, disable the mouse click on
        // on the canvas
        mouseEnabled = false;
      }
    }
    else{
      // if the sideform is not on display, make sure the mouseclick is enabled
      mouseEnabled = true;
    }

    // old code for changing form text into input boxes
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
    // if event target doesn't have 'inEditMode' class,
    // then for each inEditMode
    // if (!(event.target.classList.contains('inEditMode'))){
    //   document.querySelectorAll('.inEditMode').forEach( (editable) => {
    //     const text = editable.firstChild.value;
    //     editable.innerHTML = text;
    //     editable.classList.remove('inEditMode');
    //   });
    // }
  }
});

function preload(){

}

function setup() {
  var itemTable = window.itemTable;
  var categoryTable = window.categoryTable;

  //initialize all categories in archive
  for (let i = 0; i < categoryTable.length; i++) {
    archive[categoryTable[i].name]={"name": categoryTable[i].name, "numItems": 0, "items":[], "active":false, "id": categoryTable[i].id}
    //find the max Category ID for adding new categories
    if(categoryTable[i].id > maxCategoryID){
      maxCategoryID = categoryTable[i].id;
    }
  }
  //for each row in the table,
  for (let i=0; i<itemTable.length; i++) {
    //get the row's category
    const itemCategory = itemTable[i].category;

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

    //find the max Item ID for adding new items
    if(int(itemTable[i].id)>maxItemID){
      maxItemID = int(itemTable[i].id);
    }
  }

  //find the maximum number of items in a category
  for (category in archive) {
    if (archive[category].numItems>maxNumItems) {
      maxNumItems=archive[category].numItems;
    }
  }

  let canvas = createCanvas(windowWidth, windowHeight*0.8);
  //calculate where the category and item circle centers are
  //assuming a 3 column grid

  //scale canvas objects based on window width
  scale = windowWidth/2800;
  categoryDia = map(scale,0,1,75,200);
  itemDia = map(scale,0,1,3,10);
  //canvas buttons
  buttonWidth = map(scale,0,1,90,120);
  buttonHeight = map(scale,0,1,20,40);
  buttonPadding = map(scale,0,1,5,10);
  buttonMenuCoord = {x:20,y:-20}; //bottom left corner of the menu

  //tag display area
  tagDisplayStart = {x:map(scale,0,1,25,100), y:map(scale,0,1,25,50)};
  tagDisplaySpace = map(scale,0,1,25,50);
  tDUnitWidth = 10*scale;

  //assume a 3-column grid for the category circles
  var numCols = 3;
  var numRows = Math.ceil(Object.keys(archive).length/numCols) ;
  var padding = 200*scale; //shift grid to the right to make way for inserted tags
  var gridX = (width-padding)/numCols;
  var gridY = (height)/numRows;
  var startX = padding + gridX/2;
  var startY = gridY/2;
  let r=0;
  let c=0;
  for (category in archive) {
    //category diameter is in proportion to the maximum number of items
    //in a single category
    archive[category]["diameter"] = map(archive[category].numItems,0,maxNumItems,75*scale,categoryDia);
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

  //calculate locations of buttons' upper right corner
  for (let i = 0; i < buttons.length; i++) {
    const buttonX = buttonMenuCoord.x;
    const buttonY = height+buttonMenuCoord.y-buttonHeight*(i+1)-buttonPadding*i;
    buttons[buttons.length-i-1]['coord'] = {x: buttonX, y:buttonY};
  }

  textFont("Gill Sans");

  //insert canvas into the div container, '#canvas-container'
  canvas.parent('canvas-container')
}

function mouseDragged(){
  //click and drag tag names inserted in the canvas
  for (var i = 0; i < displayedTags.length; i++) {
    const e = displayedTags[i];
    const boxW = e.name.length*tDUnitWidth;
    const boxH = map(scale,0,1,16,24);

    if (((mouseX <= e.coordinates.x+boxW/2) && (mouseX >= e.coordinates.x-boxW/2)) &&
    ((mouseY <= e.coordinates.y) && (mouseY >= e.coordinates.y-boxH))){
      e.coordinates.x = mouseX;
      e.coordinates.y = mouseY+boxH/2;

    }
  }

  for (category in archive) {
    const radius = archive[category].diameter/2;
    const x = archive[category].coordinates.x;
    const y = archive[category].coordinates.y;

    for (let i=0; i<archive[category].items.length; i++){

      const item = archive[category].items[i];
      const itemRadius = itemDia/2;
      const itemX = item.coordinates.x;
      const itemY = item.coordinates.y;

      //check if the click is inside the item
      if(sq(itemX-mouseX)+sq(itemY-mouseY)<sq(itemRadius+5)){
        item.coordinates.x = mouseX;
        item.coordinates.y = mouseY;
      }
    }


  }

}

function mouseClicked(){
  if (mouseEnabled){
    //handle button clicks
    for (let i = 0; i < buttons.length; i++) {
      if(mouseX>buttons[i].coord.x &&
        mouseX<buttons[i].coord.x+buttonWidth &&
        mouseY>buttons[i].coord.y &&
        mouseY<buttons[i].coord.y+buttonHeight){
          document.querySelectorAll('.delete-button').forEach( (b) => {
            b.style.display="none";
          });
          if(buttons[i].name=='addItem'){
            displaySideForm('item',true,'n/a');
          }
          else if (buttons[i].name=='addCategory') {
            displaySideForm('category',true,'n/a');
          }
        }
    }
    //for each category
    for (category in archive) {
      const radius = archive[category].diameter/2;
      const x = archive[category].coordinates.x;
      const y = archive[category].coordinates.y;

      const categoryLabelY = y-radius-12;

      //if user clicks on a category label on the canvas
      if (mouseX < (x+(map(scale,0,1,75,200)/2)) &&
          mouseX >(x-(map(scale,0,1,75,200)/2)) &&
          mouseY < (categoryLabelY+(map(scale,0,1,42,72)/2)) &&
          mouseY > (categoryLabelY-(map(scale,0,1,42,72)/2))){
            displaySideForm('category',false,archive[category]);
      }

      //if the mouseclick is inside a category circle
      if(sq(x-mouseX)+sq(y-mouseY)<sq(radius)){
        let itemClicked = false;
        //for each item in the category that the mouse cursor is in
        for (let i=0; i<archive[category].items.length; i++){

          const item = archive[category].items[i];
          const itemRadius = itemDia/2;
          const itemX = item.coordinates.x;
          const itemY = item.coordinates.y;

          //check if the click is inside the item
          if(sq(itemX-mouseX)+sq(itemY-mouseY)<sq(itemRadius)){
            itemClicked = true;
            if (item.active) {
              //deactivate if the item is already active
              item.active=false;
            }
            else{
              //if the item is clicked
              //activate the item
              item.active=true;
              displaySideForm('item',false,item);
            }
          }
        }

        //if the item isn't clicked
        if(!itemClicked){
          // if the category is active
          if (archive[category].active) {
            //deactivated the category
            archive[category].active=false;

            //remove the category for the selected category list
            const remIndex = selectedCategories.indexOf(archive[category].name);
            selectedCategories.splice(remIndex,1);
          }
          else{
            //if the category isn't active, activate it and add to category list
            archive[category].active=true;
            if (!selectedCategories.includes(archive[category].name)){
              selectedCategories.push(archive[category].name);
            }
          }
        }

        //display the list of categories in the DOM
        document.querySelector('#category-list').innerHTML=selectedCategories.join(', ');
      }
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

    //category circle fill colors
    if (archive[category].active) {
      fill(157, 191, 251);
    }
    else{
      fill(0.9*255);
    }

    noStroke();
    //draw  a circle of categoryDia
    ellipse(x,y,archive[category].diameter,archive[category].diameter);

    //draw category labels outside the circles
    textSize(map(scale,0,1,14,24));
    textAlign(CENTER);
    rectMode(CENTER);

    //category label fill colors
    if (archive[category].active) {
      fill(84, 144, 248);
    }
    else{
      fill(0.7*255);
    }

    //category labels
    text(
      archive[category].name.toUpperCase(),
      archive[category].coordinates.x,
      archive[category].coordinates.y-archive[category].diameter/2-16,
      map(scale,0,1,75,200),
      map(scale,0,1,42,72));
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
        line(item.coordinates.x,
          item.coordinates.y,
          item.catLineEndPts[j].x,
          item.catLineEndPts[j].y);
      }

      //if that item also shares a selected tag name, draw a colored line
      push();

      //index for tagDisplayColors
      let col = 0;

      for (let j = 0; j < displayedTags.length; j++) {
        //line color for displayed tags in canvas cycles through the tagDisplayColors array
        stroke(tagDisplayColors[col][0],tagDisplayColors[col][1],tagDisplayColors[col][2]);

        //if the item has a tag with a partial match to the selected tag,
        //draw a line connecting the item to the selected tag on canvas
        if(item.tags.toString().includes(displayedTags[j].name)){
          line(item.coordinates.x,
            item.coordinates.y,
            displayedTags[j].coordinates.x,
            displayedTags[j].coordinates.y);
        }

        //switch to a different color for the next tag displayed on canvas
        if(col< tagDisplayColors.length-1){
          col++;
        }
        else{
          col=0;
        }
      }
      pop();

    }
  }

  noStroke();

  //draw item dots
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
          fill(8,79,205);
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
  textSize(map(scale,0,1,16,24));
  textAlign(CENTER);
  rectMode(CENTER);
  for (var i = 0; i < displayedTags.length; i++) {
    text(displayedTags[i].name,displayedTags[i].coordinates.x,displayedTags[i].coordinates.y);
  }
  pop();

  //display buttons on canvas
  textAlign(CENTER);
  rectMode(CENTER);
  for (let i = 0; i < buttons.length; i++) {
    const buttonX = buttonMenuCoord.x+buttonWidth/2;
    const buttonY = height+buttonMenuCoord.y-buttonHeight*(i+0.5)-buttonPadding*i;
    fill(8,79,205);
    rect(buttonX, buttonY, buttonWidth, buttonHeight);
    push();
    fill(255);
    // textAlign(CENTER);
    // rectMode(CENTER);
    textSize(map(scale,0,1,12,16));
    text(buttons[buttons.length-i-1].text,buttonX,buttonY+6);
    pop();
  }
}
