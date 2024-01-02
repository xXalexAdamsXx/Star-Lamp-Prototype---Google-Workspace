function onFormSubmit(e){
    //Save the reference to the form and sheet
    const formURL = 'https://docs.google.com/forms/d/1UTXp1hNrn6XuY0qDNysSiUI6v0DAyyvkyl5kSQ5IgQo/edit'
    const spreadSheetURL = 'https://docs.google.com/spreadsheets/d/1Tluj63-N1tG7uEfc3zAq44x_DzYeLEGvLgTsDlTMNM4/edit?resourcekey#gid=1815354714';
    const sheetName = 'Approval Status';
    const form = FormApp.openByUrl(formURL);
    const sheet = SpreadsheetApp.openByUrl(spreadSheetURL).getSheetByName(sheetName);
  
    //Append answers to approval sheet
    let answers = extractAnswers(form);
    sheet.appendRow(answers);
    
    //Create dropdown box
    const targetCell = sheet.getRange(sheet.getLastRow(), sheet.getLastColumn() - 1, 1, 1);
    createDropDown(targetCell, sheet);
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
    const allResponses = [latestResponse.getTimestamp()]; // Store timestamp as the first element in the allResponses array
  
    const responseItems = latestResponse.getItemResponses(); //Get a list of the question responses from the individual form response
    const answers = responseItems.map(responseItem => responseItem.getResponse()); //Store all of the answers
    return allResponses.concat(answers); // Concatenate the arrays to include the timestamp and all the answers in a single array
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