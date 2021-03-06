//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejsLint = require('ejs-lint');
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect('mongodb://localhost:27017/toDoListDB', {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a value"]
  }
});
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcome to your to-do list"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<<-- click here to delete an item"
});
const defaultItems = [item1, item2, item3];
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
// const day = date.getDate();
app.get("/", function(req, res) {
Item.find({}, function(err, foundItem) {
    if (!err) {
      if (foundItem.length === 0) {
        Item.insertMany(defaultItems, function(err) {
            if (!err) {
              console.log("record updated successfully");
              res.redirect("/");
            }
          });
      }
     else {
       res.render("list", {
         listTitle: "Today",
         newListItems: foundItem
       });
     }
    }
    else{
      console.log(err);
    }
  });
});
app.post("/", function(req, res) {
  const task = new Item({
    name: req.body.newItem
  });
    console.log(req.body.submit);
    if (req.body.submit !== "Today"){
      List.findOne({name:req.body.submit}, function(err, found){
        if (!err){
         found.items.push(task);
         found.save();
         res.redirect("/"+ req.body.submit);
        }
      });
    }
    else{
      task.save();
      res.redirect("/");
    }
});
app.post("/delete", function(req, res){
  const titleToDelete = req.body.checkboxTitle;
  if (titleToDelete === "Today"){
    Item.findByIdAndRemove(req.body.checkbox, function(err){
      if(!err){
        console.log("successfully deleted the record");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:titleToDelete},{$pull:{items:{_id:req.body.checkbox}}}, function(err, found){
      res.redirect("/"+titleToDelete);
    });

  }
});
app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, found){
    if(!err){
      if(found){
        //show its data
        res.render("list", {
          listTitle: found.name,
          newListItems: found.items
        });
      }
      else{
        //create a list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
    }
  });
});
///////////////////////// start server online ///////////////////////////////////////////////////

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }
//
// app.listen(port, function() {
//   console.log("Server started successfully");
// });
///////////////////////// start local server ///////////////////////////////////////////////////
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
