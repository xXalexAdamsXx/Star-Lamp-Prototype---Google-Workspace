function onFormSubmit(e){
  //Save the reference to the form and sheet
  const formURL = 'https://docs.google.com/forms/d/1UTXp1hNrn6XuY0qDNysSiUI6v0DAyyvkyl5kSQ5IgQo/edit'
  const spreadSheetURL = 'https://docs.google.com/spreadsheets/d/1Tluj63-N1tG7uEfc3zAq44x_DzYeLEGvLgTsDlTMNM4/edit?resourcekey#gid=1815354714';
  const sheetName = 'Approval Status';
  const form = FormApp.openByUrl(formURL);
  const sheet = SpreadsheetApp.openByUrl(spreadSheetURL).getSheetByName(sheetName);

  //Append answers to approval sheet
  let rowsToAdd = extractAnswers(form); //Extract the response data
  sheet.getRange(3,1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
  
  const dropDownCells = sheet.getRange(3, rowsToAdd[0].length + 1, rowsToAdd.length, 1);
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
function extractAnswers(formObject) {
  const responses = formObject.getResponses(); //Get the array with all of the form response objects
  const latestResponse = responses[responses.length - 1]; //Extract the latest form response object
  const timeStamp = latestResponse.getTimestamp(); // Store timestamp as the first element in the allResponses array

  const responseItems = latestResponse.getItemResponses(); //Get a list of the question responses from the individual form response
  const allAnswers = responseItems.map(responseItem => responseItem.getResponse()); //Store all of the answers
  const allNames = allAnswers[0];
  const namesWithAnswers = compileNamesWithResponsesAndTime(timeStamp, allNames, allAnswers);  // Concatenate the arrays to include the timestamp and all the answers in a single array
  return namesWithAnswers;
}

function compileNamesWithResponsesAndTime(timeStamp, names, answers){
  let namesWithResponses = []; //Initialize an array that will store the name and responses
  let timeWithNamesAndResponses = []; //Initialize an array that will store timestamp, names, and all responses
  for(let i = 0; i < names.length; i++){
    timeWithNamesAndResponses[i] = []; //Initialize index i of the array with an empty array (This makes it a 2D array)
    timeWithNamesAndResponses[i][0] = timeStamp; //Store the time stamp in the first slot of the array in slot i of the 2D array
    namesWithResponses = answers.slice(); //Store a copy of all the answers in the temporary array
    namesWithResponses[0] = names[i]; //Replace the first slot in the array with a name
    timeWithNamesAndResponses[i] = timeWithNamesAndResponses[i].concat(namesWithResponses); //Concatinate the timestamp with other array
  }
  return timeWithNamesAndResponses;
}


/**
 * Creates a dropdown list in the specified target cell on the provided sheet.
 * The dropdown list allows values 'Approved' and 'Disapproved'.
 * @param {Range} targetCell - The cell where the dropdown list will be created.
 * @returns {void} - Does not return a value. Adds dropdown functionality to the specified cell.
 */
function createDropDown(targetCell) {
    var rule1 = SpreadsheetApp.newDataValidation()
    .setAllowInvalid(false)
    .requireValueInList(['Approved', 'Disapproved'], true)
    .build();
    targetCell.setDataValidation(rule1);
}