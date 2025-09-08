                let tasks={};//what task and stores those tasks 
                let positions={todo:[],inprogress:[],completed:[]}///stores arrays of the tasks and remembers their positions or orders
                let taskid=0;//unique for each task increases with each task like task1 and 2
                
                function escapeXml(unsafe){
                    return unsafe.replace(/[<>&'""]/g,c=>{
                        switch (c){
                            case '<': return '&lt;';
                            case '>': return '&gt;';
                            case '&': return '&amp;';
                            case '\'': return '&apos;';
                            case '"': return '&quot;';
                        }
                    })
                }//function escapeXml(unsafe) replaces certain special characters in a string with their corresponding XML escape codes to make the string safe for use in an XML documen
                //prevents the string from accidentally breaking XML/HTML structure
                function toXML(tasks,positions){ //takes two arguments tasks and positions
                    //we take positions as well since it has order of how tasks are in each column
                    //when generating XML we want tasks in same order as the user sees on the board
                    //positions is like the "view" of the board whereas tasks is like the data details without it we can't guarantee XML matches what the user sees

                    let xml=`<TaskBoard>\n`//initializing the string variable xml
                    //<Taskboard> is root element like a container for all tasks
                    //n is newline character which makes XML easier to read 
                    for (let col of ["todo", "inprogress" ,"completed"]){//goes through each column in the board
                        //col will take the values "todo","inprogress","completed"
                        let tag=col.charAt(0).toUpperCase()+col.slice(1);//returns the first character of the string converts it to uppecase
                        //takes the rest of the column name and adds it together
                        xml +=`<${tag}>\n`;//adds a column XML opening tag 
                        positions[col].forEach(id =>{//gives the array of task ids in the current ccolumn
                            let text=tasks[id].task;//gets the task text
                            xml +=`<Task>${escapeXml(text)}</Task>\n`
                            //converts special character to safe XML format
                            //xml+= adds an XML element for the taskex<Task>buy something</Task>

                        });
                        xml+=`</${tag}>\n`;//closes that tag after all tasks in column are added
                        
                    }
                    xml+=`</TaskBoard>`;//closes root XMl  after all columns are processed
                    return xml;// returns complete xml as string which can be saved in local storage or downloaded as afile
                }

                function fromXML(xmlStr){
                    let parser=new DOMParser();//since dom parser can read a string of XML and turn it into a structured document basically understands XML string
                    let xmlDoc=parser.parseFromString(xmlStr,"text/xml");//this method tells the parser to interpret it as XML
                    //basically this converts XML string into xmlDoc
                    //xml Doc behaves like a HTML doc wwhere you can ask for tags i.e clean xml doc i.e walk through it like a tree
                    let newTasks={};//holds the tasks
                    let newPositions={todo:[], inprogress:[], completed:[]};//like positions to store ordered arrays of tasks ids
                    //we dont reuse tasks and positions of old one and built new ones cuz
                    //old data might be there and we want the new data to be safely inserted into new one so you just overwrite instead of messing with previous ones
                    let nextId=0;
                    function loadColumn(tag,key){//takes two inputs tag(like the xml tag to look for e.g-Todo)
                        //key is the property name we use in js data structure
                        //connects XML tags with js object keys
                        let colNode=xmlDoc.getElementsByTagName(tag)[0];//finds all elements ion XML with that tag name 0 means take first
                        if(!colNode) return;//if not just stop instead of crashing
                        //ex <Todo><Task>BUy gorcery</Task></Todo>
                        let taskNodes=colNode.getElementsByTagName("Task");//finds all Task elements inside th column (colNode)
                        //like e.g from above
                        for(let taskNode of taskNodes){//loops over each Task in that column
                            nextId++;
                            //incereases the ID counter by 1 for each task found and every one gets a unique number
                            let id="task-"+nextId;
                            let text=taskNode.textContent;//gets text inside task element
                            newTasks[id]={task:text,position:key};//adds entries in newTasks object
                            newPositions[key].push(id);//adds this Task's ID to the correct column list in newPositions

                        }
  
                    }
                    loadColumn("Todo","todo");
                    loadColumn("Inprogress","inprogress");
                    loadColumn("Completed","completed");
                            
                    return{tasks:newTasks,positions:newPositions,nextId};
                }
                

                function createTaskElement(id,text,pos){//takes id text and pos
                    let taskbox=document.createElement("div");
                    taskbox.className="task";
                    taskbox.setAttribute("data-id",id);
                    //stores id inside a custom HTML attribute (data-id="task-1") so you can find which task belongs to whom
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";

                    let putit = document.createElement("span");
                    putit.textContent = text;

                    let editbtn = document.createElement("button");
                    editbtn.innerText = "edit";
                    editbtn.className = "editbtn";
                    editbtn.onclick = function () { edit(putit, editbtn, id); };

                    taskbox.appendChild(checkbox);
                    taskbox.appendChild(putit);
                    taskbox.appendChild(editbtn);

                    document.getElementById(pos).appendChild(taskbox);
                    

                }
                function saveToLocal(){
                    let xml=toXML(tasks,positions);//calls toXML which build a formatted XML string from the tasks and positions objects since local storage only stores strings
                    localStorage.setItem("kanbanXML",xml);//saves that XML string into the browser's loacla storage under the key "kanbanXML"
                }

                function loadFromLocal(){
                    let xml=localStorage.getItem("kanbanXML");//reads the sttring of the key kanbanXML if nothing saved then returns null
                    if(!xml) return;
                    let {tasks:savedTasks,positions: savedPositions,nextId}=fromXML(xml);
                    //calls fromXML(xml) which parses xml string builds fresh new tasks,positions and returns nextId
                    //LEFT hand is for like take taks property and save it in local variable saved tasks and so on
                    //rename it to avoid overwriting existing globals 
                    tasks=savedTasks;positions=savedPositions;taskid=nextId;
                    //replaces the global variables with freshly parsed ones
                    document.getElementById("todo").innerHTML = "<h2>To do</h2>";
                    document.getElementById("inprogress").innerHTML = "<h2>In-Progress</h2>";
                    document.getElementById("completed").innerHTML = "<h2>Completed</h2>";
                    //clearing existing tasks from DOM
                    for(let id in tasks){
                        createTaskElement(id,tasks[id].task, tasks[id].position);//loops over every key in tasksobject
                        //and calls createTaskElement which builds dom elemnts and append them into the corrext column on the page
                    }
                }

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
                    saveToLocal();
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
                    let taskBox=button.parentElement;//finds the task wtapper DOM node
                    let id=taskBox.getAttribute("data-id");//reads the task unique id
                    tasks[id].task=span.textContent;//assigns edited text to it
                    button.innerText="edit";//changes the name of save to edit
                    button.onclick=function(){
                        edit(span,button);//onclicking calls the previous function
                    }
                    saveToLocal();
                    console.log(tasks);
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
                            console.log(tasks);
                        }
                        else if(currentposi==="inprogress"&&targetColumnId==="completed"){
                            document.getElementById("completed").appendChild(taskBox);
                            tasks[id].position="completed";
                            positions.completed.push(id);
                            let pos=positions[currentposi]
                            pos.splice(pos.indexOf(id), 1);
                            console.log(tasks)
                        }
                        else if(currentposi==="completed" && targetColumnId==="inprogress"){
                            alert("the tasks cant be moved from completed to in progress")
                        }
                        else if(currentposi==="todo"&&targetColumnId==="completed"){
                            alert("the tasks cant be moved directly from to do to the completed")
                        }
                        checkbox.checked=false;
                    })
                    saveToLocal();
                    }
                    
                    function removetask(){
                        let selectedTasks=document.querySelectorAll(".task input:checked");
                        selectedTasks.forEach(function(checkbox){
                            let taskBox=checkbox.parentElement;
                            let id=taskBox.getAttribute("data-id");
                            let currentposi=tasks[id].position;//find the current column from the the tasks object

                            let pos=positions[currentposi];
                            pos.splice(pos.indexOf(id),1);
                            
                            delete tasks[id];
                            //remove task form object
                            taskBox.remove();   
                            
                            console.log("updated positions",tasks);
                    });
                    saveToLocal();
                }
                window.onload=function(){
                    loadFromLocal()
                }