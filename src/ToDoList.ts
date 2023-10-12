import ToDoItem from "./ToDoItem";
import ToDoListData from "./ToDoListData";
/**
 * Class that returns ToDoList object
 */
export default class ToDoList {
 todos: ToDoItem[];
 id: number;
 title: string;
 titleElement: HTMLInputElement;
 todosDOMElements!: NodeListOf<HTMLDivElement>;

 /**
 *
 * @param {HTMLElement} todosContainer - parent DOM element for todo list
 * @param {HTMLElement} titleContainer - parent DOM element for title
 * @param {Object} listData - ToDoListData object with todos
 * @this ToDoList
 */
 constructor(
  private todosContainer: HTMLDivElement,
  private titleContainer: HTMLDivElement,
  listData: ToDoListData) {
  const { title, todos, id } = listData;

  // Create editable title element for current list
  this.titleElement = this.createTitleElement();

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

 /**
  * 
  * @property {Function} createTitleElement - creates title input and puts it to DOM 
  * @returns {HTMLElement} 
  */
 createTitleElement(): HTMLInputElement {
  this.titleContainer.innerHTML = "";

  const newTitleEl = document.createElement("input");
  newTitleEl.classList.add("list-heading");
  this.titleContainer.append(newTitleEl);

  return newTitleEl;
 }

 /**
  * @property {Function} renderToDOM - re/render todolist in DOM 
  * @returns {void}
  */
 renderToDOM() {
  // Reset container
  this.todosContainer.innerHTML = "";

  // Place each todo in place
  this.todos.forEach((todo, i) => {
   this.todosContainer.append(this.createDOMElement(todo, i));
  });

  this.addClickEvents();
 }

 /**
  * @property {Function} createDOMElement - generate individual todo DOM-element
  * @param {Object} todo - ToDoItem object
  * @param {number} index
  * @returns {HTMLElement} - todo DOM-element
  */
 createDOMElement(todo: ToDoItem, index: number): HTMLDivElement {
  const { text, status } = todo;

  const container = document.createElement("div");
  container.className = status === "active" ? "todo" : "todo done";

  container.dataset.index = index.toString();

  container.innerHTML = `
        <button class="check-button">
           <i class="far fa-light ${status === "active" ? "fa-circle" : "fa-circle-check"
   }"></i>
        </button>

        <div class="todo-text">
        <p>${text}</p>
        </div>

        <button class="edit-button">
          <i class="fas fa-solid fa-pen"></i>
        </button>

        <button class="trash-button">
          <i class="fas fa-solid fa-trash-can"></i>
        </button>
`;
  return container;
 }

 /**
  * @property {Function} addClickEvents - add events on generated list of todos
  */
 addClickEvents(): void {

  this.todosDOMElements = this.todosContainer.querySelectorAll(".todo");

  this.todosDOMElements.forEach((todoEl) => {
   const editBtn = todoEl.querySelector(".edit-button") as HTMLButtonElement;
   const deleteBtn = todoEl.querySelector(".trash-button") as HTMLButtonElement;
   const completeBtn = todoEl.querySelector(".check-button") as HTMLButtonElement;

   editBtn.addEventListener("touchend", (e) => {
    e.preventDefault();

    if (todoEl.dataset.index) {
     this.editToDo(todoEl.dataset.index, todoEl);
    }
   });

   editBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (todoEl.dataset.index) {
     this.editToDo(todoEl.dataset.index, todoEl);
    }
   });

   deleteBtn.addEventListener("touchend", (e) => {
    e.preventDefault();

    if (todoEl.dataset.index) {
     this.deleteToDo(todoEl.dataset.index);
    }
   });

   deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (todoEl.dataset.index) {
     this.deleteToDo(todoEl.dataset.index);
    }
   });

   completeBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();

    if (todoEl.dataset.index) {
     this.markAsDone(todoEl.dataset.index, todoEl);
    }
   });

   completeBtn.addEventListener("click", (e) => {
    e.preventDefault();

    if (todoEl.dataset.index) {
     this.markAsDone(todoEl.dataset.index, todoEl);
    }
   });
  });
 }


 /**
  * @property {Function} editToDo - Edit current todo
  * @param {string} index - position of todo to edit in list
  * @param {HTMLElement} el - DOM element of todo
  */
 editToDo(index: string, el: HTMLDivElement): void {
  if (!el.querySelector(".todo-text p")) {

   const editedEl = el.querySelector(".todo-text input") as HTMLInputElement;
   const newText = editedEl.value;
   this.todos[Number(index)].text = newText;

   this.updateLSToDos();
   this.renderToDOM();

  } else {

   el.querySelector(".todo-text p")?.remove();
   const currentIcon = el.querySelector(".edit-button i") as HTMLElement;

   currentIcon.classList.remove("fa-pen");
   currentIcon.classList.add("fa-check");

   const editInputEl = document.createElement("input");
   editInputEl.setAttribute("type", "text");
   editInputEl.value = this.todos[Number(index)].text;

   (el.querySelector(".todo-text") as HTMLDivElement).append(editInputEl);
   editInputEl.focus();

   editInputEl.addEventListener("blur", (e) => {
    if (e.target instanceof HTMLInputElement) {
     const newText = e.target.value;
     this.todos[Number(index)].text = newText;

     this.updateLSToDos();
     this.renderToDOM();
    }
   });
  }
 }

 /**
  * @property {Function} deleteToDo - Delete ToDo by index
  * @param {string} index - position of todo to delete
  */
 deleteToDo(index: string): void {
  this.todos.splice(Number(index), 1);

  this.updateLSToDos();
  this.renderToDOM();
 }


 /**
* @property {Function} markAsDone - Mark ToDo as done
* @param {string} index - position of todo to edit in list
* @param {HTMLElement} el - DOM element of todo
*/
 markAsDone(index: string, el: HTMLDivElement): void {
  // Check if ToDo is active
  if (this.todos[Number(index)].status === "active") {
   (el.querySelector("i") as HTMLElement).className = "far fa-light fa-circle-check";
   el.className = "todo done";
   this.todos[Number(index)].status = "done";
  } else {
   (el.querySelector("i") as HTMLElement).className = "far fa-light fa-circle";
   el.className = "todo";
   this.todos[Number(index)].status = "active";
  }

  this.updateLSToDos();
 }

 /**
* @property {Function} addTitleListeners - set up title element events
*/
 addTitleListeners(): void {
  this.titleElement.addEventListener("focus", (e) => {
   if (e.target instanceof HTMLInputElement) {
    e.target.value = this.title;
   }
  });

  this.titleElement.addEventListener("blur", (e) => {
   if (e.target instanceof HTMLInputElement) {
    if (!e.target.value) {
     alert("Добавьте название списка!");

     this.title = "Список дел";

     e.target.placeholder = this.title;
     this.updateLSTitle(this.title);

     return;
    }
   }
  });

  this.titleElement.addEventListener("input", (e) => {
   this.titleElement.placeholder = "";
   if (e.target instanceof HTMLInputElement) {
    this.title = e.target.value;
    // Update title of current list in localStorage
    this.updateLSTitle(this.title);
   }
  });
 }


 /**
* @property {Function} addNewToDo - Add new ToDo to current list
* @param {string} text - text content of new todo
*/
 addNewToDo(text: string): void {
  // Check if there text at all
  if (!text) return;

  // Check if text already exist in list
  if (this.todos.find((el) => el.text === text)) return;

  this.todos.push(new ToDoItem(text, "active"));

  this.updateLSToDos();
  this.renderToDOM();
 }

 /**
   * @property {Function} updateOnDrag - Update data in ToDoList object after drag and drop in DOM
   */
 updateOnDrag(): void {
  this.todos = this.newSort();
  this.updateLSToDos();
  this.renderToDOM();
 }


 /**
 * @property {Function} newSort - Re arrange array of todos based on current arrange in DOM
 * @returns {Array} arranged array of todos
 */
 newSort(): ToDoItem[] {
  const sorted: ToDoItem[] = [];
  const toDosInDOM = [
   ...this.todosContainer.querySelectorAll(".todo .todo-text p"),
  ];

  toDosInDOM.forEach((item) => {
   const todoEl = this.todos.find((el) => el.text === item.textContent);
   if (todoEl) {
    sorted.push(todoEl);
   }
  });

  return sorted;
 }

 /**
   * @property {Function} updateLSTitle - update list title in localStorage
   * @param {string} - new title of list
   */
 updateLSTitle(newTitle: string): void {
  // Parse localStorage
  const parsed: ToDoListData[] = JSON.parse(localStorage.getItem("todoList") as string);

  // Find corresponding object in parsed localStorage
  let activeList: ToDoListData | undefined = parsed.find((list) => list.id === this.id);

  if (activeList) {
   // Set title in parsed localStorage
   activeList.title = newTitle;

   // Update localStorage properties
   localStorage.setItem("todoList", JSON.stringify(parsed));
   localStorage.setItem("todoList_active", JSON.stringify(activeList.id));
  }
 }

 /**
 * @property {Function} updateLSToDos - update todos in localStorage
 */
 updateLSToDos(): void {
  // Parse localStorage
  const parsed: ToDoListData[] = JSON.parse(localStorage.getItem("todoList") as string);

  // Find corresponding object in parsed localStorage
  let activeList: ToDoListData | undefined = parsed.find((list) => list.id === this.id);

  if (activeList) {
   // Reset todos in parsed version of localStorage
   activeList.todos = [];

   // Push all todos to parsed version of localStorage
   this.todos.forEach((todo) => activeList?.todos.push(todo));

   // Set localStorage
   localStorage.setItem("todoList", JSON.stringify(parsed));
  }

 }
}
