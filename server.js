const  response = require("express");
const express= require("express");
const movies =require("./data.json");
const app =express();

// day 12 updates
const axios =require("axios");
/*
we create .env file to store api key inside him to make
sure our api key is peotected.

Now how to let our server know about api key and read it  ?

    1- a third party library (.env)
    install it (npm install dotenv)

    2- create .env file 

    3- requier dotenv
*/

// read dotenv file
const dotenv =require("dotenv");

//start (configer) the dotenv
dotenv.config();
//process.env >> built in fucn
const APIKEY =process.env.APIKEY;
// console.log(APIKEY);

//Day 13 
/*
 -psql > to open the posteger database
 - \l > to list the databse in table
 - \q > to quite db
 - \c > to connect the table whit  db
 - \d > to show all tables inside db
 -------------------
CREATE DATABASE 'dbName' then \l to see it in the table
*/
// pg  >> connect the db with the server
const pg =require("pg");
const DATABASE_URL= process.env.DATABASE_URL;

//Initalize the connection 
const client = new pg.Client(DATABASE_URL);




function Movie(title, overview, poster_path,id,release_date){
    this.id=id;
    this.title=title;
    this.overview=overview;
    this.release_date=release_date;
    this.poster_path=poster_path;
    
}
//database

app.use(express.json());
app.post("/addMovies",helloAddMovies);
app.get("/getMovies",getVaforiteMovies)

app.get("/",helloMovie);
app.get("/favorit",hellofavorit);
app.get("/trending",helloTrending);
app.get("/search",hellosearch);
app.get ("/getdMov/:i", getMovie)// to get a specific movie from the database
app.put("/updatMovie/:id",updateMovie)//  update comments for a specific movie in the database.
app.delete("/deleteMovie/:id",deleteMovie)
app.get("*",notFoundHandler);

app.use(errorHandler);

function helloMovie(req ,res){
    let arr=[]
    // arr.push(movies.title);
    // arr.push(movies.overview);
    // arr.push(movies.poster_path);
     movies.data.forEach((value) => {
        let theMovie = new Movie( value.id,value.title, value.overview,value.release_date , value.poster_path);
        arr.push(theMovie);
        return res.status(200).json(arr);
    }).catch(error =>{
        errorHandler("Sorry, something went wrong",req,res);
    });  
};

function getMovie(req,res){
    let id =req.params.id;
    const sql = `SELECT * FROM favoritMovies WHERE id=$1;`;
    const value=[id];
    client.query(sql,value).then((result) =>{
        return res.status(200).json(result.rows);
    }).catch(error =>{
        errorHandler(error,req,res);
    }); 
};

function updateMovie(req,res){
    const id = req.params.id;
    const movies = req.body;
    const sql = `UPDATE favoritMovies SET title=$1, overview=$2, release_date=$3, poster_path=$4 WHERE id=$5 RETURNING *; `;
    const value=[movies.title, movies.overview, movies.release_date, movies.poster_path, id]
    client.query(sql,value).then((result)=>{
        return res.status(200).json(result.rows);
    }).catch(error =>{
        errorHandler(error,req,res);
    }); 
};

function deleteMovie(req,res)
{
    const id =req.params.id;
    const sql =`DELETE FROM favoritMovies WHERE id =$1;`;
    const value =[id];
    client.query(sql,value).then(() =>{
        return res.status(204).json({})
    }).catch(error =>{
        errorHandler(error,req,res);
    }); 
};
function helloAddMovies(req,res){
    const mov =req.body;
    // console.log(req.body);
    const sql = `INSERT INTO favoritMovies(title,overview,release_date,poster_path) VALUES($1,$2,$3,$4) RETURNING *`
   const arrvalues=[mov.title,mov.overview,mov.release_date,mov.poster_path];
    client.query(sql,arrvalues).then((result)=>{
        response.status(201).json(result.rows);
    }).catch(error =>{
        errorHandler(error,req,res);
    }); 
};

function getVaforiteMovies(req,res){
    const sql =`SELECT * FROM favMovies`;
    client.query(sql).then((result)=>{
        response.status(200).json(result.rows);
        // console.log(result);
    })
};


function hellofavorit(req,res){
 return res.send("Welcome to Favorite Page")
 .catch(error =>{
    errorHandler("Sorry, something went wrong",req,res);
})
}

function helloTrending(req,res){
    let result = [];
    
    axios.get(`https://api.themoviedb.org/3/trending/all/week?api_key=${APIKEY}&language=en-US`)
   .then(apiResponse =>{
       apiResponse.data.results.map(value =>{ // results>> is the array name in API link (and we shoud change it according to what API link array name)
           let oneMoveDetails =new Movie(value.id,value.title,value.release_date,value.overview,value.poster_path)
           result.push(oneMoveDetails);
       })
       return res.status(200).json(result);
  }).catch(error =>{
      errorHandler("Sorry, something went wrong",req,res);
  })
}

function hellosearch(req,res){
   const search ="The Royal Treatment,";
    let result = [];
    
    axios.get(` https://api.themoviedb.org/3/search/movie?api_key=${APIKEY}&language=en-US&query=${search}`)
   .then(apiResponse =>{
       apiResponse.data.results.map(value =>{ // results>> is the array name in API link (and we shoud change it according to what API link array name)
           let oneMoveSearch =new Movie(value.title || "A/N" ,value.overview || "A/N" ,value.release_date || "A/N" ,value.id || "A/N" ,value.release_date || "A/N")
           result.push(oneMoveSearch);
       })
       return res.status(200).json(result);
  }).catch(error =>{
      errorHandler("Sorry, something went wrong",req,res);
  })

  
}

function notFoundHandler(req,res){
    return res.send("Page Not Found")
}
   
function errorHandler(error,req,res){
    const err ={
        status : 500,
        messge : error
    }
    return res.status(500).send(err);
}



// if every thing is og with database then run the server
client.connect()
.then(()=>{
    app.listen(5000, () => {
        console.log('Listen to port 5000');
    });
});




// app.listen(3000,()=>{
//     console.log("listen to 3000")
// });
