/**
 * Class that returns single todo item
 */
export default class ToDoItem {
 /**
  *
  * @param {string} text - text of todo item
  * @param {string} status - status of todo - active/done
  * @this ToDoItem
  */
 constructor(
  public text: string,
  public status: string
 ) { }
}