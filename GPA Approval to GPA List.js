/**
 * This script automates daily tasks related to updating an 'Approval Status' sheet and a 'Leaderboard' in a spreadsheet.
 * It fetches data from the 'Approval Status' sheet and updates corresponding information in the 'Leaderboard'.
 * It also sorts the 'Leaderboard' based on certain criteria.
 * @OnlyCurrentDoc
 */

//TODO: Impliment "next update" on the leaderboard

function processOnDemand(){
    const sheet = SpreadsheetApp.getActiveSheet(); //Get the sheet reference
    //Get the reference to the activation cell (Assuiming its in the last cell of row 2)
    const activationCell = sheet.getRange(2, sheet.getLastColumn(), 1, 1); 
  
    const triggerValue = activationCell.getValue(); //Retreive the value from activation cell
    
    //if(triggerValue === false) return; //If the cell is false, terminate the program
  
    activationCell.setValue("Processing... Please wait."); //This line HAS TO RUN to prevent the user from annihilating the sheet
    
    //Check if the data that is going to be processed will be from the GPA Sheet and operate accordingly
    if(sheet.getSheetName() === 'GPA Approval Status') retrieveGpaData(sheet);
  
    //Check if the data that is going to be processed will be from the Study Hour Sheet and operate accordingly
    if(sheet.getSheetName() === 'Study Time Approval Status') retreiveStudyHourData(sheet);
  
    dailyRoutine(); 
    
    activationCell.insertCheckboxes();
    if(activationCell.getValue() == true) cell.setValue('CRITICAL ERROR. Insert new checkbox'); //Catch a checkbox error 
  }
  
  /**
   * Performs daily routine tasks:
   * - Retrieves the spreadsheet, 'Approval Status' sheet, and 'Leaderboard' sheet.
   * - Deletes rows in the 'Approval Status' sheet if the value in column 'F' of the row is true.
   * - Sorts the 'Leaderboard' sheet.
   * - Updates the 'Last Updated' timestamp in the leaderboard sheet.
   */
  function dailyRoutine(){
    const ss = SpreadsheetApp.getActiveSpreadsheet(); // Get the current spreadsheet
    const approvalSheet  = ss.getSheetByName('Approval Status'); // Get the 'Approval Status' sheet
    
    //This line serves as a quick fix to a bug that occurs when the google sheet is full. Doesn't work as intended though
    //appendBlankRow(approvalSheet); 
  
    if(approvalSheet.getRange('A3').isBlank()) return;
  
    const leaderboardSheet = ss.getSheetByName('Star & Lamp Leaderboard'); // Get the 'Leaderboard' sheet
    
    //Sort alphabetically to enable binary search
    const NAME_COLUMN = 1;
    leaderboardSheet.getRange(3, 1, leaderboardSheet.getLastRow() - 1, leaderboardSheet.getLastColumn() - 1).activate().sort({column: NAME_COLUMN, ascending: true});
  
    // Execute pointsToLeaderboard and identify rows to delete in the 'Approval Status' sheet
    const APPROVAL_COLUMN = 6;
    approvalSheet.getRange(3, 1, approvalSheet.getLastRow() - 1, approvalSheet.getLastColumn() - 1).activate().sort({column: APPROVAL_COLUMN, ascending: true});
    let rowsToDelete = pointsToLeaderboard(approvalSheet, leaderboardSheet);
  
    // Delete identified rows from the 'Approval Status' sheet by sorting and then deleting in bulk
    if(rowsToDelete > 0) approvalSheet.deleteRows(3, rowsToDelete);
    
    // Sort the 'Leaderboard' sheet based on the values in the 'Total Points' column
    const TOTAL_POINTS_COLUMN = 2;
    leaderboardSheet.getRange(3, 1, leaderboardSheet.getLastRow() - 1, leaderboardSheet.getLastColumn() - 1).activate().sort({column: TOTAL_POINTS_COLUMN, ascending: false});
  
    //Update the timestamp cell in the 'Leaderboard' sheet
    const TIME_STAMP_CORDS = 'G1';
    updateTimeStamp(leaderboardSheet, TIME_STAMP_CORDS, 'America/Los_Angeles');
  }
  
  function retrieveGpaData(gpaSheet){
    //Initialize variables that store the column value of each category
    let nameColValue;
    let gpaColValue;
    let approvalColValue;
  
    const lastCol = gpaSheet.getLastColumn();
    const lastRow = gpaSheet.getLastRow();
  
    const gpaSheetData = gpaSheet.getRange(2, 1, lastRow - 1, lastCol).getValues(); //Retrieve sheet data
    for(let i = 0; i < gpaSheetData[0].length; i++){
      if(gpaSheetData[0][i] === 'Name') nameColValue = i;
      if(gpaSheetData[0][i] === 'GPA') gpaColValue = i;
      if(gpaSheetData[0][i] === 'Approval Status') approvalColValue = i;
    }
  
    //Sort the approval status row to optimize operation
    gpaSheet.getRange(3, 1, lastRow, lastCol).activate().sort({column: approvalColValue, ascending: true});
  
    let brothersToUpdateList = [];
    let name;
    let gpa;
    for(let i = 1; i < gpaSheetData.length; i++){
      if(gpaSheetData[i][approvalColValue] === 'Disapproved'){
        gpaSheet.deleteRows(3, i);
        break;
      } 
  
      name = gpaSheetData[i][nameColValue];
      gpa = gpaSheetData[i][gpaColValue];
      const bro = {
        Name: name,
        GPA: gpa
      };
      brothersToUpdateList.push(bro);
    }
  
    return brothersToUpdateList;
  }
  
  function retreiveStudyHourData(hoursSheet){
    //Initialize variables that store the column value of each category
    let nameColValue;
    let hoursColValue;
    let approvalColValue;
  
    const lastCol = hoursSheet.getLastColumn();
    const lastRow = hoursSheet.getLastRow();
  
    const hoursSheetData = hoursSheet.getRange(2, 1, lastRow - 1, lastCol); //Retrieve sheet data
    for(let i = 0; i < categoriesRow.length; i++){
      if(hoursSheetData[1][i] === 'Name') nameColValue = i;
      if(hoursSheetData[1][i] === 'Study Hours') hoursColValue = i;
      if(hoursSheetData[1][i] === 'Approval Status') approvalColValue = i;
    }
  
    //Sort the approval status row to optimize operation
    hoursSheet.getRange(3, 1, lastRow, lastCol ).activate().sort({column: approvalColValue, ascending: true});
  
    let brothersToUpdateList = [];
    let name;
    let hours;
    for(let i = 1; i < hoursSheetData.length; i++){
      if(hoursSheetData[i][approvalColValue] === 'Disapproved'){
        hoursSheetData.deleteRows(3, i);
        break;
      } 
  
      name = hoursSheetData[i][nameColValue];
      hours = hoursSheetData[i][hoursColValue];
  
    const bro = {
      Name: name,
      Hours: hours
    };
  
      brothersToUpdateList.push(bro);
    }
  
    return brothersToUpdateList;
  }
  
  function sendDataToScholarSheet(dataArray){
  
  }
  
  /**
   * Adds a value to the existing value in a cell.
   * @param cell {Range} - The cell to update.
   * @param value {*} - The value to add to the cell.
   */
  function cellAddition(cell, value) {
    cell.setValue(cell.getValue() + value);
  }
  
  /**
   * Updates a timestamp cell in a Google Sheet with the current date and time.
   *
   * This function retrieves a specified cell on the sheet, gets the current date and time,
   * formats it to be more user-friendly, and updates the cell with the timestamp information.
   *
   * @param {Sheet} sheet - The Google Sheet object where the timestamp cell is located.
   * @param {string} cellCoordinates - The cell coordinates (e.g., 'A1') indicating the timestamp cell.
   * @param {string} timeZone - The time zone to use for formatting the timestamp.
   * @returns {void} - Does not return a value. Updates the specified cell with the formatted timestamp.
   */
  function updateTimeStamp(sheet, cellCoordinates, timeZone) {
    const timeStampCell = sheet.getRange(cellCoordinates); // Retrieve the 'timestamp cell' from the sheet
    const currentDate = new Date(); // Get the current date
    const formattedDate = Utilities.formatDate(currentDate, timeZone, 'MM/dd/yyyy HH:mm'); // Format the data to be more user-friendly
    timeStampCell.setValue('Last Updated: \n' + formattedDate); // Update the cell value
  }
  
  /**
   * Performs binary search on a sorted array to find the index of a target element.
   *
   * This function takes a sorted array and a target element, and performs a binary search to find
   * the index of the target element in the array. If the target is found, it returns the index;
   * otherwise, it returns -1.
   *
   * @param {Array} sortedArray - The sorted array to be searched.
   * @param {*} target - The target element to find in the array.
   * @returns {number} - The index of the target element in the array, or -1 if not found.
   */
  function binarySearch(sortedArray, target) {
    let left = 0;
    let right = sortedArray.length - 1;
  
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const current = sortedArray[mid]; // Assuming the names are in the first column
  
      if (current === target) {
        return mid; // Found the target at index 'mid'
      } else if (current < target) {
        left = mid + 1; // Search the right half
      } else {
        right = mid - 1; // Search the left half
      }
    }
  
    return -1; // Target not found in the array
  }
  
  function appendBlankRow(sheet) {
    const lastColumn = sheet.getMaxColumns();
    const lastRow = sheet.getMaxRows();
    const blankRow = new Array(lastColumn).fill(undefined);
    sheet.appendRow(blankRow);
    sheet.getRange(lastRow, 1, 1, lastColumn).setValues([blankRow]);
  }
  