let tasks={};//what task and stores those tasks 
                let positions={todo:[],inprogress:[],completed:[]}///stores arrays of the tasks and remembers their positions or orders
                let taskid=0;//unique for each task increases with each task like task1 and 2
                function addtask(){
                    let text=document.getElementById("input-task").value;//gets the value typed inside the box
                    if (text==""){
                        alert("user has not inputed a task")//in case the user has not inputteda a task
                        return;
                    }
                    taskid++; 
                    let id="task-"+taskid; //makes a new unique id for tasks like task-1 by incrementing the task
                    let taskbox=document.createElement("div");//creating a new div 
                    taskbox.className="task" //class name is task
                    taskbox.setAttribute("data-id",id);//stpres the task unique id gives a new value to an attribute called data id so it will look like this <div class="task" data-id="task-3"
                    let checkbox=document.createElement("input");//creating new checkbox input
                    checkbox.type="checkbox";//used to select a task later
                    let putit=document.createElement("span");//creates a input fills it with whatever user typed 
                    putit.textContent=text;//the text typed earlier was stored
                    let editbtn=document.createElement("button");
                    editbtn.innerText="edit";
                    editbtn.className="editbtn"
                    
                    editbtn.onclick=function(){
                        edit(putit,editbtn)
                    }
                    
                    taskbox.appendChild(checkbox);
                    taskbox.appendChild(putit);//added the chckbox and text span inside the box div
                    taskbox.appendChild(editbtn);
                    document.getElementById("todo").appendChild(taskbox);

                    tasks[id]={task:text,position:"todo"}; //here task is an object that stores information about every task **
                    //ex tasks["task-1"]={task:"something" position:todo};
                    positions.todo.push(id);//positions={todod:[task-1],inprogress:[],completed:[]};
                    document.getElementById("input-task").value="";//empties the taskbox in add task 
                    
                }
                function edit(span,button){// passes both elements span and the button element  makes function operate only on the particular
                    //task row
                    let input=document.createElement("textarea");
                    input.type="text";
                    input.className="input1"
                    input.value=span.textContent//copies the span text into input's value
                    span.replaceWith(input)//replace span node with input node
                    input.focus()//moves the cursor into new input automatically instead of manually clicking it
                    button.innerText="save"//changes the name of the button from edit to save
                    button.onclick=function(){
                        savebtn(input,button)//calls the savebtn function to make its functionality
                    }
                }
                function savebtn(input,button){//passes element input and button
                    let span=document.createElement("span");//creates element span
                    span.type="text";
                    span.textContent=input.value;//copies the input content into span
                    input.replaceWith(span);//replaces input with span
                    button.innerText="edit";//changes the name of save to edit
                    button.onclick=function(){
                        edit(span,button);//onclicking calls the previous function
                    }
                }
                

                //moving tasks 
                function movtask(targetColumnId){//takes one argument that is which column to move to here we take target columnid as parameter
                    let selectedTasks=document.querySelectorAll(".task input:checked");//finds all checkboxwes that are checked
                    selectedTasks.forEach(function(checkbox){//loops over each checkbox
                        checkbox.checked=false;//unticks it first when moving
                        let taskBox=checkbox.parentElement;//finds the parent div of the check box
                        let id=taskBox.getAttribute("data-id");
                        let currentposi=tasks[id].position;//tells us what task is and what is it's id and tell us its position as described in an array above
                        if(currentposi=="todo" && targetColumnId==="inprogress"){
                            document.getElementById("inprogress").appendChild(taskBox);
                            tasks[id].position="inprogress";
                            positions.inprogress.push(id);
                            let pos=positions[currentposi]
                            pos.splice(pos.indexOf(id), 1);
                            console.log(positions);
                        }
                        else if(currentposi==="inprogress"&&targetColumnId==="completed"){
                            document.getElementById("completed").appendChild(taskBox);
                            tasks[id].position="completed";
                            positions.completed.push(id);
                            let pos=positions[currentposi]
                            pos.splice(pos.indexOf(id), 1);
                            console.log(positions)
                        }
                        else if(currentposi==="completed" && targetColumnId==="inprogress"){
                            alert("the tasks cant be moved from completed to in progress")
                        }
                        else if(currentposi==="todo"&&targetColumnId==="completed"){
                            alert("the tasks cant be moved directly from to do to the completed")
                        }
                        checkbox.checked=false;
                    })
                    }
                    
                    function removetask(){
                        let selectedTasks=document.querySelectorAll(".task input:checked");
                        selectedTasks.forEach(function(checkbox){
                            let taskBox=checkbox.parentElement;
                            taskBox.remove();
                    })}