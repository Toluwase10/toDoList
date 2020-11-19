const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname + '/date.js'); //import local module date.js

const app = express();
const port = 3000;

//connect to database
mongoose.connect('mongodb+srv://xxxxxxxxxxxx', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

const itemsSchema = {
  name: String
};

const customListSchema = {
  name: String,
  items: [itemsSchema]
};

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", customListSchema);

//initialize items with 3 default tasks
const item1 = new Item({
  name: "Welcome to your to-do List"
});

const item2 = new Item({
  name: "Click the + button to add an item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];


app.set("view engine", "ejs"); //tell the app to use ejs templating

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

//runs when the home page is run or being redirected to
app.get("/", function(req, res){
  today = date.getDate(); // call date function in local module date.js

  Item.find({}, function(err, result){
    if (result.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        res.redirect("/");
      });
    } else {
      res.render("list", {listTitle: today, newEntries: result}); //currentDay and newEntries are variables used in the list.ejs file
    }

  });
});



app.get("/:customListName", function(req, res){
  customListName = _.capitalize(req.params.customListName); //converts e.g /home to /Home
  List.findOne({name: customListName}, function (err, result){
    if (!err && !result) {
      //create a new list with the default items
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save(function(err, result){
        res.redirect("/" + customListName);
      });

    }
    else{
      //show an existing list
      res.render("list", {listTitle: result.name, newEntries: result.items});
    }
  });
});


//retrieve data in the form, redirect the data to the home or work route which then sends it to the list.ejs file
app.post("/", function(req, res){
  const itemName = req.body.newItem; //identifies the new item added
  const customListName = req.body.customItem; //identifies the page where the added item was placed
  const item = new Item({
    name: itemName
  });

  if (customListName === date.getDate()) { //checks if it is from the home page
    //save the new item to the Item collectio and go back to the home page
    item.save(function(err, result){
      res.redirect("/");
    });
  }
  else {
    List.findOne({name: customListName}, function(err, result){
      result.items.push(item);
      result.save(function(err, result){
        res.redirect("/" + customListName);
      });
    });
  }
});


app.post("/delete", function(req, res){
  const itemToDelete = req.body.deleteItem; //identifies the item selected for deletion
  const customListToDelete = req.body.deleteCustomItem; //identifies the page where the deletion is from

  //checks if the title of the to-be deleted item is from the home route
  if (customListToDelete === date.getDate()) {
    Item.deleteOne({_id: itemToDelete}, function(err, result){
      //pass
    });
    res.redirect("/");
  }
  // from the custom list route; need to identify the custom page and the exact item to be deleted
  else {
    List.findOneAndUpdate({name: customListToDelete}, {$pull: {items: {_id: itemToDelete}}}, function(err, result){
      if (!err) {
        res.redirect("/" + customListToDelete);
      }
    });
  }
});




//wait for a connection
app.listen(process.env.PORT || port, function(){
  console.log("Server is listening on port " + port);
});
