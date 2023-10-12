import ToDoItem from "./ToDoItem";

/**
 * Class that returns object with title, unique ID and array of todos objects
 */
export default class ToDoListData {
 /**
* Generates unique ID for list of todos
* @type {number}
*/
 readonly id: number = Date.now() + Math.floor(Math.random() * 100000);

 /**
*
* @param {string} title - title of list
* @param {Array} todos - array of ToDoItem's
* @this ToDoListData
*/
 constructor(public title: string, public todos: ToDoItem[] = []) { }
}