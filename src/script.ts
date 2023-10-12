import Sortable from "sortablejs";
import ToDoListData from "./ToDoListData";
import ToDoList from "./ToDoList";

import { SortableEventWithOriginalProp } from "./types";

// DOM Elements
const { body } = document;
const mainContainer = document.querySelector(".main-container") as HTMLDivElement;
const titleContainer = document.querySelector(".list-container") as HTMLDivElement;
const inputForm = document.querySelector(".form") as HTMLFormElement;
const todoInput = document.querySelector(".input") as HTMLInputElement;
const currentTodosContainer = document.querySelector(".todos-container") as HTMLDivElement;
const overlay = document.querySelector(".overlay") as HTMLDivElement;
const allListsButton = document.querySelector(".lists-button") as HTMLButtonElement;
const allListsContainer = document.querySelector(".all-lists-container") as HTMLDivElement;
const listOfListsEl = allListsContainer.querySelector("ul") as HTMLUListElement;
const addNewListBtn = document.querySelector(".add-new-list-btn") as HTMLButtonElement;

// Init
let currentList: ToDoList;


// Get items from localStorage
if (!localStorage.getItem("todoList")) initLocalStorage();
else loadLocalStorage();


// Init Sortable 
new Sortable(currentTodosContainer, {
  animation: 300,
  delay: 250,
  easing: "cubic-bezier(1, 0, 0, 1)",
  onEnd: () => {
    currentList.updateOnDrag();
  },
  onChoose: function (e) {
    highlightToDo(e as SortableEventWithOriginalProp);
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
 */
function updateListOfLists(): void {
  // Clear element
  listOfListsEl.innerHTML = "";

  // Parse localStorage
  const parsed: ToDoListData[] = JSON.parse(localStorage.getItem("todoList") as string);

  // Create element for each list
  parsed.forEach((list) => {
    const { title, id } = list;
    const listElement = document.createElement("div");
    listElement.classList.add("list-item");

    const listTitleText = document.createElement("span");
    listTitleText.classList.add("list-title");
    listTitleText.dataset.listid = id.toString();
    listTitleText.textContent = title;

    listTitleText.addEventListener("click", (e) => {
      if (e.target instanceof HTMLElement
        && e.target.dataset.listid) {
        changeList(e.target.dataset.listid);
        toggleListOfLists();
      }
    });

    // Highlight active list
    if (
      JSON.parse(localStorage.getItem("todoList_active") as string) === id
    ) {
      listTitleText.classList.add("active");
    }

    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fas fa-solid fa-trash-can";
    deleteIcon.dataset.listid = id.toString();

    deleteIcon.addEventListener("click", deleteList);

    listElement.append(listTitleText, deleteIcon);
    listOfListsEl.appendChild(listElement);
  });
}


/**
 * @property {Function} changeList - Set current list to new
 * @param {string} id - id of list
 */
function changeList(id: string): void {
  const targetID = id;

  const parsed: ToDoListData[] = JSON.parse(localStorage.getItem("todoList") as string);
  const targetList = parsed.find((list) => list.id === +targetID);

  if (targetList) {
    currentList = new ToDoList(currentTodosContainer, titleContainer, targetList);

    localStorage.setItem("todoList_active", JSON.stringify(currentList.id));

    updateListOfLists();
    todoInput.value = "";
  }
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
 */
function addNewList(): void {
  // Parse current current localStorage
  const parsed: ToDoListData[] = JSON.parse(localStorage.getItem("todoList") as string);
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
 * @param {MouseEvent} e - event object than comes from click on delete button
 */
function deleteList(e: MouseEvent): void {
  if (e.target instanceof HTMLElement && e.target.dataset.listid) {
    const targetID = e.target.dataset.listid;

    const parsed: ToDoListData[] = JSON.parse(localStorage.getItem("todoList") as string);
    const targetList = parsed.find((list) => list.id === +targetID);

    if (targetList) {
      const index = parsed.indexOf(targetList);

      // if current list is list to delete and it is not last list
      if (currentList.id === targetList.id) {
        if (parsed.length - 1 > 0) {
          let prevID = (parsed[index - 1].id).toString()
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
  }
}


/**
 * @property {Function} initLocalStorage - init 'todoList' & 'todoList_active' entries in localStorage, set up empty list
 */
function initLocalStorage(): void {
  // Init new empty list data structure
  const newListData: ToDoListData = new ToDoListData("Новый список дел");

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
  const parsed: ToDoListData[] = JSON.parse(localStorage.getItem("todoList") as string);

  // Find active list
  const activeListSaved = JSON.parse(localStorage.getItem("todoList_active") as string);
  let activeList = parsed.find((list) => list.id === activeListSaved);

  if (activeList) {
    // Set current list to active list
    currentList = new ToDoList(currentTodosContainer, titleContainer, activeList);

    // Initially - set up form to add new items to current list
    inputForm.addEventListener("submit", activateForm);

    updateListOfLists();
  }
}


/**
 * @property {Function} activateForm - Set up form to add new items to current list
 * @param {SubmitEvent} e - event object from "submit" event 
 */
function activateForm(e: SubmitEvent): void {
  e.preventDefault();

  currentList.addNewToDo(todoInput.value);
  todoInput.value = "";
}


/**
 * @property {Function} highlightToDo - Highlight choosen todo item
 * @param {CustomEvent} e - event object that comes from Sortable event fired when item become active
 */
function highlightToDo(e: SortableEventWithOriginalProp) {
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