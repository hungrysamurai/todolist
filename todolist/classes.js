class ToDoItem {
  constructor(text, status) {
    this.text = text;
    this.status = status;
  }
}

export class ToDoListData {
  constructor(title, todos = []) {
    this.title = title;
    this.todos = todos;
    this.id = Math.floor(Math.random() * 100000);
  }
}

export class ToDoList {
  constructor(listContainer, titleContainer, listData) {
    const { title, todos, id } = listData;

    // Create editable title element for current list
    this.todosContainer = listContainer;
    this.titleElement = this.createTitleElement(titleContainer);
    this.todosDOM;

    this.id = id;
    this.todos = [];

    if (todos?.length) {
      todos.forEach((todo) => {
        this.todos.push(todo);
      });
    }

    this.renderToDOM();

    // Init title
    this.titleElement.placeholder = title;
    this.titleElement.maxLength = 40;
    this.title = title;
    this.addTitleListeners();

    this.titleElement.focus();
  }

  createTitleElement(titleContainer) {
    titleContainer.innerHTML = "";

    const newTitleEl = document.createElement("input");
    newTitleEl.classList.add("list-heading");

    titleContainer.append(newTitleEl);

    return newTitleEl;
  }

  addTitleListeners() {

    this.titleElement.addEventListener("focus", (e) => {
      e.target.value = this.title;
    });

    this.titleElement.addEventListener('blur', (e) => {
      if (!e.target.value) {
        alert("Добавьте название списка!");

        this.title = 'Новый список дел';
        e.target.placeholder = this.title;
        this.updateLSTitle(this.title);

        return;
      }
    })

    this.titleElement.addEventListener("input", (e) => {
      this.titleElement.placeholder = ''
      this.title = e.target.value;

      // Update title of current list in localStorage
      this.updateLSTitle(this.title);
    });

  }

  // Add new ToDo
  addNewToDo(text) {
    // Check if there text at all
    if (!text) return;

    // Check if text already exist in list
    if (this.todos.find((el) => el.text === text)) return;

    this.todos.push(new ToDoItem(text, "active"));

    this.updateLSToDos();
    this.renderToDOM();
  }

  // Delete ToDo by index
  deleteToDo(index) {
    this.todos.splice(index, 1);

    this.updateLSToDos();
    this.renderToDOM();
  }

  // Mark ToDo as done
  markAsDone(index, el) {
    // Check if ToDo is active
    if (this.todos[index].status === "active") {
      el.querySelector("i").className = "far fa-light fa-circle-check";
      el.className = "todo done";
      this.todos[index].status = "done";
    } else {
      el.querySelector("i").className = "far fa-light fa-circle";
      el.className = "todo";
      this.todos[index].status = "active";
    }

    this.updateLSToDos();
  }

  renderToDOM() {
    // Reset container
    this.todosContainer.innerHTML = "";

    // Place each todo in place
    this.todos.forEach((todo, i) => {
      this.todosContainer.append(this.createDOMElement(todo, i));
    });

    this.addClickEvents();
    // this.addDragEvents();
  }

  createDOMElement(todo, index) {
    const { text, status } = todo;

    const container = document.createElement("div");
    container.className = status === "active" ? "todo" : "todo done";

    container.dataset.index = index;
    container.innerHTML = `
        <button class="check-button">
           <i class="far fa-light ${status === "active" ? "fa-circle" : "fa-circle-check"
      }"></i>
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
    this.todosDOM = this.todosContainer.querySelectorAll(".todo");
    this.todosDOM.forEach((todoEl) => {
      const deleteBtn = todoEl.querySelector(".trash-button");
      const completeBtn = todoEl.querySelector(".check-button");


      deleteBtn.addEventListener("touchend", (e) => {
        e.preventDefault();
        this.deleteToDo(todoEl.dataset.index);
      });

      deleteBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.deleteToDo(todoEl.dataset.index);
      });

      completeBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.markAsDone(todoEl.dataset.index, todoEl);
      });

      completeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.markAsDone(todoEl.dataset.index, todoEl);
      });

    });
  }

  updateOnDrag() {
    this.todos = this.newSort();
    this.updateLSToDos();
    this.renderToDOM();
  }

  // Re arrange array
  newSort() {
    const sorted = [];
    const toDosInDOM = [
      ...this.todosContainer.querySelectorAll(".todo .todo-text p"),
    ];

    toDosInDOM.forEach((item) => {
      const todoEl = this.todos.find((el) => el.text === item.textContent);
      sorted.push(todoEl);
    });

    return sorted;
  }

  updateLSTitle(newTitle) {
    // Parse localStorage
    const parsed = JSON.parse(localStorage.getItem("todoList"));

    // Find corresponding object in parsed localStorage
    let activeList = parsed.find((list) => list.id === this.id);

    // Set title in parsed localStorage
    activeList.title = newTitle;

    // Update localStorage properties
    localStorage.setItem("todoList", JSON.stringify(parsed));
    localStorage.setItem("todoList_active", JSON.stringify(activeList.id));
  }

  updateLSToDos() {
    // Parse localStorage
    const parsed = JSON.parse(localStorage.getItem("todoList"));

    // Find corresponding object in parsed localStorage
    let activeList = parsed.find((list) => list.id === this.id);

    // Reset todos in parsed version of localStorage
    activeList.todos = [];

    // Push all todos to parsed version of localStorage
    this.todos.forEach((todo) => activeList.todos.push(todo));

    // Set localStorage
    localStorage.setItem("todoList", JSON.stringify(parsed));
  }
}
