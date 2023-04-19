import Sortable from "sortablejs";
import { ToDoListData, ToDoList } from "./classes";

// DOM Elements
const { body } = document;
const mainContainer = document.querySelector(".main-container");
const titleContainer = document.querySelector(".list-container");
const inputForm = document.querySelector(".form");
const todoInput = document.querySelector(".input");
const currentTodosContainer = document.querySelector(".todos-container");
const overlay = document.querySelector(".overlay");
const allListsButton = document.querySelector(".lists-button");
const allListsContainer = document.querySelector(".all-lists-container");
const listOfListsEl = allListsContainer.querySelector("ul");
const addNewListBtn = document.querySelector(".add-new-list-btn");

// Init
let currentList;

// Get items from localStorage
if (!localStorage.getItem("todoList")) initLocalStorage();
else loadLocalStorage();


// Init Sortable 
const sortable = new Sortable(currentTodosContainer, {
  animation: 300,
  delay: 250,
  easing: "cubic-bezier(1, 0, 0, 1)",
  onEnd: () => {
    currentList.updateOnDrag();
  },
  onChoose: function (e) {
    highlightToDo(e);
  },
});

// Set events listener on editable title, so it update list of lists on each input
mainContainer.addEventListener("input", (e) => {
  if (e.target === currentList.titleElement) {
    updateListOfLists();
  }
});

// Reveal/hide all lists
allListsButton.addEventListener("click", toggleListOfLists);
overlay.addEventListener("click", toggleListOfLists);

// Add new list button
addNewListBtn.addEventListener("click", () => {
  addNewList();
  if (!overlay.classList.contains("hidden")) {
    toggleListOfLists();
  }
});

/**
 * @property {Function} updateListOfLists - Init/update list of lists element
 * @returns {void}
 */
function updateListOfLists() {
  // Clear element
  listOfListsEl.innerHTML = "";

  // Parse localStorage
  const parsed = JSON.parse(localStorage.getItem("todoList"));

  // Create element for each list
  parsed.forEach((list) => {
    const { title, id } = list;
    const listElement = document.createElement("div");
    listElement.classList.add("list-item");

    const listTitleText = document.createElement("span");
    listTitleText.classList.add("list-title");
    listTitleText.dataset.listid = id;
    listTitleText.textContent = title;

    listTitleText.addEventListener("click", (e) => {
      changeList(e.target.dataset.listid);
      toggleListOfLists();
    });

    // Highlight active list
    if (JSON.parse(localStorage.getItem("todoList_active")) === id) {
      listTitleText.classList.add("active");
    }

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fas fa-solid fa-trash-can";
    deleteIcon.dataset.listid = id;

    deleteIcon.addEventListener("click", deleteList);

    listElement.append(listTitleText, deleteIcon);
    listOfListsEl.appendChild(listElement);
  });
}

/**
 * @property {Function} changeList - Set current list to new
 * @param {string} id - id of list
 * @returns {void}
 */
function changeList(id) {
  const targetID = id;

  const parsed = JSON.parse(localStorage.getItem("todoList"));
  const targetList = parsed.find((list) => list.id === +targetID);

  currentList = new ToDoList(currentTodosContainer, titleContainer, targetList);

  localStorage.setItem("todoList_active", JSON.stringify(currentList.id));

  updateListOfLists();
  todoInput.value = "";
}

/**
 * @property {Function} toggleListOfLists - Toggle list of lists container in DOM
 * @returns {void}
 */
function toggleListOfLists() {
  overlay.classList.toggle("hidden");
  allListsContainer.classList.toggle("hidden");
  body.classList.toggle("no-scroll");
}

/**
 * @property {Function} addNewList - Adds new list in list of lists and set it in localStorage
 * @returns {void}
 */
function addNewList() {
  // Parse current current localStorage
  const parsed = JSON.parse(localStorage.getItem("todoList"));
  const listCount = parsed.length;
  // Init new list
  const newList = new ToDoListData(`Новый список дел ${listCount + 1}`);

  parsed.push(newList);

  currentList = new ToDoList(currentTodosContainer, titleContainer, newList);

  localStorage.setItem("todoList", JSON.stringify(parsed));
  localStorage.setItem("todoList_active", JSON.stringify(newList.id));

  updateListOfLists();
  todoInput.value = "";
}

/**
 * @property {Function} deleteList - delete list by passed id
 * @param {PointerEvent} e - event object than comes from click on delete button
 * @returns {void}
 */
function deleteList(e) {
  console.log(e);
  const targetID = e.target.dataset.listid;

  const parsed = JSON.parse(localStorage.getItem("todoList"));
  const targetList = parsed.find((list) => list.id === +targetID);
  const index = parsed.indexOf(targetList);

  // if current list is list to delete and it is not last list
  if (currentList.id === targetList.id) {
    if (parsed.length - 1 > 0) {
      let prevID = parsed[index - 1].id;
      // make previous list active list
      changeList(prevID);
    }
  }

  parsed.splice(index, 1);

  // if list to delete is last list - init new empty list
  if (parsed.length === 0) {
    initLocalStorage();
  } else {
    localStorage.setItem("todoList", JSON.stringify(parsed));
  }

  updateListOfLists();
}


/**
 * @property {Function} initLocalStorage - init 'todoList' & 'todoList_active' entries in localStorage, set up empty list
 * @returns {void}
 */
function initLocalStorage() {
  // Init new empty list data structure
  const newListData = new ToDoListData("Новый список дел");

  // Set initial data in localStorage
  localStorage.setItem("todoList", JSON.stringify([newListData]));
  localStorage.setItem("todoList_active", JSON.stringify(newListData.id));

  // Init object in DOM
  currentList = new ToDoList(
    currentTodosContainer,
    titleContainer,
    newListData
  );

  // Activate input form
  inputForm.addEventListener("submit", activateForm);

  updateListOfLists();
}

/**
 * @property {Function} loadLocalStorage - retrieve data from localStorage
 * @returns {void}
 */
function loadLocalStorage() {
  // Parse localStorage
  const parsed = JSON.parse(localStorage.getItem("todoList"));

  // Find active list
  const activeListSaved = JSON.parse(localStorage.getItem("todoList_active"));
  let activeList = parsed.find((list) => list.id === activeListSaved);

  // Set current list to active list
  currentList = new ToDoList(currentTodosContainer, titleContainer, activeList);

  // Initially - set up form to add new items to current list
  inputForm.addEventListener("submit", activateForm);

  updateListOfLists();
}

/**
 * @property {Function} activateForm - Set up form to add new items to current list
 * @param {SubmitEvent} e - event object from "submit" event 
 * @returns {void}
 */
function activateForm(e) {
  e.preventDefault();

  currentList.addNewToDo(todoInput.value);
  todoInput.value = "";
}

/**
 * @property {Function} highlightToDo - Highlight choosen todo item
 * @param {CustomEvent} e - event object that comes from Sortable event fired when item become active
 */
function highlightToDo(e) {

  e.item.classList.add("active");

  const todoTop = e.originalEvent.layerY;
  const todoLeft = e.originalEvent.layerX;

  const chosenMark = document.createElement("span");
  chosenMark.classList.add("chosen");

  chosenMark.style.top = todoTop + "px";
  chosenMark.style.left = todoLeft + "px";

  e.item.append(chosenMark);

  setTimeout(() => chosenMark.remove(), 300);
}