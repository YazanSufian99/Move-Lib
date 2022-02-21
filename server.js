const { response } = require("express");
const express= require("express");
const movies =require("./data.json");
const app =express();

app.get("/",helloMovie);
app.get("/favorit",hellofavorit);
app.get("*",notFoundHandler);

function helloMovie(req ,res){
    let arr=[]
    arr.push(movies.title);
    arr.push(movies.overview);
    arr.push(movies.poster_path);
    return res.status(200).json(arr)   
}

function hellofavorit(req,res){
 return res.send("Welcome to Favorite Page")
}

function notFoundHandler(req,res){
    return res.send("Page Not Found")
}
   




app.listen(3000,()=>{
    console.log("listen to 3000")
});