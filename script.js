// DOM Elements
const { body } = document;
const mainContainer = document.querySelector(".main-container");
// const titleContainer = document.querySelector(".list-heading");
const titleContainer = document.querySelector(".list-container");
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
    this.id = Math.floor(Math.random() * 100000);
  }
}

class ToDoItem {
  constructor(text, status) {
    this.text = text;
    this.status = status;
  }
}

class ToDoList {
  constructor(listContainer, titleContainer, listData) {
    const { title, todos, id } = listData;
    // Create editable title element for current list


    this.todosContainer = listContainer;
    this.titleElement = this.createTitleElement(titleContainer);
    this.todosDOM;

    this.id = id;
    this.todos = [];

    if (todos?.length) {
      todos.forEach(todo => {
        this.todos.push(todo);
      });
    }

    this.renderToDOM();
    this.currentSortable;

    // Init title
    this.titleElement.textContent = title;
    this.title = title;
    this.addTitleListeners();
    // Set selection and focus on title
    let range = new Range();
    range.setStartBefore(this.titleElement.firstChild);
    range.setEndAfter(this.titleElement.firstChild);

    document.getSelection().removeAllRanges();
    document.getSelection().addRange(range);

    this.titleElement.focus()

  }

  createTitleElement(titleContainer) {
    titleContainer.innerHTML = '';

    const newTitleEl = document.createElement('h2');
    newTitleEl.classList.add('list-heading');
    newTitleEl.setAttribute('contenteditable', true);

    titleContainer.append(newTitleEl);

    return newTitleEl;
  }

  // Change current title
  changeTitle(text) {
    this.titleElement.textContent = text;
    return text;
  }

  addTitleListeners() {
    this.titleElement.addEventListener('input', (e) => {
      // console.log(e);
      this.title = this.changeTitle(e.target.textContent);
      // console.log(this);
      if (!this.title) {
        // this.title = this.changeTitle('Undefined list');
        alert('Добавьте название списка!')
        return;
      }

      // Check if list with identical name exist
      // let collisions = JSON.parse(localStorage.getItem('todoList')).filter(el => el.title === this.title);
      // if (collisions.length === 2) return

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

  updateLSTitle(newTitle) {
    // Parse localStorage
    const allLists = JSON.parse(localStorage.getItem('todoList'));

    // Find corresponding object in parsed localStorage
    let activeList = allLists.find(list => list.id === this.id);

    // Set title in parsed localStorage
    activeList.title = newTitle;

    // Update localStorage properties
    localStorage.setItem('todoList', JSON.stringify(allLists))
    localStorage.setItem('todoList_active', JSON.stringify(activeList.id));
  }

  updateLSToDos() {
    // Parse localStorage
    const allLists = JSON.parse(localStorage.getItem('todoList'));

    // Find corresponding object in parsed localStorage
    let activeList = allLists.find(list => list.id === this.id);

    // Reset todos in parsed version of localStorage
    activeList.todos = [];

    // Push all todos to parsed version of localStorage
    this.todos.forEach(todo => activeList.todos.push(todo));

    // Set localStorage
    localStorage.setItem('todoList', JSON.stringify(allLists));
  }
}

// Init
let currentList;
let allTitles = [];

// Get items from localStorage
if (!localStorage.getItem('todoList')) initLocalStorage()
else loadLocalStorage();

// Events listener on editable title
mainContainer.addEventListener('input', (e) => {
  if (e.target === currentList.titleElement) {
    updateListOfLists();
  }
});

// Reveal/hide all lists
allListsButton.addEventListener('click', () => {
  overlay.classList.toggle('hidden');
  allListsContainer.classList.toggle('hidden');
  body.classList.toggle('no-scroll');
})


addNewListBtn.addEventListener('click', addNewList);

// Init list of lists
function updateListOfLists() {
  listOfListsEl.innerHTML = '';

  const parsed = JSON.parse(localStorage.getItem('todoList'));

  parsed.forEach(list => {
    const { title, id } = list;
    const listElement = document.createElement('div');
    listElement.classList.add('list-item');

    const listTitleText = document.createElement('span');
    listTitleText.classList.add('list-title');
    listTitleText.dataset.listid = id;
    listTitleText.textContent = title;

    listTitleText.addEventListener('click', (e) => {
      changeList(e.target.dataset.listid)
    });

    if (JSON.parse(localStorage.getItem('todoList_active')) === id) {
      listTitleText.classList.add('active');
    }

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-solid fa-trash-can';
    deleteIcon.dataset.listid = id;

    deleteIcon.addEventListener('click', deleteList)

    listElement.append(listTitleText, deleteIcon);


    listOfListsEl.appendChild(listElement);

  });
}

function addNewList() {
  // Parse current current localStorage
  const parsed = JSON.parse(localStorage.getItem('todoList'));

  // Init new list
  const newList = new ToDoListData('Новый список дел', []);

  // Check for name
  // if (parsed.find(list => list.title === newList.title)) {
  //   console.log(allTitles);
  //   const coincidencesArray = allTitles.find(title => title[0] === newList.title);

  //   newList.title = `${newList.title} ${coincidencesArray.length + 1}`;

  //   coincidencesArray.push(newList.title)
  // }

  parsed.push(newList);

  currentList = new ToDoList(currentTodosContainer, titleContainer, newList);

  localStorage.setItem('todoList', JSON.stringify(parsed));
  localStorage.setItem('todoList_active', JSON.stringify(newList.id));

  updateListOfLists();
  todoInput.value = "";
}

function changeList(id) {

  const targetID = id;
  const parsed = JSON.parse(localStorage.getItem('todoList'));

  const targetList = parsed.find(list => list.id === +targetID);

  currentList = new ToDoList(currentTodosContainer, titleContainer, targetList);

  localStorage.setItem('todoList_active', JSON.stringify(currentList.id));

  updateListOfLists();
  todoInput.value = "";

}

function deleteList(e) {

  const targetID = e.target.dataset.listid;

  const parsed = JSON.parse(localStorage.getItem('todoList'));
  const targetList = parsed.find(list => list.id === +targetID);
  const index = parsed.indexOf(targetList);

  if (currentList.id === targetList.id) {
    if (parsed.length - 1 > 0) {
      let prevID = parsed[index - 1].id;
      changeList(prevID)
    }
  }

  parsed.splice(index, 1);

  if (parsed.length === 0) {
    initLocalStorage();
  } else {
    localStorage.setItem('todoList', JSON.stringify(parsed));
  }
  updateListOfLists();
}

function initLocalStorage() {
  // Init new empty list data structure
  const newListData = new ToDoListData('Новый список дел', []);

  // Set initial data in localStorage
  localStorage.setItem('todoList', JSON.stringify([newListData]));
  localStorage.setItem('todoList_active', JSON.stringify(newListData.id));

  // Init object in DOM
  currentList = new ToDoList(currentTodosContainer, titleContainer, newListData);

  // Activate input form
  inputForm.addEventListener("submit", activateForm);

  updateListOfLists();
}

function loadLocalStorage() {
  // Parse localStorage
  const parsed = JSON.parse(localStorage.getItem('todoList'));
  // allTitles = parsed.map(list => [list.title]);

  // Find active list
  const activeListSaved = JSON.parse(localStorage.getItem('todoList_active'));
  let activeList = parsed.find(list => list.id === activeListSaved);

  // Set current list to active list
  currentList = new ToDoList(currentTodosContainer, titleContainer, activeList);

  // Add new todo to current list
  inputForm.addEventListener("submit", activateForm);

  updateListOfLists();
}


function activateForm(e) {
  e.preventDefault();

  currentList.addNewToDo(todoInput.value);
  todoInput.value = "";
}


