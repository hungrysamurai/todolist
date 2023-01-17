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

// Classes
class ToDoListData {
  constructor(title, toDos) {
    this.title = title;
    this.toDos = toDos;
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

    console.log(data);

    this.todosContainer = listContainer;
    this.titleElement = titleElement;

    this.todos = [];
    this.todosDOM;
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
      let oldTitle = this.title;

      this.title = this.changeTitle(e.target.textContent);

      if (!this.title) {
        this.title = this.changeTitle('Undefined list');
      }

      // Update title of current list in localStorage
      this.updateLS(this.title)
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
    this.renderToDOM();
  }

  // Delete toDo by index
  deleteToDo(index) {
    this.todos.splice(index, 1);
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

  }

  renderToDOM() {
    console.log(this);
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

  updateLS(newTitle) {
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
}

let currentList;

// localStorage

if (!localStorage.getItem('todoList')) {
  currentList = new ToDoList(currentTodosContainer, currentListTitle, { title: 'Новый список дел' });

  let currentItems = [];
  currentItems.push(currentList.exportData())

  localStorage.setItem('todoList', JSON.stringify(currentItems));
  localStorage.setItem('todoList_active', JSON.stringify(currentList.title));

} else {

  const savedLists = JSON.parse(localStorage.getItem('todoList'));

  // Find active list
  const activeListSaved = JSON.parse(localStorage.getItem('todoList_active'));
  let activeList = savedLists.find(list => list.title === activeListSaved);

  // Set current list to active list
  currentList = new ToDoList(currentTodosContainer, currentListTitle, { title: activeList.title, data: activeList.toDos });

}


// currentList = new ToDoList('Новый список задач', currentTodosContainer, currentListTitle);

// Add new todo to current list
inputForm.addEventListener("submit", (e) => {
  e.preventDefault();

  currentList.addNewToDo(todoInput.value);
  todoInput.value = "";
});
