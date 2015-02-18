function createHTMLDisplay(dispName, dispLeftSub, dispRightSub, dispThirdLine, dispColor, dispToolTip) {
// based on the Power Card Script by HoneyBadger

// USER CONFIGUATION
    var ROUNDED_CORNERS = false;
	var ROUNDED_INLINE_ROLLS = true;
	var BORDER_SIZE = 1;
	var BORDER_COLOR = "#000"; // black

// Format the styling for the Title Block
	var textColor = ( hexDec(dispColor) / hexDec('FFFFFF') < 0.5) ? "#FFFFFF" : "#000000"; // uses white text on dark backgrounds, black text on lighter backgrounds
	
	var TitleStyle = " font-family: Tahoma; font-size: large; font-weight: normal; text-align: center; vertical-align: middle; padding: 5px 0px; margin-top: 0.2em; ";
	    TitleStyle += "border: 1px solid #000; border-radius: 10px 10px 0px 0px;"; // rounded corners
	    TitleStyle += " color: " + textColor + "; background-color: " + dispColor + '";';
	    
// Begin creating the HTML text string to build the DisplayCard's top (Title) <div>
	var newDiv = '<div style="' + TitleStyle;
    if (dispToolTip) { newDiv += ' title="' + dispToolTip + '"; class="a showtip tipsy-n";>'; } else {newDiv += '>'; }
	if (dispName) { newDiv += dispName; }
	if ((dispLeftSub) || (dispRightSub)) {
        newDiv += "<br><span style='font-family: Tahoma; font-size: small; font-weight: normal;'>" + dispLeftSub + " ★ " + dispRightSub + "</span>"; }
    if (dispThirdLine) { // the dispThirdLine argument is optional
        newDiv += "<br><span style='font-family: Tahoma; font-size: small; font-weight: normal;'>" + dispThirdLine + "</span>"; }
    newDiv += "</div>";
              
	return newDiv; // return the string of HTML code that this function has initialized
}; // end function createHTMLDisplay()

function appendHTMLRow(currentDiv, rowContent) {
// formats rowContent into HTML elements, and concatenates that as a row to the ongoing DisplayCard. Function returns new HTML div as a string.
// ROW STYLE VARIABLES

	var DEBUG = false;
	var OddRow = "#CCCCCC";
	var EvenRow = "#B8B8B8";

	var newDiv = "<div style='background-color: ";
	var RowStyle = "padding: 5px; border-left: 1px solid #000; border-right: 1px solid #000; border-radius: 0px; color: #000000;'>";
	
	if (DEBUG) { log("--- Now entering function appendHTMLRow()."); }
	
	// look at the currentDiv to find the background style of the previous row. If it is an OddRow, make this one EvenRow.
	var n = currentDiv.lastIndexOf("<div style='background-color:");  // 30 chars
	if (n == -1) { newDiv += OddRow + "; ";}
	else {
		var prevRow = currentDiv.substr(n + 30, 7);
		var thisRow = (prevRow === OddRow) ? EvenRow : OddRow;
		if (DEBUG) { log("    previous row's background color was: " + prevRow + ". This row's background color will be: " + thisRow); }
		newDiv += thisRow + "; ";		
	}
	
	// begin adding visible text to this row of HTML
	newDiv += RowStyle;
	newDiv += rowContent;
	newDiv += "</div>";
	return newDiv;

}; // end function appendHTMLRow();

function outputHTMLDisplay(displayCard) {
// takes a string argument containing HTML elements & formatting, outputs this using sendChat( /direct )
// This function will ALSO add the rounded corners and bottom border to the last <div> within displayCard.
    sendChat("", "/desc ");  // this is needed to avoid the known bug where a ":" is displayed in the chat window after every 6 /directs
    displayCard = displayCard.replace(/border-radius: 0px;(?!.*border-radius: 0px;)/g, "border-radius: 0px 0px 10px 10px; border-bottom: 1px solid #000;");
    sendChat("", "/direct " + displayCard);
}; // end function outputHTMLDisplay;

function makeMeGreen(exp) {
// this function takes any expression (usually a number) and wraps it in an HTML <span> tag that makes it GREEN.
// this uses the 'basicdiceroll critsuccess' CSS class which is pre-defined for Roll20.
    var rollOut = "<span class='basicdiceroll critsuccess'>";
	rollOut += exp + "</span>";
    return rollOut;
};

function makeMeRed(exp) {
// this function takes any expression (usually a number) and wraps it in an HTML <span> tag that makes it RED.
// this uses the 'basicdiceroll critfail' CSS class which is pre-defined for Roll20.
    var rollOut = "<span class='basicdiceroll critfail'>";
    rollOut += exp + "</span>";
    return rollOut;
};

function formatInlineRollAsHTML(value, expression, crit, fail, background_color) {
    var DEBUG = false;
    background_color = background_color || "#FFFFFF";
    var rollOut = '<span style="font-family: Arial; font-size: 100%; font-weight: bolder; text-align: center; vertical-align: text-middle; color: black; background-color: ' + background_color + '; display: inline-block; min-width: 1.75em; border-radius: 5px; padding: 2px 0px 0px 0px;" title="' + expression + '";';
    
    if (DEBUG) {
        log("--- Now entering function formatInlineRollAsHTML().");
        log("    value = " + value + "; expression = " + expression + ", crit = " + crit + ", fail = " + fail); } // end DEBUG
   
	rollOut += ' class="a inlinerollresult showtip tipsy-n';
    if ((crit) && (fail)) { rollOut += ' importantroll'; }
    else if (crit) { rollOut += ' fullcrit'; }
    else if (fail) { rollOut += ' fullfail'; }
    rollOut += '";>' + value + '</span>';
    
    if (DEBUG) {
        log("--- Now exiting function formatInlineRollAsHTML(). Return value of function = ");
        log(rollOut);
        log(" "); }
        
	return rollOut;
}; // end formatInlineRollAsHTML()

function hexDec(hex_string) {
	hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
	return parseInt(hex_string, 16);
}; // end function hexDec(); */
