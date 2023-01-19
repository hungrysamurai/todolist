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
      this.title = this.changeTitle(e.target.textContent);
      if (!this.title) {
        alert('Добавьте название списка!')
        return;
      }

      // Check if list with identical name exist
      // let collisions = JSON.parse(localStorage.getItem('todoList')).filter(el => el.title === this.title);
      // if (collisions.length === 2) return

      // Update title of current list in localStorage
      this.updateLSTitle(this.title);
    });

    // Prevent user to type title longer than 40 characters
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

  // Delete ToDo by index
  deleteToDo(index) {
    this.todos.splice(index, 1);

    this.updateLSToDos();
    this.renderToDOM();
  }

  // Mark ToDo as done
  markAsDone(index, el) {
    // Check if ToDo is active
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

      completeBtn.addEventListener('click', () => {
        this.markAsDone(todoEl.dataset.index, todoEl)
      })

    });
  }

  addDragEvents() {

    // Init Sortable for list
    this.initSortable();
    // Add events
    this.todosDOM.forEach(todoEl => {
      todoEl.addEventListener("drop", (e) => {
        console.log(e);
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
    this.currentSortable = new Sortable(this.todosContainer, {
      animation: 300,
      onEnd: (e) => {
        console.log(this.todosDOM);
        console.log(e.to);
        console.log(this);
        // var itemEl = evt.item;  // dragged HTMLElement
        // evt.to;    // target list
        // evt.from;  // previous list
        // evt.oldIndex;  // element's old index within old parent
        // evt.newIndex;  // element's new index within new parent
        // evt.oldDraggableIndex; // element's old index within old parent, only counting draggable elements
        // evt.newDraggableIndex; // element's new index within new parent, only counting draggable elements
        // evt.clone // the clone element
        // evt.pullMode;  // when item is in another sortable: `"clone"` if cloning, `true` if moving
      },
    });
  };

  // Re arrange array
  newSort() {

    const sorted = [];
    const toDosInDOM = [...this.todosContainer.querySelectorAll('.todo .todo-text p')];

    toDosInDOM.forEach(item => {
      const todoEl = this.todos.find(el => el.text === item.textContent);
      sorted.push(todoEl);
    });

    return sorted;
  }

  updateLSTitle(newTitle) {
    // Parse localStorage
    const parsed = JSON.parse(localStorage.getItem('todoList'));

    // Find corresponding object in parsed localStorage
    let activeList = parsed.find(list => list.id === this.id);

    // Set title in parsed localStorage
    activeList.title = newTitle;

    // Update localStorage properties
    localStorage.setItem('todoList', JSON.stringify(parsed))
    localStorage.setItem('todoList_active', JSON.stringify(activeList.id));
  }

  updateLSToDos() {
    // Parse localStorage
    const parsed = JSON.parse(localStorage.getItem('todoList'));

    // Find corresponding object in parsed localStorage
    let activeList = parsed.find(list => list.id === this.id);

    // Reset todos in parsed version of localStorage
    activeList.todos = [];

    // Push all todos to parsed version of localStorage
    this.todos.forEach(todo => activeList.todos.push(todo));

    // Set localStorage
    localStorage.setItem('todoList', JSON.stringify(parsed));
  }
}

