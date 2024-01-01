function onFormSubmit(e){
  //Save the reference to the formId
  const formURL = 'https://docs.google.com/forms/d/1UTXp1hNrn6XuY0qDNysSiUI6v0DAyyvkyl5kSQ5IgQo/edit'
  const spreadSheetURL = 'https://docs.google.com/spreadsheets/d/1Tluj63-N1tG7uEfc3zAq44x_DzYeLEGvLgTsDlTMNM4/edit?resourcekey#gid=1815354714';
  const sheetName = 'Approval Status';
  const form = FormApp.openByUrl(formURL);
  const sheet = SpreadsheetApp.openByUrl(spreadSheetURL).getSheetByName(sheetName);

  let answers = extractAnswers(form);
  sheet.appendRow(answers);
  //TODO: Add a checkbox to the end of the row

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

