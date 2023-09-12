const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { options } = require("mongoose");
const _ = require("lodash"); //use to capitlize the first latter of a string
 
const app = express();
 
app.set("view engine", "ejs");
 
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
 
run();
async function run() {
  try  {
    const url = "mongodb+srv://Admin-sudarsan:Test123@cluster0.7xvkxkf.mongodb.net/todolistDB";//"mongodb+srv://Admin-sudarsan:Test123@cluster0.7xvkxkf.mongodb.net/?retryWrites=true&w=majority";
    mongoose.connect(url); 
 
    const itemsSchema = new mongoose.Schema({
      name: String,
    });
 
    const Item = mongoose.model("Item", itemsSchema);
 
    const item1 = new Item({
      name: "Wake up in early morning",
    });
    const item2 = new Item({
      name: "Brush my teeth",
    });
    const item3 = new Item({
      name: "Learn to code",
    });
 
    const defaultItems = [item1, item2, item3];

    const listSchema = {
      name : String,
      items : [itemsSchema]
    };

    const List = mongoose.model("List", listSchema);
 
    // mongoose.connection.close();
 
    app.get("/", async function (req, res) {
      const foundItems = await Item.find({});
 
      if (!(await Item.exists())) {
        await Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    });
 
     app.post("/", function (req, res) {
       const itemName = req.body.newItem;
       const listName = req.body.list.trim() ;

       const item = new Item({
         name : itemName,
       });
         if(listName === "Today"){
           item.save()
           res.redirect("/");
         }else{
           List.findOne({name : listName})
           .exec().then(function(foundList){   // .exec are is a regular expresion to understand that go to codewithharry youtube chanel
             foundList.items.push(item);
             foundList.save();
             res.redirect("/"+listName);
           })
           .catch(function(err){});
         }
    });


    app.post("/delete", function(req, res){
      const checkedListName = req.body.listName; // main page id name
      const checkedItemId = req.body.checkbox; // main page items id number
   
      if(checkedListName==="Today"){
        //In the default list
        del().catch(err => console.log(err));
   
        async function del(){
          await Item.deleteOne({_id: checkedItemId});
          res.redirect("/");
          //console.log(checkedItemId);
        }
      } else{
        //In the custom list
   
        update().catch(err => console.log(err));
   
        async function update(){
          await List.findOneAndUpdate({name: checkedListName}, {$pull: {items: {_id: checkedItemId}}});
          res.redirect("/" + checkedListName);
          //console.log(checkedListName);
        }
      }
   
    });

app.get("/:customListName",function(req,res){  // to make "customListName" first latter capital install "npm i lodas" in terminal 
  const customListName = _.capitalize([req.params.customListName]); // to use lodas use "_.capitalize([ string name ])" now the that string are allways shows capital 
 
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            //console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});
 
})
 
    app.get("/about", function (req, res) {
      res.render("about");
    });
 
    app.listen(3000, function () {
      console.log("Server started on port 3000");
    });
  } catch (e) {
    console.log(e.message);
  }
}




