function onFormSubmit(e){
  //Save the reference to the form and sheet
  const form = FormApp.getActiveForm(); //Dynamically retrieve the form reference
  const spreadSheet = SpreadsheetApp.openById(form.getDestinationId()); //Dynamically retrieve the Spreadsheet reference
  const sheet = spreadSheet.getSheetByName('Approval Status'); //The only constart part of this. The name of the sheets cannot be changed

  //Append answers to approval sheet
  let rowsToAdd = extractAnswers(form); //Extract the response data
  const startingRow = sheet.getLastRow() + 1;
  const numRows = rowsToAdd.length;
  const numColumns = rowsToAdd[0].length;
  sheet.getRange(startingRow, 1, numRows, numColumns).setValues(rowsToAdd);
  
  const dropDownCells = sheet.getRange(startingRow, rowsToAdd[0].length + 1, rowsToAdd.length, 1);
  createDropDown(dropDownCells, sheet);
}

/**
 * This function will extract the answer from a google form and then save them to an array which will be returned when execution
 *  concludes. For now, this function has only been tested for multiple choice answers. This function will only return an object
 *  reference for responses to multiple choice responses.
 * 
 * @param formObject {Form} - The google form from which answers will be extracted from
 * @return {Array} - An array with all of the answers
 */
function extractAnswers(formObject){
  const responses = formObject.getResponses(); //Get the array with all of the form response objects
  const latestResponse = responses[responses.length - 1]; //Extract the latest form response object
  const timeStamp = extractTimeStamp(latestResponse, "MM/dd/yyyy HH:mm:ss");

  const responseItems = latestResponse.getItemResponses(); //Get a list of the question responses from the individual form response
  const allAnswers = responseItems.map(responseItem => responseItem.getResponse()); //Store all of the answers
  const allNames = allAnswers[0];
  const namesWithAnswers = compileNamesWithResponsesAndTime(timeStamp, allNames, allAnswers); // Concatenate the arrays to include the timestamp and all the answers in a single array
  return namesWithAnswers;
}

/**
 * Compiles names, responses, and timestamp into a 2D array.
 * @param {string} timeStamp - The timestamp to be associated with the responses.
 * @param {string[]} names - An array of names corresponding to the responses.
 * @param {string[]} answers - An array of responses corresponding to the names.
 * @returns {string[][]} - A 2D array containing timestamp, names, and responses.
 */
function compileNamesWithResponsesAndTime(timeStamp, names, answers) {
  let namesWithResponses = []; // Initialize an array that will store the name and responses
  let timeWithNamesAndResponses = []; // Initialize an array that will store timestamp, names, and all responses

  for (let i = 0; i < names.length; i++) {
    timeWithNamesAndResponses[i] = []; // Initialize index i of the array with an empty array (This makes it a 2D array)
    timeWithNamesAndResponses[i][0] = timeStamp; // Store the timestamp in the first column of the array in row i of the 2D array

    namesWithResponses = answers.slice(); // Store a copy of all the answers in the temporary array
    namesWithResponses[0] = names[i]; // Replace the first slot in the array with a name

    timeWithNamesAndResponses[i] = timeWithNamesAndResponses[i].concat(namesWithResponses); // Concatenate the timestamp with other array
  }

  return timeWithNamesAndResponses;
}

/**
 * Extracts and formats a timestamp from a given response object.
 * @param {Object} responseObject - The response object containing the timestamp.
 * @param {String} formatString - The format the timestamp will follow.
 * @returns {string} - Formatted timestamp.
 */
function extractTimeStamp(responseObject, formatString) {
  const localTime = Session.getScriptTimeZone(); // Get the local time
  const date = responseObject.getTimestamp(); // Retrieve timestamp object
  return Utilities.formatDate(date, localTime, formatString); // Ensure correct date formatting
}

/**
 * Creates a dropdown list in the specified target cell on the provided sheet.
 * The dropdown list allows values 'Approved' and 'Disapproved'.
 * @param {Range} targetCell - The cell where the dropdown list will be created.
 * @returns {void} - Does not return a value. Adds dropdown functionality to the specified cell.
 */
function createDropDown(targetCell) {
    const rule1 = SpreadsheetApp.newDataValidation()
    .setAllowInvalid(false)
    .requireValueInList(['Approved', 'Disapproved'], true)
    .build();
    targetCell.setDataValidation(rule1);
}