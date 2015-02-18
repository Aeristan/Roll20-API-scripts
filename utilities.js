var pixelsPerUnit = 77;  // NOT 70 pixels, this is a vertical hex grid!
var feetPerUnit = 5;     // (just using constants for now, to get it to work)
var pixelsPerUnit = 77;  // did this on purpose. Wasn't recognizing the first declaration of pixelsPerUnit for some reason

/*  Add a beget method to the Object function. The beget method creates a new object that uses an old object as its
    prototype. ref: JavaScript: the Good Parts, Douglas Crockford, chapter 3, pages 22-23.
    
    If a function is invoked with the new prefix, then a new object will be created with a hidden link to the value of
    the function's prototype member, and 'this' will be bound to that new object. [page 29]   */
          
if (typeof Object.beget !== 'function') { // checks to make sure that Object.beget isn't already defined
    Object.beget = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    }; // end of Object.beget function declaration
}; // end of (Object.beget !== 'function')
      

Function.prototype.method = function (name, func) { // Douglas Crockford, JavaScript the Good Parts, page 33
    if (!this.prototype[name]) { this.prototype[name] = func; }
    return this; };

String.method('toPropertyName', function() { return this.replace(/(\s|\u0027)/g, ''); });
// adds a method to the String type which returns the value stripped of spaces and apostrophes

(function() {
// created by Shu Zong C to work-around a known Roll20 bug. Refer to forum post: https://app.roll20.net/forum/post/733277/api-firebase-dot-child-failed-error-help-please#post-733344
    var oldCreateObj = createObj;
    createObj = function() {
    var obj = oldCreateObj.apply(this, arguments);
        if (obj && !obj.fbpath) { obj.fbpath = obj.changed._fbpath.replace(/([^\/]*\/){4}/, "/"); }
    return obj; }
}())
      
function abilityBonus(n) { 
  n = (n < 0) ? 0 : n;
  return (Math.floor(n / 2) - 5);
}; // end of function abilityBonus()

function sizeModifier(s) {
  switch (s.charAt(0).toUpperCase()) {
      
  case 'C': { return -8; } break;     // Colossal
  case 'G': { return -4; } break;     // Gargantuan
  case 'H': { return -2; } break;     // Huge
  case 'L': { return -1; } break;     // Large
  case 'S': { return 1; } break;      // Small
  case 'T': { return 2; } break;      // Tiny
  case 'D': { return 4; } break;      // Diminutive
  case 'F': { return 8; } break;      // Fine
  case 'M':                           // Medium is the default
   default: { return 0; }
  } // end switch(S)
}; // end function sizeModifier() 

function sliceNextAttack(seq) {
    var DEBUG = true;
// This function takes one argument, a string, which is a sequence of one or more attacks. Each attack is an integer, preceeded by
// a plus or minus sign. The attacks in the string are delimited by slash characters. '/' This function modifies the original string.
    var arr = seq.split('/');
    if (DEBUG) { log(" --- called from within String.sliceNextAttack(). The parameter splits into the following array: ");
        log(arr); }
    var n = arr.shift().replace(/[^0-9\u002D]/g, ' '); // this RegExp should remove all characters except digits and minus signs
    if (DEBUG) { log("     The first element, stripped of irrelevant characters, is " + n + ". Return value = " + parseInt(n)); }
    if (isNaN(n)) { log(" --- error in sliceNextAttack(): " + n + " is NaN!"); }
    seq = arr.join('/');
    if (DEBUG) { log("     Setting via 'this' parameter, the following unused portion of the sequence: " + seq + " ."); }
    return { value: parseInt(n), seq: seq };
}; // end function sliceNextAttack()

function rollDiceAsString(exp) {
// A function that takes a diceroll expression as a String (i.e., "AdB±C"), checks for validity, parses it, rolls the dice, and returns an Integer
  var aStr, bStr, cStr, sign = "";
  var A, B, C = 0; // A is number of dice to be rolled, B is the number of sides per die, and C is a positive or negative modifier
  var dPos, mPos = 0;
  var result = 0;
  var DEBUG = false;
  
  if (DEBUG) { log("Now entering function rollDiceAsString. exp = " + exp); }
  exp = exp.replace(" ", ""); // this strips all 'space' characters from the expression
  dPos = exp.search(/d/i); // find the position of the d, case-insensitive
  mPos = exp.search(/[+-]/); // find the position of a '+' or a '-', indicating the presence of a modifier
  
  if (mPos != -1) { // a '+' or '-' has been located, indicating a modifier
      sign = exp.charAt(mPos);
      cStr = exp.slice(mPos + 1); // slice off everything after the ±
      cStr = cStr.replace( /\D/, ""); // this should strip any remaining non-digit from cStr, making it a valid integer
      if (sign === '-') { C -= parseInt(cStr); } // a negative sign yields a negative modifier
      else { C += parseInt(cStr); } // if not a '-', it must be a '+'
      exp = exp.slice(0, mPos); // now exp contains everything up to, but not including, the ±
  } // end of (mPos != -1)
  
  if (dPos != -1) { // if the 'd' has been found, then this is a valid diceroll expression
      bStr = exp.slice(dPos + 1); // any modifier should have already been sliced off the end, so the number of "sides" is everything from the 'd' onward.
      bStr = bStr.replace( /\D/, ""); // this should strip any remaining non-digit from bStr, making it a valid integer
      B = parseInt(bStr);
      aStr = exp.slice(0, dPos); // now, everything up to (but not including) the 'd' is the number of dice to be rolled
      aStr = aStr.replace( /\D/, ""); // this should strip any remaining non-digit from aStr, making it a valid integer
      A = parseInt(aStr);
      
      
  } else { // if there is no 'd', then this should be a constant numeric expression. This can be achieved by setting B (number of sides) = 1.
      aStr = exp.replace( /\D/, ""); // remember: any modifier, if present, should have already been sliced off the end and stored in cStr
      A = parseInt(aStr);
      bStr = '1'; B = 1;
  } // end (dPos == -1)
  
  if (( A == NaN) && ( B == NaN) && ( C == NaN)) {
      if (DEBUG) { log("  -Error in rollDiceAsString: something returned 'NaN'."); 
      log("   A = " + aStr + ", B = " + bStr + ", sign = " + sign + ", C = " + cStr);  } // end if (DEBUG)
      return NaN;
      } // end if A && B && C == NaN
      
  if (B === 1) { // if the number of sides was set to 1, no need to perform a for() loop.
      result = A + C;   
  } else {
      for (var n = 1; n <= A; n++) { result += randomInteger(B); }
      result += C;
  } // end of code block to roll A number of B-sided dice
  
  if (DEBUG) { log("   Exiting function rollDiceAsString, return value = " + result); }
  return result;
} // end function rollDiceAsString

function distanceBetweenPoints (x1, y1, x2, y2) {
// Straight-up Pythagorean theorem, my Friends. Distance returned is in PIXELS.
  return Math.pow(Math.pow((x1 - x2),2) + Math.pow((y1 - y2),2),0.5); 
} // end function distanceToTarget

function convertAngleToRadians (angle) {
// JavaScript's Math library calculates angles in Radians, with 0 being the positive X-axis, and ranging from (-PI) to (PI)
  var a = angle;
  if (a > 270) { a -= 360;}
  a -= 90;
  return ((a / 180) * Math.PI );
} // end convertAngleToRadians;

function convertAngleToDegrees (angle) {
// JavaScript's Math library calculates angles in Radians, with 0 being the positive X-axis, and ranging from (-PI) to (PI)
  var a = (angle / Math.PI * 180);
  a -= 90;
  if (a < 0) { a += 360; }
  return a;
} // end convertAngleToRadians;

function angleFromPointToPointInDegrees (x1, y1, x2, y2) {
// JavaScript's Math library calculates angles in Radians, with 0 being the positive X-axis, and ranging from (-PI) to (PI)
// this function calls the arctangent function and then converts that into Roll20's degree-based angle measurements
  var arctan = (Math.atan2(y1 - y2, x1 - x2) / Math.PI * 180);
  arctan -= 90;
  if (arctan < 0) { arctan += 360; }
  return arctan;
} // end function angleToTargetInDegrees

function distanceOfPointFromLine(point_x, point_y, x1, y1, x2, y2) {
// the math for this was much more difficult, I had to look it up online at URL http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html    
  var numerator = Math.abs( (x2-x1)*(y1-point_y) - (x1-point_x)*(y2-y1) );
  var denominator = Math.sqrt( Math.pow((x2-x1),2) + Math.pow((y2-y1),2) );
  if (denominator == 0) { return 0; } // DIVIDE BY ZERO error. Only happens if you feed in two identical points for (x1,y1) and (x2,y2) by accident.
  else { return (numerator / denominator); }
} // end function distanceOfPointFromLine

function clearAurasAndMarkers(currentPage) {
  var tokensOnPage = findObjs({_type: 'graphic', _subtype: 'token', _pageid: currentPage});
  tokensOnPage.forEach( function(tok) { 
      tok.set( {aura1_radius:'', aura2_radius:'' } );
      tok.set( {statusmarkers:'', tint_color:"transparent" } );
  } ); //end tokensOnPage.forEach()
}; //end function clearAurasAndMarkers

function debugObject(obj) {
  log(obj);
}; //end function debugObject

function create_Fire(xPos, yPos, color, pageID) {
    var fireToken = createObj("graphic", {name: "Fire", _subtype: "token", pageid: pageID, layer: "objects",
                    imgsrc: "https://s3.amazonaws.com/files.d20.io/images/5764485/FRzPK0vO0LP14DUruWMMfQ/thumb.png?1411978042", 
                    left: xPos, top: yPos - 8, width: 76, height: 87, rotation: 0, isdrawing: true } );   // end of createObj() function
    if (color.toUpperCase() === 'BLUE') {
        fireToken.set( { name: "Alchemist's Fire", imgsrc: "https://s3.amazonaws.com/files.d20.io/images/5764486/U6KZR3rD6sqz4vCklZzSLQ/thumb.png?1411978050" } ); };
    toFront(fireToken);
    return fireToken;
}; // end function create_Fire()

function statusMarkerBadge(n) { // 1-9 ia returned as String, 10 is a "0", and >10 (or <= 0) has no badge set
  if ((n > 10) || (n <= 0)) { return ""; }
  if (n === 10) { return "0"; }
  return n.toString();
}; // end function statusMarkerBadge

function genderPronouns(gender) {
  var pron = [ 'it', 'it', 'its' ];
  switch (gender.toLowerCase() ) {
      case 'female': { pron = [ 'she', 'her', 'her']; } break;
      case 'male': { pron = [ 'he', 'him', 'his']; } break;
      case 'both': { pron = [ 'they', 'them', 'their']; } break;
      default: { } 
  } // end switch (gender)
  return pron;
}

function getTokensWithinArea(pageID, x, y, distance, direction, angle, path_width) {
//  coded by Sarjenka Aeristan for use with Roll20, last modified December 2014

/*  This function returns an array of all of the D20_Character references to "token" level objects on the specified page that are within a certain distance of point (x, y).
  Distance should be passed to the function in UNITS and then converted to pixels. 
  If the angle parameter is supplied, the area will be a cone of specified angle, pointing in direction angle.
  If the path_width parameter is supplied, the area will be a linear path of specified width, pointing in direction angle. (Angle should be set to undefined.

  The function will ONLY return those Tokens which are represented by a Character (otherwise they are assumed not to be "creatures".)
*/
  var DEBUG = false;                // set to TRUE to log to the API output console
  var onlyCharacters = true;
  distance = (distance) ? (distance * pixelsPerUnit) : undefined;  // convert to PIXELS
  angle = (angle) ? (angle) : ( (path_width) ? 180 : undefined );  // if checking path_width, need to use angle to make sure it is on "correct side" of path, not extending "behind" caster.
  path_width = (path_width) ? (path_width * pixelsPerUnit) : undefined; // convert to PIXELS.

  if (DEBUG) { log("Called from within getTokensWithinArea. (pageID = " + pageID + ") (x = " + x + ") (y = " + y + ") (distance = " + distance + ") (angle = " + angle + ") (path_width = " + path_width + ")"); }
  
  var selected_tokens = filterObjs(function(obj) {
      if (obj.get('_type') != 'graphic' || obj.get('_subtype') != 'token' || obj.get('_pageid') != pageID) return false;

      if (DEBUG) { log("   checking token on page: " + obj.get('name') + ", representing " + obj.get('represents') ); }
      // Test to see if this token represents a character. Only Tokens representing a character will be selected.
      if ( (obj.get('represents') === '') && (onlyCharacters) ) return false;

      if (distance) {
	  var d = Math.round( distanceBetweenPoints(x, y, obj.get("left"), obj.get("top")) );
	  if (DEBUG) { log("   distance from center to this token: " + d + " pixels."); }
	  if (d > distance) { return false; } }

      if ((direction) && (angle)) {
	  var arctan = angleFromPointToPointInDegrees(x, y, obj.get('left'), obj.get('top'));
	  if (DEBUG) { log("   angle from center to this token: " + arctan + " degrees."); }
	  if ((Math.abs(arctan - direction) > (angle / 2)) && (Math.abs((arctan - 360) - direction) > (angle / 2))) { return false; } }
	  
      if ((direction) && (path_width)) {
	  //  In order to come up with the second coordinates of our imaginary line, we'll use sine and cosine functions.
	  var x2 = x + (Math.cos(convertAngleToRadians(direction)) * 100);
	  var y2 = y + (Math.sin(convertAngleToRadians(direction)) * 100);
	  var point_dist = distanceOfPointFromLine(obj.get('left'), obj.get('top'), x, y, x2, y2);
	  if (point_dist > (path_width / 2)) { return false; } }
	  
      return true; } ); // end of filterObjs callback function
      
  var result = [ ]; // needs to return D20_Character objects, not Roll20 Tokens,
  _.each( selected_tokens, function(element, iterator, list) { result.push( characterData.lazy3(element.id).D20_Char ); }); // end of _.each( selected_tokens) 

  if (DEBUG) { log("---output of getTokensWithinArea function = ");
      _.each( result, function(element, iterator, list) { log(element); });
      log("---exiting getTokensWithinArea function now.");
      } // if DEBUG
  return result;
}; // end function getTokensWithinArea

function repairBrokenGraphicLinks(correctID) {
/*  This function will cycle through ALL of the Tokens in the Campaign, comparing them to the selected one.
  If the token being tested has the same NAME as the selected token AND represents the same character, BUT the imgsrc
  property points to a different (and presumably now deleted) graphic, it will replace that link with the selected Token's imgsrc property.
  This function was written to correct the error that occurs when a token's image is deleted from the graphic library
  without first deleting all the Tokens which use that image, and then end up "hanging out" with no image at all.
*/  var DEBUG = true;
  var correctToken = getObj('graphic', correctID);   //Get the object ref of the caster from the ID
  if (correctToken == undefined) {
      log("Warning: Error inside repairBrokenGraphicLinks: 'correctToken' has come out 'undefined'. Exiting function...");
      return false; }
      
  var correctName = correctToken.get('name');
  var correctCharID = correctToken.get('represents');
  var correctImage = correctToken.get('imgsrc');
  
  if (DEBUG) { log("Called from within Utility repairBrokenGraphics(). Selected token is named " + correctName + " and has ID=" + correctID); }
  
  var max = correctImage.search('max.png');
  if (max != -1) { correctImage = correctImage.replace('max.png', 'thumb.png'); } // graphics must always be set with thumb format
  var n = 0;
  
  var result = filterObjs(function(obj) {
      if (obj.get('type') != 'graphic' || obj.get('subtype') != 'token') return false;

      var thisName = obj.get('name');
      var thisCharID = obj.get('represents');
      var thisImage = obj.get('imgsrc');
      
      if (DEBUG) { log("   checking token on page: " + thisName + ", representing " + thisCharID); }
      if ((thisName == correctName && thisCharID == correctCharID) && (thisImage != correctImage)) {
	  if (DEBUG) { log("   Found a 'wayward' token, changing its .imgsrc from " + thisImage + " to " + correctImage); }    
	  n++;
	  return true;
      } // end of ((thisName == correctName && thisCharID == correctCharID) && (thisImage != correctImage))
      return false;
  } ); // end of filterObjs() callback function
  
  if (DEBUG) { log("   There are now a total of " + result.length + " elements in the result array. There should be " + n + "."); }
  _.each(result, function(element, iterator, list) { element.set('imgsrc', correctImage); } ); // end of _.each(result) callback function
  if (result.length > 0) { return true; } else { return false; }
}; // end function repairBrokenGraphicsLinks    

function testDistanceToFoe(x1, y1, x2, y2) {
  return (Math.round(distanceBetweenPoints(x1, y1, x2, y2) / pixelsPerUnit * feetPerUnit));    
}; //end function testDistanceToFoe

