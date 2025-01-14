/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
const express = require('express');
const {readFile, access, writeFile} = require("fs/promises")
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

const fileName = "todolists.json"


async function existsFile(file){
  try{
    await access(file)
    return true
  }catch(e){
    return false
  }
}

async function readTodos(file){
  const content =  await readFile(file,"utf-8")
  return content
}

async function writeTodos(file, cnt){
  await writeFile(file,JSON.stringify(cnt))
}

async function readFromFile(){
  let todosList
  try{
    const exists = await existsFile(fileName)
    if (exists){
      todosList = await readTodos(fileName)
      if(todosList.length ==0){
        return []
      }
      todosList = JSON.parse(todosList)
    }else{
      await writeTodos(fileName,"[]")
      todosList=[]}
    }
    catch(e){
      console.log(e)
    }
    return todosList
}

app.get("/todos",async (req,res)=>{
  let todosList = await readFromFile()
  
  res.send(todosList)
})


app.get("/todos/:id",async (req,res)=>{
  let todosList = await readFromFile()

  const found = todosList.find((item)=>item.id == req.params.id)
      if(!found){
        res.sendStatus(404)
      }
      res.send(found)
})

app.post("/todos",async (req,res)=>{
  const id = uuidv4()
  let todo = {
    "title":  req.body.title,
    "description":  req.body.description,
    "completed":  false,
    "id": id
  }
  let todosList = await readFromFile()
  todosList.push(todo)
  await writeTodos(fileName,todosList)
  res.status(201).send({id})
})

app.put("/todos/:id",async(req,res)=>{
  let todosList = await readFromFile()
  const found = todosList.find((item)=> item.id === req.params.id)
  if(!found)
    return res.sendStatus(404)
    
  found.title = req.body.title ? req.body.title : found.title
  found.description = req.body.title? req.body.title: found.description
  found.completed = req.body.completed ? req.body.completed: found.completed

  const index = todosList.indexOf((item)=>item.id==found.id)
  todosList[index]=found
  await writeTodos(fileName,todosList)
  res.sendStatus(200)
})

app.delete("/todos/:id",async(req,res)=>{

  let todosList = await readFromFile()
  const found = todosList.find((item)=> item.id === req.params.id)

  if(!found)
    return res.sendStatus(404)

  todosList = todosList.filter(item=> item.id != req.params.id)
  await writeTodos(fileName,todosList)
  res.sendStatus(200)
})


module.exports = app;

// app.listen("8080")