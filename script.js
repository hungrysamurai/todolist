// DOM Elements
const { body } = document;
const mainContainer = document.querySelector(".main-container");
const currentListTitle = document.querySelector(".list-heading");
const inputForm = document.querySelector(".form");
const todoInput = document.querySelector(".input");
const currentTodosContainer = document.querySelector(".todos-container");
const overlay = document.querySelector('.overlay');
const allListsButton = document.querySelector('.lists-button');
const allListsContainer = document.querySelector('.all-lists-container');
const listOfListsEl = allListsContainer.querySelector('ul');
const addNewListBtn = document.querySelector('.add-new-list-btn');

// Classes
class ToDoListData {
  constructor(title, todos) {
    this.title = title;
    this.todos = todos;
  }
}

class ToDoItem {
  constructor(text, status) {
    this.text = text;
    this.status = status;
  }
}

class ToDoList {
  constructor(listContainer, titleElement, { title, data }) {

    this.todosContainer = listContainer;
    this.titleElement = titleElement;

    this.todos = [];
    this.todosDOM;

    if (data?.length) {
      data.forEach(todo => {
        this.todos.push(todo);
      });
    }

    this.renderToDOM();
    this.currentSortable;

    // Init title
    this.titleElement.textContent = title;
    this.title = title;
    this.addTitleListeners();

  }
  // Change current title
  changeTitle(text) {
    this.titleElement.textContent = text;
    return text;
  }

  addTitleListeners() {
    this.titleElement.addEventListener('input', (e) => {
      this.title = this.changeTitle(e.target.textContent);

      if (!this.title) {
        // this.title = this.changeTitle('Undefined list');
        alert('Добавьте название списка!')
        return;
      }

      // Check if list with identical name exist
      let collisions = JSON.parse(localStorage.getItem('todoList')).filter(el => el.title === this.title);
      if (collisions.length === 2) return

      console.log(collisions);
      // Update title of current list in localStorage
      this.updateLSTitle(this.title);
    });

    this.titleElement.addEventListener('keydown', (e) => {
      if (e.target.textContent.length > 40 && e.keyCode != 8) {
        e.preventDefault();
      }
    });
  }

  // Add new ToDo
  addNewToDo(text) {
    // Check if there text at all
    if (!text) return;

    // Check if text already exist in list
    if (this.todos.find(el => el.text === text)) return;

    this.todos.push(new ToDoItem(text, 'active'));

    this.updateLSToDos();

    this.renderToDOM();
  }

  // Delete toDo by index
  deleteToDo(index) {
    this.todos.splice(index, 1);
    this.updateLSToDos();
    this.renderToDOM();
  }

  // Mark toDo as done
  markAsDone(index, el) {
    // Check if toDo is active
    if (this.todos[index].status === 'active') {
      el.querySelector('i').className = 'far fa-light fa-circle-check'
      el.className = 'todo done';
      this.todos[index].status = 'done';
    } else {
      el.querySelector('i').className = 'far fa-light fa-circle'
      el.className = 'todo';
      this.todos[index].status = 'active';
    }
    this.updateLSToDos();
  }

  renderToDOM() {

    // Reset container
    this.todosContainer.innerHTML = '';

    // Place each todo in place
    this.todos.forEach((todo, i) => {
      this.todosContainer.append(this.createDOMElement(todo, i));
    });
    this.addClickEvents();
    this.addDragEvents();
  }

  createDOMElement(todo, index) {
    const { text, status } = todo;

    const container = document.createElement("div");
    container.className = status === 'active' ? 'todo' : 'todo done';

    container.dataset.index = index;
    container.innerHTML = `
        <button class="check-button">
           <i class="far fa-light ${status === "active" ? 'fa-circle' : 'fa-circle-check'}"></i>
        </button>

        <div class="todo-text">
        <p>${text}</p>
        </div>

        <button class="trash-button">
          <i class="fas fa-solid fa-trash-can"></i>
        </button>
`;
    return container;
  }

  addClickEvents() {
    this.todosDOM = this.todosContainer.querySelectorAll('.todo');
    this.todosDOM.forEach(todoEl => {

      const deleteBtn = todoEl.querySelector('.trash-button');
      const completeBtn = todoEl.querySelector('.check-button');

      deleteBtn.addEventListener('click', () => {
        this.deleteToDo(todoEl.dataset.index);
      })

      completeBtn.addEventListener('click', (e) => {
        this.markAsDone(todoEl.dataset.index, todoEl)
      })

    });
  }

  addDragEvents() {
    // Init Sortable for list
    this.initSortable();
    // Add events
    this.todosDOM.forEach(todoEl => {
      todoEl.addEventListener("drop", () => {
        // Re arrange array of elements in todos array according to current DOM position
        this.todos = this.newSort();

        // Re paint the DOM, init with new arranged data
        this.updateLSToDos();
        this.renderToDOM();
      })
    })
  }

  // Init Sortable object from external library
  initSortable() {
    this.currentSortable = new Sortable(this.todosContainer, { animation: 350 });
  };

  // Re arrange array
  newSort() {

    let sorted = [];
    const toDosInDOM = [...this.todosContainer.querySelectorAll('.todo .todo-text p')];

    toDosInDOM.forEach(item => {
      let todoEl = this.todos.find(el => el.text === item.textContent);
      sorted.push(todoEl);
    });

    return sorted;
  }

  exportData() {
    let title = this.title;
    let data = this.todos;
    return new ToDoListData(title, data);
  }

  updateLSTitle(newTitle) {
    // Get current list in localStorage
    const currentList = JSON.parse(localStorage.getItem('todoList_active'));

    // Parse localStorage
    const allLists = JSON.parse(localStorage.getItem('todoList'));

    // Find corresponding object in parsed localStorage
    let activeList = allLists.find(list => list.title === currentList);

    // Set title in parsed localStorage
    activeList.title = newTitle;

    // Update localStorage properties
    localStorage.setItem('todoList', JSON.stringify(allLists))
    localStorage.setItem('todoList_active', JSON.stringify(newTitle))
  }

  updateLSToDos() {
    // Get current list in localStorage
    const currentList = JSON.parse(localStorage.getItem('todoList_active'));

    // Parse localStorage
    const allLists = JSON.parse(localStorage.getItem('todoList'));

    // Find corresponding object in parsed localStorage
    let activeList = allLists.find(list => list.title === currentList);

    // Reset toDos in current list in LS
    activeList.todos = [];
    // Push all todos to list
    this.todos.forEach(todo => activeList.todos.push(todo));
    // Set localStorage
    localStorage.setItem('todoList', JSON.stringify(allLists));
  }
}


// Init
let currentList;

// Get items from localStorage
if (!localStorage.getItem('todoList')) {

  currentList = new ToDoList(currentTodosContainer, currentListTitle, { title: 'Новый список дел' });

  localStorage.setItem('todoList', JSON.stringify([currentList.exportData()]));
  localStorage.setItem('todoList_active', JSON.stringify(currentList.title));

  // Add new todo to current list
  inputForm.addEventListener("submit", activateForm);

} else {

  const savedLists = JSON.parse(localStorage.getItem('todoList'));

  // Find active list
  const activeListSaved = JSON.parse(localStorage.getItem('todoList_active'));
  let activeList = savedLists.find(list => list.title === activeListSaved);

  // Set current list to active list
  currentList = new ToDoList(currentTodosContainer, currentListTitle, { title: activeList.title, data: activeList.todos });

  // Add new todo to current list
  inputForm.addEventListener("submit", activateForm);
}

// Init list of lists
function updateListOfLists() {
  listOfListsEl.innerHTML = '';

  const listOflists = JSON.parse(localStorage.getItem('todoList'));

  listOflists.forEach(list => {
    const { title } = list;
    const listElement = document.createElement('li');
    listElement.textContent = title;

    if (JSON.parse(localStorage.getItem('todoList_active')) === title) {
      listElement.classList.add('active');
    }
    listElement.addEventListener('click', changeList)
    listOfListsEl.appendChild(listElement);
  });
}

currentListTitle.addEventListener('input', updateListOfLists);
updateListOfLists();



allListsButton.addEventListener('click', () => {
  overlay.classList.toggle('hidden');
  allListsContainer.classList.toggle('hidden');
  body.classList.toggle('no-scroll')
})


addNewListBtn.addEventListener('click', () => {
  // Parse current current localStorage
  const currentStorage = JSON.parse(localStorage.getItem('todoList'));
  console.log(currentStorage);
  // Init new list
  let newList = new ToDoListData('Новый список дел', []);

  // Check for name
  if (currentStorage.find(list => list.title === newList.title)) return;

  currentStorage.push(newList);

  currentList = new ToDoList(currentTodosContainer, currentListTitle, { title: newList.title, data: newList.todos });


  localStorage.setItem('todoList', JSON.stringify(currentStorage));
  localStorage.setItem('todoList_active', JSON.stringify(currentList.title));
  updateListOfLists();
  todoInput.value = "";
})


function changeList(e) {

  const targetList = e.target.textContent;
  const currentStorage = JSON.parse(localStorage.getItem('todoList'));

  const dataToLoad = currentStorage.find(list => list.title === targetList);
  console.log(dataToLoad);

  currentList = new ToDoList(currentTodosContainer, currentListTitle, { title: dataToLoad.title, data: dataToLoad.todos });
  localStorage.setItem('todoList_active', JSON.stringify(currentList.title));
  updateListOfLists();
  todoInput.value = "";

}

function activateForm(e) {
  e.preventDefault();

  currentList.addNewToDo(todoInput.value);
  todoInput.value = "";
}


// currentList = new ToDoList('Новый список задач', currentTodosContainer, currentListTitle);

// // Add new todo to current list
// inputForm.addEventListener("submit", (e) => {
//   e.preventDefault();

//   currentList.addNewToDo(todoInput.value);
//   todoInput.value = "";
// });
