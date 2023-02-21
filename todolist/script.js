import { ToDoListData, ToDoList } from "./classes.js";

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
    const todoTop = e.originalEvent.offsetY;
    const todoLeft = e.originalEvent.offsetX;

    const chosenMark = document.createElement('span');
    chosenMark.classList.add('chosen');

    if (todoTop) {
      chosenMark.style.top = todoTop + 'px';
      chosenMark.style.left = todoLeft + 'px';
    } else {
      chosenMark.style.top = '50%';
      chosenMark.style.left = '50%';
    }

    e.item.append(chosenMark);

    setTimeout(() => chosenMark.remove(), 300)

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

function toggleListOfLists() {
  overlay.classList.toggle("hidden");
  allListsContainer.classList.toggle("hidden");
  body.classList.toggle("no-scroll");
}

// Init/update list of lists element
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

function addNewList() {
  // Parse current current localStorage
  const parsed = JSON.parse(localStorage.getItem("todoList"));

  // Init new list
  const newList = new ToDoListData("Новый список дел");

  parsed.push(newList);

  currentList = new ToDoList(currentTodosContainer, titleContainer, newList);

  localStorage.setItem("todoList", JSON.stringify(parsed));
  localStorage.setItem("todoList_active", JSON.stringify(newList.id));

  updateListOfLists();
  todoInput.value = "";
}

function changeList(id) {
  const targetID = id;

  const parsed = JSON.parse(localStorage.getItem("todoList"));
  const targetList = parsed.find((list) => list.id === +targetID);

  currentList = new ToDoList(currentTodosContainer, titleContainer, targetList);

  localStorage.setItem("todoList_active", JSON.stringify(currentList.id));

  updateListOfLists();
  todoInput.value = "";
}

function deleteList(e) {
  const targetID = e.target.dataset.listid;

  const parsed = JSON.parse(localStorage.getItem("todoList"));
  const targetList = parsed.find((list) => list.id === +targetID);
  const index = parsed.indexOf(targetList);

  if (currentList.id === targetList.id) {
    if (parsed.length - 1 > 0) {
      let prevID = parsed[index - 1].id;
      changeList(prevID);
    }
  }

  parsed.splice(index, 1);

  if (parsed.length === 0) {
    initLocalStorage();
  } else {
    localStorage.setItem("todoList", JSON.stringify(parsed));
  }
  updateListOfLists();
}

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

function loadLocalStorage() {
  // Parse localStorage
  const parsed = JSON.parse(localStorage.getItem("todoList"));
  // allTitles = parsed.map(list => [list.title]);

  // Find active list
  const activeListSaved = JSON.parse(localStorage.getItem("todoList_active"));
  let activeList = parsed.find((list) => list.id === activeListSaved);

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
