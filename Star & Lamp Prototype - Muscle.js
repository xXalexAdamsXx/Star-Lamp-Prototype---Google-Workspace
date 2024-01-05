/**
 * This script automates daily tasks related to updating an 'Approval Status' sheet and a 'Leaderboard' in a spreadsheet.
 * It fetches data from the 'Approval Status' sheet and updates corresponding information in the 'Leaderboard'.
 * It also sorts the 'Leaderboard' based on certain criteria.
 * @OnlyCurrentDoc
 */

//TODO: Impliment "next update" on the leaderboard

function processOnDemand(){
  const cell = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Approval Status').getRange('G2');
  const triggerValue = cell.getValue();

  if(triggerValue === true) {
    cell.setValue("Processing... Please wait.");
    dailyRoutine(); 
  }
  
  cell.insertCheckboxes();
  if(cell.getValue() == true) cell.setValue('CRITICAL ERROR. Insert new checkbox'); //Catch a checkbox error 
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
  
  //appendBlankRow(approvalSheet); This line serves as a quick fix to a bug that occurs when the google sheet is full. Doesn't work as intended though

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

/**
 * Identifies rows in the 'Approval Status' sheet to delete and updates data in the 'Leaderboard'.
 * @param sheet1 {Sheet} - The 'Approval Status' sheet.
 * @param sheet2 {Sheet} - The 'Leaderboard' sheet.
 * @returns {Array} - Array containing row indices in the 'Approval Status' sheet to delete.
 */
function pointsToLeaderboard(sheet1, sheet2) {
  // Get all the data from 'Approval Status' and 'Leaderboard' sheets at once
  const dataSheet1 = sheet1.getRange(3, 2, sheet1.getLastRow() - 1, sheet1.getLastColumn() - 2).getValues();
  const dataSheet2 = sheet2.getRange(3, 1, sheet2.getLastRow() - 2, sheet2.getLastColumn() - 1).getValues();
  const dataSheet2Names = sheet2.getRange(3, 1, sheet2.getLastRow() - 2, 1).getValues().flat();
  let rowsToDelete = 0; // Initialize an integer to store row indices to delete

  console.log(dataSheet1[0][4]);
  // Traverse dataSheet1 and search for 
  for (let i = 0; i < dataSheet1.length && dataSheet1[i][4] != undefined; i++) {
    const colData = dataSheet1[i];

    // Check specific approval status in 'Approval Status' sheet
    if(colData[colData.length - 1] === 'Disapproved') rowsToDelete++; //Increment by 1 each time an approved or disapproved row is read
    if (colData[colData.length - 1] === 'Approved') { // Assuming the checkbox is in the last column - 1
      const rowData = dataSheet1[i];

      // Extract specific data from the row
      const name = rowData[0];
      const points = rowData[1];
      const tier = rowData[3];

      // Update 'Leaderboard'
      const foundIndex = binarySearch(dataSheet2Names, name);
      if (foundIndex !== -1) {
        dataSheet2[foundIndex][1] += points; //Add points to 'monthly' column

        dataSheet2[foundIndex][5] += points; //Add points to 'total points' column

        const targetColumn = tier === 'Tier 1' ? 2 : (tier === 'Tier 2' ? 3 : 4);
        dataSheet2[foundIndex][targetColumn] += points; //Add points to 'monthly' column
      }

      rowsToDelete++; // Store row indices to delete, incrementing by 1 each time an approved or disapproved row is read
    } 
  }
  sheet2.getRange(3, 1, sheet2.getLastRow() - 2, sheet2.getLastColumn() - 1).setValues(dataSheet2);
  return rowsToDelete;
}

/**
 * Adds a value to the existing value in a cell.
 * @param cell {Range} - The cell to update.
 * @param value {*} - The value to add to the cell.
 */
function cellAddition(cell, value) {
  cell.setValue(cell.getValue() + value);
}

function updateTimeStamp(sheet, cellCoordinates, timeZone){
  const timeStampCell = sheet.getRange(cellCoordinates); //Retrieve the 'timestamp cell' form the leaderboard sheet
  const currentDate = new Date(); //Get the current date
  const formattedDate = Utilities.formatDate(currentDate, timeZone, 'MM/dd/yyyy HH:mm'); //Format the data to be more user friendly
  timeStampCell.setValue('Last Updated: \n' + formattedDate); //Update the cell value;
}

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
  const lastRow = sheet.getLastRow();
  // Append a blank row
  sheet.insertRowsAfter(lastRow, 1);
}
