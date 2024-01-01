/**
 * This script automates daily tasks related to updating an 'Approval Status' sheet and a 'Leaderboard' in a spreadsheet.
 * It fetches data from the 'Approval Status' sheet and updates corresponding information in the 'Leaderboard'.
 * It also sorts the 'Leaderboard' based on certain criteria.
 * @OnlyCurrentDoc
 */

//TODO: Impliment "Last updated" and "next updated" on the leaderboard

function processOnDemand(){
  const cell = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Approval Status').getRange('G2');
  const triggerValue = cell.getValue();

  if(triggerValue === true) {
    cell.setValue(null);
    dailyRoutine(); 
  }
  
  cell.insertCheckboxes();
  if(cell.getValue() == true) cell.setValue('CRITICAL ERROR: UN-CHECKBOX IMMEDIATELY'); //Catch the error 
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

  if(approvalSheet.getRange('A3').isBlank()) return;

  const leaderboardSheet = ss.getSheetByName('Star & Lamp Leaderboard'); // Get the 'Leaderboard' sheet
  
  //Sort to alphabetical order to enable binary search
  const NAME_COLUMN = 1;
  leaderboardSheet.getRange(3, 1, leaderboardSheet.getLastRow() - 1, leaderboardSheet.getLastColumn() - 1).activate().sort({column: NAME_COLUMN, ascending: true});

  // Execute pointsToLeaderboard and identify rows to delete in the 'Approval Status' sheet
  let rowsToDelete = pointsToLeaderboard(approvalSheet, leaderboardSheet);

  // Delete identified rows from the 'Approval Status' sheet
  while(rowsToDelete.length != 0){
    approvalSheet.deleteRows(rowsToDelete.pop());
  }

  // Sort the 'Leaderboard' sheet based on the values in the 'Total Points' column
  const TOTAL_POINTS_COLUMN = 2
  leaderboardSheet.getRange(3, 1, leaderboardSheet.getLastRow() - 1, leaderboardSheet.getLastColumn() - 1).activate().sort({column: TOTAL_POINTS_COLUMN, ascending: false});

  //Update the timestamp cell in the 'Leaderboard' sheet
  const TIME_STAMP_CORDS = 'G1';
  updateTimeStamp(leaderboardSheet, TIME_STAMP_CORDS);
}

/**
 * Identifies rows in the 'Approval Status' sheet to delete and updates data in the 'Leaderboard'.
 * @param sheet1 {Sheet} - The 'Approval Status' sheet.
 * @param sheet2 {Sheet} - The 'Leaderboard' sheet.
 * @returns {Array} - Array containing row indices in the 'Approval Status' sheet to delete.
 */
function pointsToLeaderboard(sheet1, sheet2) {
  // Get all the data from 'Approval Status' and 'Leaderboard' sheets at once
  const dataSheet1 = sheet1.getRange(2, 2, sheet1.getLastRow() - 1, sheet1.getLastColumn() - 2).getValues();
  const dataSheet2 = sheet2.getRange(3, 1, sheet2.getLastRow() - 2, 1).getValues().flat();

  const rowsToDelete = []; // Initialize an array to store row indices to delete

  for (let i = 0; i < dataSheet1.length; i++) { // Starting from 1 as header row is skipped
    const colData = dataSheet1[i];
    // Check specific criteria in 'Approval Status' sheet
    if (colData[colData.length - 1] === true) { // Assuming the checkbox is in the last column
      const rowData = dataSheet1[i];

      // Extract specific data from the row
      const name = rowData[0];
      const points = rowData[1];
      const tier = rowData[3];

      // Update 'Leaderboard'
      const foundIndex = binarySearch(dataSheet2, name);
      if (foundIndex !== -1) {
        const totalPointsCell = sheet2.getRange(foundIndex + 3, 2);
        cellAddition(totalPointsCell, points);

        const monthlyCell = sheet2.getRange(foundIndex + 3, 6);
        cellAddition(monthlyCell, points);

        const targetColumn = tier === 'Tier 1' ? 3 : (tier === 'Tier 2' ? 4 : 5);
        const tierCell = sheet2.getRange(foundIndex + 3, targetColumn);
        cellAddition(tierCell, points);
      }

      rowsToDelete.push(i + 2); // Store row indices to delete, incrementing by 1 to account for header row
    }
  }
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

function updateTimeStamp(sheet, cellCoordinates){
  const timeStampCell = sheet.getRange(cellCoordinates); //Retrieve the 'timestamp cell' form the leaderboard sheet
  const TIME_ZONE = 'America/Los_Angeles'; //Get the current timezone
  const currentDate = new Date(); //Get the current date
  const formattedDate = Utilities.formatDate(currentDate, TIME_ZONE, 'MM/dd/yyyy HH:mm'); //Format the data to be more user friendly
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