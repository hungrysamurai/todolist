const { body } = document;
const mainContainer = document.querySelector(".main-container");
const currentListTitle = document.querySelector(".list-heading");
const inputForm = document.querySelector(".form");
const todoInput = document.querySelector(".input");
const currentTodosContainer = document.querySelector(".todos-container");

let listsArray = [];
let currentList = [];

inputForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value;
  console.log(currentList.length);
  currentTodosContainer.append(createToDoItem(text));
  todoInput.value = "";

  resetIndexes(document.querySelectorAll(".todo"));

  let todoObject = {
    text: text,
    status: "active",
    currentID: currentList.length,
  };
  currentList.push(todoObject);

  console.log(currentList);

  document.querySelectorAll(".todo").forEach((todo, i) => {
    todo.addEventListener("drop", () => {
      resetIndexes(document.querySelectorAll(".todo"));
    });
  });
});

const createToDoItem = (text) => {
  const container = document.createElement("div");
  container.classList.add("todo");

  container.innerHTML = `
<button class="check-button">
  <i class="far fa-light fa-circle"></i>
</button>

<div class="todo-text">
<p>${text}</p>
</div>

<button class="trash-button">
  <i class="fas fa-solid fa-trash-can"></i>
</button>
`;

  return container;
};

initSortable(currentTodosContainer);

function initSortable(list) {
  new Sortable(list, {
    animation: 350,
  });
}

function resetIndexes(todos) {
  todos.forEach((todo, i) => {
    todo.dataset.index = i;
  });
}

// const form = document.getElementById('form')
// const input = document.getElementById('input')
// const todosUL = document.getElementById('todos')

// const todos = JSON.parse(localStorage.getItem('todos'))

// if (todos) {
//  todos.forEach(todo => {
//   addTodo(todo)
//  });
// }
// form.addEventListener('submit', (e) => {
//  e.preventDefault()

//  addTodo()
// })

// function addTodo(todo) {
//  let todoText = input.value

//  if (todo) {
//   todoText = todo.text
//  }

//  if (todoText) {
//   const todoEl = document.createElement('li')

//   if (todo && todo.completed) {
//    todoEl.classList.add('completed')
//   }

//   todoEl.innerText = todoText

//   todoEl.addEventListener('click', () => {
//    todoEl.classList.toggle('completed')
//    updateLS()
//   })

//   todoEl.addEventListener('contextmenu', (e) => {
//    e.preventDefault()

//    todoEl.remove()
//    updateLS()
//   })

//   todosUL.appendChild(todoEl)

//   input.value = ''

//   updateLS()
//  }
// }

// function updateLS() {
//  todosEl = document.querySelectorAll('li')

//  const todos = []

//  todosEl.forEach(todoEl => {
//   todos.push({
//    text: todoEl.innerText,
//    completed: todoEl.classList.contains('completed')
//   })
//  })

//  localStorage.setItem('todos', JSON.stringify(todos))
// }
