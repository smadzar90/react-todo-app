import React, { Component } from 'react';
import { AiFillPlusSquare, AiFillDelete, AiOutlineCloseCircle } from 'react-icons/ai';
import { BsCheck2Circle, BsCheckCircleFill } from 'react-icons/bs';
import { MdModeEditOutline } from 'react-icons/md';
import { BiSolidAddToQueue, BiSolidMessageSquareEdit } from 'react-icons/bi';
import { format} from 'date-fns';
import './media_styles.css'
import './App.css';

class App extends Component{

  state = {
    todo: "",
    todoObjects: [],
    currTime: new Date(),
    isEditing: localStorage.getItem('edit') || null,
    numOfEdited: parseInt(localStorage.getItem('editedNum')) || 0
  };

  componentDidMount() {
    try {
      const obj = JSON.parse(localStorage.getItem('todos'))
      if(obj !== null) {
      this.setState({todoObjects: obj})
      console.log(obj)
      }
    }
    catch(error) {
      console.log(error)
    }

    this.interval = setInterval(() => {
      this.setState({currTime: new Date()})
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  taskSubmission = (event) => {
    event.preventDefault();
    const task = this.state.todo.trim();

    if(task.length > 0) {
      
      const newTodoObject = {
        id: new Date().toJSON(),
        text: this.state.todo,
        checked: false,
        edited: this.state.todo,
        timesEdited: 0
      }

      this.setState(previousState => ({
        todoObjects: [...previousState.todoObjects, newTodoObject]}), 
        () => { 
          localStorage.setItem('todos', JSON.stringify(this.state.todoObjects))
       });

      this.setState({todo: ""})
    }
    else {
      alert("Enter a valid task!");
      this.setState({todo: ""})
    }
  };

  handleInputChange = (event) => {
    let task = event.target.value
    const firstLetter = task.charAt(0).toUpperCase()
    const rest = task.substring(1)
    task = firstLetter + rest
    this.setState({todo: task})
  };

  handleChecks = (event, todoID) => {
    const newTodos = this.state.todoObjects.filter((todo) => {
      if(todo.id === todoID) {
        todo.checked = event.target.checked;
      }
      return todo;
    });

    this.setState({ todoObjects: newTodos }, () => {
      localStorage.setItem('todos', JSON.stringify(this.state.todoObjects))
    });
  };

  deleteTask = (todoID) => {
    const newTodos = this.state.todoObjects.filter((todo) => {
      if(todo.id === todoID) {
        this.setState({numOfEdited: this.state.numOfEdited - todo.timesEdited}, () => {
          localStorage.setItem('editedNum', this.state.numOfEdited)
        });
      }
      return (
        todo.id !== todoID
      )
    });

    this.setState({ todoObjects: newTodos }, () => {
      localStorage.setItem('todos', JSON.stringify(this.state.todoObjects))
    });
  };

  saveInputText = (event, todoID) => {
    const newTodos = this.state.todoObjects.filter((todo) => {
      if(todo.id === todoID) {
        todo.text = event.target.value.charAt(0).toUpperCase() + event.target.value.substring(1)
      }
      return todo
    });

    this.setState({ todoObjects: newTodos }, () => {
      localStorage.setItem('todos', JSON.stringify(this.state.todoObjects))
    });
  };

  calculateCompletedTasks = () => {
    let sum = 0
    this.state.todoObjects.forEach((todo) => {
      if(todo.checked) {
        sum++
      }
    });

    if(sum > 100) {
      return '100+'
    }
    return sum
  };

  clearAll = () => {
    this.setState({ todoObjects: [], numOfEdited: 0}, () => {
      localStorage.setItem('todos', JSON.stringify(this.state.todoObjects))
      localStorage.setItem('editedNum', 0)
    });
  };

  render() {
    const currentDate = format(this.state.currTime, 'MMMM do, h:mm:ss a')
    const numOfCompletedTasks = this.calculateCompletedTasks()

    console.log(this.state.todoObjects)
    return (
      <div className='split'>
        <div className='main'>
            <div className='heading'>
              <h1><BsCheck2Circle className='checkI'/>My Todos</h1>
              <label className='timeL'>{currentDate}</label>
            </div>
            <form className='addTask' onSubmit={this.taskSubmission} name='submit'>
              <input 
                className='task' type='text' placeholder='Enter a task:' value={this.state.todo}
                onChange={this.handleInputChange}>
              </input>
              <AiFillPlusSquare className='icons'
                onClick={this.taskSubmission}
              />
            </form>
            <div className='box'>
              {this.state.todoObjects.map(todo => (
                <div className='taskArea' key={todo.id}>
                  <input 
                    className='checkbox' type='checkbox' checked={todo.checked} 
                    onChange={(event) =>this.handleChecks(event, todo.id)}>
                  </input>
                  <div className='line'>
                    {this.state.isEditing === todo.id ? 
                      (<div><input 
                      type='text' placeholder='Enter a task:'
                      className='task2' value={todo.text} 
                      onChange={(event) => this.saveInputText(event, todo.id)}></input>
                  </div>) : 
                  (<div>
                    <label 
                      className='taskL' 
                      style={{textDecoration: todo.checked ? 'line-through' : 'none',
                      color: todo.checked ? 'rgb(170, 161, 161)' : 'rgb(70, 68, 68)'}}>
                        {todo.text} 
                    </label>
                  </div>)}
                </div>
                <div className='buttons'>
                  {this.state.isEditing === todo.id ? 
                    <AiOutlineCloseCircle 
                      className='edit2'
                      onClick={() => {
                      if(todo.text.length === 0) {
                        alert("Enter a valid task!")
                      }
                      else {
                        this.setState({ isEditing: null }, () => {
                          localStorage.setItem('edit', null);
                        });
                      }
                      if(todo.text !== todo.edited) { //modifi
                        this.setState({ numOfEdited: this.state.numOfEdited + 1}, () => {
                          localStorage.setItem('editedNum', this.state.numOfEdited)
                          todo.edited = todo.text  
                          todo.timesEdited = todo.timesEdited + 1
                          localStorage.setItem('todos', JSON.stringify(this.state.todoObjects))
                        });
                      }}}
                    /> :
                    <MdModeEditOutline 
                      className='edit2'
                      onClick={() => { this.setState({isEditing: todo.id}, () => {
                        localStorage.setItem('edit', todo.id);
                      });
                    }}
                    />}
                    <AiFillDelete className='edit' 
                      onClick={() => this.deleteTask(todo.id)}
                    />
                  </div>
                </div>))}
             </div>
            <div className='bottom'>
              <button className='clearAll' onClick={this.clearAll}>Clear All</button>
            </div>
            </div>
              <div className='info'>
                  <h2>Create and save your tasks</h2>
                  <hr></hr>
                  <p>The My Todos is a simple and efficient tool for managing tasks and staying organized. 
                  To use it, start by adding your tasks or to-do items to the list. You can mark them as 
                  completed when finished, and you can also edit or delete tasks as needed. Additionally, 
                  the app provides features like statistics, and priorities to help you 
                  stay on top of your tasks and boost productivity.</p>
                  <div className='boxes'>
                    <div className='bb'>
                      <div className='titles'>
                        <label>Added</label>
                        <BiSolidAddToQueue className='titleIcons'/>
                      </div>
                      <div className='remain'>
                        <div className='sq'>
                          {this.state.todoObjects.length > 100 ? '100+' : 
                          this.state.todoObjects.length}
                        </div>
                        <label className='items'>Items</label>
                      </div>
                    </div>
                    <div className='bb'>
                      <div className='titles'>
                        <label>Completed</label>
                        <BsCheckCircleFill className='titleIcons'/>
                      </div>
                      <div className='remain'>
                        <div className='sq'>{numOfCompletedTasks}
                        </div>
                        <label className='items'>Items</label>
                      </div>
                    </div>
                    <div className='bb'>
                      <div className='titles'>
                        <label>Edited</label>
                        <BiSolidMessageSquareEdit className='titleIcons'/>
                      </div>
                      <div className='remain'>
                        <div className='sq'>
                          {this.state.numOfEdited > 100 ? '100+' : this.state.numOfEdited} 
                        </div>
                        <label className='items'>Items</label>
                      </div>
                    </div>
                  </div>
                </div>
        </div>);}}

export default App;
