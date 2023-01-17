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
class ToDoItem {
  constructor(text, status) {
    this.text = text;
    this.status = status;
  }
}


class ToDoList {
  constructor(title, listContainer, titleElement) {
    this.todosContainer = listContainer;
    this.titleElement = titleElement;

    this.title;
    this.todos = [];
    this.todosDOM;
    this.currentSortable;

    this.title = this.changeTitle(title);
  }
  // Change current title
  changeTitle(text) {
    this.title = text;
    this.titleElement.textContent = text;
  }

  // Add new ToDo
  addNewToDo(text) {
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

    console.log(this.todos[index]);
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
}

let currentList = new ToDoList('My first list', currentTodosContainer, currentListTitle);

// Add new todo to current list
inputForm.addEventListener("submit", (e) => {
  e.preventDefault();

  currentList.addNewToDo(todoInput.value);
  todoInput.value = "";
});




















// function createToDoItem(text) {

//   const container = document.createElement("div");
//   // container.className = status === 'active' ? 'todo' : 'todo done';
//   // container.dataset.index = index;

//   container.innerHTML = `
// <button class="check-button">
  // <i class="far fa-light ${status === "active" ? 'fa-circle' : 'fa-circle-check'}"></i>
// </button>

// <div class="todo-text">
// <p>${text}</p>
// </div>

// <button class="trash-button">
//   <i class="fas fa-solid fa-trash-can"></i>
// </button>
// `;

//   return container;
// };
















// // let tempData = {
// //   activeList: 'my second list',
// //   'my first list': [
// //     {
// //       text: 'First very interesting task',
// //       status: 'active',
// //     },
// //     {
// //       text: 'Second very very interesting task',
// //       status: 'active'
// //     },
// //     {
// //       text: 'Third amazing task',
// //       status: 'done'
// //     },
// //     {
// //       text: 'Theoden rides forth!',
// //       status: 'active'
// //     }
// //   ],
// //   'my second list': [
// //     {
// //       text: 'Some task from second list',
// //       status: 'active',
// //     },
// //     {
// //       text: 'Some task from second list',
// //       status: 'done'
// //     },
// //     {
// //       text: 'Some task from second list',
// //       status: 'active'
// //     },
// //     {
// //       text: 'Theoden rides forth!',
// //       status: 'active'
// //     }
// //   ],
// // };

// // Init current list
// let currentList;

// if (tempData) {
//   initList(tempData);
// } else {

// }


// function initList(data) {
//   console.log(data[data.activeList]);
//   console.log(data);


//   // // Set current list to active list in data storage

//   // currentTitle = `${data.activeList}`;

//   // // Render current list to DOM
//   // renderList(currentList, currentTitle);
// }

// function renderList(list, title) {

//   // Reset container
//   currentTodosContainer.innerHTML = '';
//   currentListTitle.textContent = title;

//   currentListTitle.addEventListener('input', (e) => {
//     const newTitle = e.target.textContent;
//     updateState(newTitle);
//   })

//   list.forEach((todo, index) => {
//     currentTodosContainer.append(createToDoItem(todo.text, todo.status, index));
//   })

//   document.querySelectorAll(".todo").forEach((todo, i) => {
//     todo.addEventListener("drop", () => {
//       resetIndexes(document.querySelectorAll(".todo"));
//     });
//   });

//   initSortable(currentTodosContainer);
// }






// function initSortable(list) {
//   new Sortable(list, {
//     animation: 350,
//   });
// };

// function resetIndexes(todos) {
//   todos.forEach((todo, i) => {
//     todo.dataset.index = i;
//   });
// };

// function updateState(title = undefined) {
//   if (title) {
//     // Update list title, if title provided
//     tempData[title] = tempData[currentTitle];
//     delete tempData[currentTitle];
//     currentTitle = title;
//     tempData.activeList = title;
//   }

//   console.log(tempData, currentTitle);
// }

// // Toggle lists container
// allListsButton.addEventListener('click', () => {
//   overlay.classList.toggle('hidden');
//   body.classList.toggle('no-scroll');
//   allListsContainer.classList.toggle('hidden')
// });
