on('chat:message', function(msg) {
    var DEBUG = true;                   // setting this to TRUE will log debug information to thge API output console

    if (msg.type != 'api') return;              // exit this function immediately if chat message type is NOT "api"
    var parts = msg.content.split(' ');         // otherwise, parse the message content into an array of smaler strings
    if (DEBUG) { log("________________________________________________________________________________"); 
        log("*** Here comes an API call from the chat:message event... parameters = " + parts); }
    
    var command = parts.shift().substring(1);   // the first element in the array is stored in 'command', dropping the '!'; the other elements are shifted to the left
    
    var selectedID = parts.shift();             // the second element MUST contain the ID of the selected TOKEN OR CHARACTER, if any, or '-1'
    var selected = characterData.lazy3(selectedID); // returns an object with properties { r20_token, r20_char, D20_Char }.
        // If '-1' or '' is passed in for an id, all three properties of the lazy3 object will have the value 'undefined'.
    if (DEBUG) { log("     Called from chat:message event. Logging 'selected' data:");
        log(selected.D20_Char);}
    
    var targetID = parts.shift();             // the third element MUST contain the ID of the target TOKEN OR CHARACTER, if any, or '-1'
    var target = characterData.lazy3(targetID); // returns an object with properties { r20_token, r20_char, D20_Char }.
        // If '-1' or '' is passed in for an id, all three properties of the lazy3 object will have the value 'undefined'.
    if (DEBUG) { log("     Called from chat:message event. Logging 'target' data:");
        log(target.D20_Char); }
    
    if (DEBUG) { log("Loaded selected and/or targeted Tokens. Passing these parameters in the parts[] array = " + parts); }

    switch (command) {
  
    case 'attack': {    
        if (DEBUG) { log("*** Now entering ATTACK command subroutine."); }
        if (!selected.D20_Char) { log("   Error: selected D20_Character object is 'undefined'. Breaking..."); break; }
        if (!target.D20_Char) { log("   Error: target D20_Character object is 'undefined'. Breaking..."); break; }
        var weaponSlot = parts[0].toLowerCase();
        if ((weaponSlot != 'off') && (weaponSlot != 'ranged')) { weaponSlot = 'main'; }
        // weaponSlot can be 'main_hand', 'off_hand', or 'ranged'. If an invalid value is given (or none), use 'main_hand'.
        if (!selected.D20_Char.wielded[weaponSlot]) { log("     Error in ATTACK command subroutine: selected.D20_Char.wielded[" + weaponSlot + "] is undefined. (It should be inheriting defaults from D20_Weapon after being loaded in D20_Character.load_fromRoll20Character() ). Breaking..."); break; }
        else if (DEBUG) { log("     About to attack targeted character using the following weapon: (weaponSlot = '" + weaponSlot + "')"); 
            log(selected.D20_Char.wielded[weaponSlot]); }
        
        selected.D20_Char.attack(target.D20_Char, selected.D20_Char.wielded[weaponSlot]); // this code block handles all Melee & Ranged, Standard and Full attacks
        
    } break; // end case ATTACK
    
    case 'attack_mode': { // This command toggles on or off the various 'attack modes' a character can use, accessing the checkboxes on the character sheet directly
//                           Valid attack modes are: Full_Attack, 2Weapon, Charge, Fight_Defensively, Power_Attack, Deadly_Aim, and Total_Defense
//                           if an undefined option is specified, the API will create the attribute and set it to 'on'. This makes it forward-compatable.
        if (DEBUG) { log("Now entering ATTACK_MODE command subroutine."); }
        if (!selected.r20_char) { log("   Error: selected Roll20 Character object is 'undefined'. Breaking..."); break; }
        
        var attk_name = "AttackForm_" + parts[0];

        var charAttribute = findObjs({ _type: "attribute", _characterid: selected.r20_char.id, name: attk_name })[0];
        if (DEBUG) { log(charAttribute); }
        if (!charAttribute) { log("   Warning: selected Roll20 character has no Attribute named '" + attk_name + "'. Creating it now...");
            charAttribute = createObj("attribute", { name: attk_name, current: "", characterid: selected.r20_char.id } ); }
       
        if (charAttribute.get("current")) { // should be equal to 'on' if box is checked
            sendChat("", "/desc (("+ selected.D20_Char.name + ", attack mode " + parts[0] + " is now disabled.))");
            charAttribute.set("current", ""); }
        else { // will be an empty string if box is not checked
            sendChat("", "/desc (("+ selected.D20_Char.name + ", attack mode " + parts[0] + " is now enabled.))");
            charAttribute.set("current", "on"); }
            
        characterData.lazy3(selected.r20_char.id).D20_Char.load_AttackFormsFromRoll20(selected.r20_char);
    //  re-load the entire D20_Character object, just so that the attack_forms will be correct. Needs to be made more efficient, later on.
    } break; // end case ATTACK_MODE

    case 'cast': {               // CAST
        if (!selected.D20_Char) { log("API error from within CAST subroutine: selected token does not represent any character! Exiting... "); break; }
        
        var new_SpellEffect = spellData[parts[0]].onCast( selected.D20_Char, parts[1], target.D20_Char );
//  parts[0] is a property of spellData, the spell name with no spaces or apostrophes. Case-sensitive, must be spelled exactly correct or this code will crash
//  parts[1] needs to be the name of a class. find_class() will .toLowerCase() it.
//  parts[1] can also be left 'undefined', such as with AlchemistsFire. This is an item effect being created as if it were a spell.
        if (DEBUG) { log("Now exiting CAST command subroutine. Result = "); log(new_SpellEffect); }
        } break;          // end case CAST

    case 'clear': {  // CLEAR auras, status markers, and tints from selected Token
        if (DEBUG) { log("Now entering CLEAR command subroutine"); }
        if (selected.r20_token.get('_type') !== 'graphic') { break; }
        if (selected.r20_token.get('isdrawing')) { break; }
        selected.r20_token.set( {aura1_radius:'', aura2_radius:'', statusmarkers:'', tint_color:"transparent" } );
        } break;           // end case CLEAR    
        
    case 'debug': {                                     // DEBUG: list properties of selected object
        log(""); log("<-----DEBUG------------------------------------------------>");
        log("     selected.r20_token = "); log(selected.r20_token);
        log("     selected.r20_char = "); log(selected.r20_char);
        log("     selected.D20_Char = "); log(selected.D20_Char);
        log("     selected.r20_char ---> D20_Char (using lazy3() ) "); log( characterData.lazy3(selected.r20_char.id).D20_Char ); // return the D20_Character object of the Roll20 Character, 
        log("<---------------------------------------------------------->"); log("");
        } break;           // end case DEBUG
        
    case 'export': { // convert the selected Token's Character's D20_Character object to JSON string notation, and store that in the Character's gmnotes property.
        if (!selected) { log("This Token does not represent a Character. You cannot EXPORT it."); break; }
        selected.r20_char.set('gmnotes', JSON.stringify(selected));
        } break;       // end case EXPORT
       
    case 'finish_effect': {   // use this API to finish casting a spell, after the Effect token has been positioned.
        if (DEBUG) { log(" Now entering FINISH_EFFECT command subroutine."); }
        if (!selected.r20_token) {
            if (DEBUG) { log("   API error: there is no selected token! Exiting FINISH_EFFECT..."); }
            sendChat("", "/desc (( You must first select one of your Effect tokens before clicking this Macro! ))");
            break; }
        if (selected.r20_token.get('name').search("effect") === -1) {
            if (DEBUG) { log("   API error: the selected token is not an Effect marker! Exiting FINISH_EFFECT..."); }
            sendChat("", "/desc (( You must first select one of your Effect tokens before clicking this Macro! ))");
            break; }        
   
        var effect_info = JSON.parse(selected.r20_token.get('gmnotes')); // { type: ['spell', 'item'], name_id: Data[property name], caster_id: characterData[caster ID], class_name: string }
        var caster = characterData.lazy3(effect_info.caster_id);
        if (!caster) { log("API error in chat:message event: caster did not load properly from Effect Token gmnotes. Exiting..."); break; }
        else if (DEBUG) { log(effect_info.name_id); log(caster.D20_Char); }

        var success;
        switch (effect_info.type) {
        
        case 'spell': { success = spellData[effect_info.name_id].onFinishCast(caster.D20_Char, effect_info.class_name, selected.D20_Char); } break;
        case 'item': { success = itemData.get(effect_info.name_id).onFinishUse(caster.D20_Char, selected.D20_Char); } break;
        } // end switch (effect_info.type)
        
        if (DEBUG) { log("Now exiting FINISH_EFFECT command subroutine. success = " + success); }

    } break;        // end case FINISH_EFFECT

     case 'repair_graphics': {                                     // REPAIR_GRAPHICS
/*  This function will cycle through ALL of the Tokens in the Campaign, comparing them to the selected one.
    If the token being tested has the same NAME as the selected token AND represents the same character, BUT the imgsrc
    property points to a different (and presumably now deleted) graphic, it will replace that link with the selected Token's imgsrc property.
    This function was written to correct the error that occurs when a token's image is deleted from the graphic library
    without first deleting all the Tokens which use that image, and then end up "hanging out" with no image at all.
*/      if (DEBUG) { log("Now entering REPAIR_GRAPHICS command subroutine"); }
        if (selected.r20_token != null) { repairBrokenGraphicLinks(selected.r20_token.id); }
        else { log("Error: cannot REPAIR_GRAPHICS when no token is selected!") }
        } break;           // end case REPAIR_GRAPHICS 
        
    case 'reveal' : {
// Output this token's character's description to the chat message window, and move it from the gmlayer to the token layer if necessary. 
        if (!selected.r20_char) { log("API error: REVEAL command can not be executed when no Character is selected! Exiting...."); break; }
        else { selected.r20_char.get("bio", function(bio) { if (bio) { sendChat("", "/desc " + bio); } });
            }; // end of if selected Token represents a Chasracter
        if (selected.r20_token.get("layer") === "gmlayer") { selected.r20_token.set("layer", "objects"); }
        } break;            // end case REVEAL
    
    case 'swarm' : { // OUTDATED, prior to lazy3() function
        if (!selectedToken) { log(" Error in Main API SWARM command subroutine: no Token is selected!");
            return; };
            
        if (DEBUG) { log("Now entering SWARM command subroutine. SelectedID = " + selectedID); }
        
        var targets = getCharTokensWithinDistance('all', selected.xPos, selected.yPos, (10 / feetPerUnit), selectedToken.get('_pageid'));
        targets = _.reject(targets, function(element) { return (element.id === selectedToken.id); }); // swarm should not attack itself
        if ((targets == undefined) || (targets.length == 0)) {
            if(DEBUG) { log(" Error in Main API: getCharTokensWithinDistance() returned 'undefined'. Exiting SWARM command subroutine..."); }
            return false; };
            
        if (DEBUG) { log(" getCharTokensWithinDistance() returned " + targets.length + " Token objects."); }

        var damageString = parts[0];
        var oBrace = damageString.indexOf('['); // damage types are always enclosed in braces
        var cBrace = damageString.indexOf(']');
        if ((oBrace != -1) && (cBrace != -1) && (cBrace > oBrace)) { // check for a valid damageType string
            damage = { type: damageString.slice(oBrace + 1, cBrace), // get the type from within the braces
                    roll: damageString.slice(0, oBrace) }; // then, slice damage type off the end, so you don't /roll it
            } // end of code block called if valid damageType is found
        else {
            damage = { type: "", roll: damageString };            
            }; // end of code block for no valid damageType
        
        var damageRoll = 0;
        var damageRollText = ""; var damageRollToolTip = ""; // declared here, used below IF attack hits
        var displayCard = createHTMLDisplay(selected.name, "Swarm Attack", "Not an Action", "", selected.display_color, "");
        
        _.each(targets, function(element, index, list) {
            damageRoll = rollDiceAsString(damage.roll);
            damageRollToolTip = damageRoll.toString() + " (" + damage.roll + " natural weapon damage)"; 
            damageRollText = "vs. <b>" + element.get('name') + "</b>: " + formatInlineRollAsHTML(damageRoll, damageRollToolTip, false, false);
            if (damage.type != '') { damageRollText += " [<i>" + damage.type + "</i>]"; }
            displayCard += appendHTMLRow(displayCard, damageRollText);
            }); // end _.each(targets) iteratee function
        displayCard += appendHTMLRow(displayCard,"...all creatures struck begin to <b>BLEED</b> for " + formatInlineRollAsHTML(1, "", false, true) + 
            " point(s) of damage every round!");
            
        if (DEBUG) { log(displayCard); }
        outputHTMLDisplay("", displayCard);
    } break; // end case SWARM
    
    case 'test_badge': {
        selected.r20_token.set("status_" + parts[0].toLowerCase(), parts[1]);
    } break; // end case TEST_BADGE
    
    case 'test_cast': {
        if (!selected.D20_Char) { log("API error from within TEST_CAST subroutine: selected token does not represent any character! Exiting... "); }
        else { // selected token DOES represent a defined character
        
        // use hasOwnProperty to select the spell from spellData
        
        selected.D20_Char.casting_from_this_class = selected.D20_Char.find_class(parts[1]);  // parts[1] needs to be the name of a class. find_class() will .toLowerCase() it.
        var test_SpellEffect = spellData[parts[0]].onCast( selected.D20_Char ); // parts[0] is a property of spellData, the spell name with no spaces or apostrophes. Case-sensitive, must be spelled exactly correct or this code will crash
        log(test_SpellEffect);
        delete selected.D20_Char.casting_from_this_class;
        } // end (selectedCharacterID != undefined)
    } break; // end case TEST_CAST
    
    case 'test_class': {                // test the searchForClass() utility function
        if (!selected.D20_Char) { log("API error from within TEST_CLASS subroutine: selected token does not represent any character! Exiting... "); }
        else { // selected token DOES represent a defined character
        var test_result = selected.D20_Char.find_class(parts[0]); // parts[0] needs to be the name of a class. find_class() will .toLowerCase() it.
        log(test_result);
        } // end (selectedCharacterID != undefined)
    } break; // end case TEST_CLASS
    
    case 'test_feat': {                // test the searchForClass() utility function
        if (!selected.D20_Char) { log("API error from within TEST_FEAT subroutine: selected token does not represent any character! Exiting... "); }
        else { // selected token DOES represent a defined character
        if (!parts[1]) { parts[1] = ""; }
        var test_result = selected.D20_Char.find_feat( parts[0].replace(/_/g, " "), parts[1].replace(/_/g, " ") ); // parts[0] needs to be the name of a feat. find_feat() will .toLowerCase() it. parts[1] is Feat subtype, if defined
        log(test_result);
        } // end (selectedCharacterID != undefined)
    } break; // end case TEST_FEAT
    
    case 'test_specability': {                // test the searchForClass() utility function
        if (!selected.D20_Char) { log("API error from within TEST_SPECABILITY subroutine: selected token does not represent any character! Exiting... "); }
        else { // selected token DOES represent a defined character
        if (!parts[1]) { parts[1] = ""; }
        var test_result = selected.D20_Char.find_spec_ability( parts[0].replace(/_/g, " "), parts[1].replace(/_/g, " ") ); // parts[0] needs to be the name of a feat. find_feat() will .toLowerCase() it. parts[1] is Feat subtype, if defined
        log(test_result);
        } // end (selectedCharacterID != undefined)
    } break; // end case TEST_CLASS
    
    case 'test_distance': { 
        if (!selected.D20_Char) { log("   Error: selected character object is 'undefined'. Breaking..."); break; }
        if (!target.D20_Char) { log("   Error: target character object is 'undefined'. Breaking..."); break; }
        sendChat("", "/desc (( Distance to foe is calculated as: " + testDistanceToFoe(selected.D20_Char.xPos, selected.D20_Char.yPos, target.D20_Char.xPos, target.D20_Char.yPos) + " feet... ))");        
        } break; // end case TEST_DISTANCE
    
    case 'throw': {   // This will throw the object listed in the character's Item slot (i.e. Alchemist's Fire) as a grenade-like weapon
        if (DEBUG) { log("Now entering THROW command subroutine."); }
        if (!selected.D20_Char) { log("   Error: selected character object is 'undefined'. Breaking..."); break; }
        if (!target.D20_Char) { log("   Error: target character object is 'undefined'. Breaking..."); break; }
//      attack_Standard(attacker, target, weaponUsed); // going to be the same for both Melee and Ranged Standard Attacks
        create_Fire(target.D20_Char.xPos, target.D20_Char.yPos, parts[0], selected.r20_token.get("pageid"));
        
    } break; // end case THROW
    
    case 'trap': { // OUTDATED, prior to lazy3() function
        DEBUG = true;
        if (DEBUG) { log("Now entering TRAP command subroutine.");}
        
        var statusMarkers = '';
        var trapObj = { name: selected.Token.get('name'),
            text: selectedToken.get('gmnotes', function (gmn) { return gmn } ).replace(/%20/g, " ").replace(/%21/g, "!").replace(/%2C/g, ","),
            saveType: selectedToken.get('bar1_value'),
            saveDC: parseInt(selectedToken.get('bar1_max')),
            damageRoll: selectedToken.get('bar2_value'),
            damageType: selectedToken.get('bar2_max'),
            statusMarker: selectedToken.get('bar3_value'),
            condition: selectedToken.get('bar3_max'),
            displayColor: selectedToken.get('aura1_color') };
        if (DEBUG) { log(trapObj); }
        if (isNaN(trapObj.saveDC)) {
            log("   Error in TRAP subroutine: saveDC is NaN! Setting to default of 15...");
            trapObj.saveDC = 15; }
        var displayCard = createHTMLDisplay(trapObj.name, "", "", trapObj.saveType + " Save DC " + trapObj.saveDC.toString(), trapObj.displayColor, "");
        var damageToolTip = (trapObj.damageRoll) ? " (" + trapObj.damageRoll + ")" : "";
        var damageRoll = (trapObj.damageRoll) ? rollDiceAsString(trapObj.damageRoll) : 0;
            
        sendChat("", "/desc " + trapObj.text);
        selectedToken.set("layer", "objects");

        if (DEBUG) { log("Now entering filterObjs predicate function."); }
        var trapTargets = filterObjs(function(obj) {
            if ( obj.id === selectedToken.id) return false; // does not affect itself
            if ( obj.get("_pageid") !== selectedToken.get("_pageid") ) return false; // affect only tokens on the same page
            if ( !obj.get("represents") ) return false; // affect only tokens represented by a character
//            statusMarkers = (obj.get("statusmarkers")) ? obj.get("statusmarkers") : "";
//            if (DEBUG) { log("   ( token " + obj.get("name") + " has status markers = " + statusMarkers + " )"); }
//            if ( statusMarkers !== '') {
//                if ( statusMarkers.search("fluffy-wing") > -1 ) return false; } // does not affect FLYING creatures
            if ( Math.abs( selectedToken.get("left") - obj.get("left") ) <= ( selectedToken.get("width") / 2)  &&
                Math.abs( selectedToken.get("top") - obj.get("top") ) <= ( selectedToken.get("height") / 2) ) { return true; }
            else { return false; }
            } ); // end of filterObjs() predicate function
           
        trapTargets.forEach( function(tok) { 
            var saveBonus = parseInt(getAttrByName(tok.get('represents'), trapObj.saveType));
            if (DEBUG) { log("   (checking token named " + tok.get('name') + ", with a " + trapObj.saveType + " save bonus of " + saveBonus + ")"); }
            if (isNaN(saveBonus)) {
                log("   WARNING: " + tok.get('name') + " is not represented by a Character with an Atrribute named '"+ trapObj.saveType +"'. Default set to 0." );
                saveBonus = 0; }
            
            var savingThrow = randomInteger(20) + saveBonus;
            var savingThrowToolTip = " (1d20) + " + saveBonus.toString() + " ( " + trapObj.saveType + " save modifier)";
            var savingThrowText = "<b>" + tok.get('name') + "</b>: " + formatInlineRollAsHTML(savingThrow, savingThrowToolTip, false, false) + " ";
           
            if (savingThrow >= trapObj.saveDC) {    // this target has SUCCEEDED at its Saving Throw
                savingThrowText += "<b>Success</b>";
                if (DEBUG) { log("   " + tok.get("name") + " rolls a " + trapObj.saveType + " Save of " + savingThrow + ", and is not affected."); }
                if (trapObj.damageRoll) {
                    savingThrowText += "<br>...takes " + formatInlineRollAsHTML(Math.ceil(damageRoll/2), damageToolTip + "<br>÷ 2 (successful save)", false, false) +  " <i>" + trapObj.damageType + "</i> damage."; }
                } // end of Successful save block
            else {      // this target has FAILED its Saving Throw
                savingThrowText += "<b>Failure</b>";
                if (DEBUG) { log("   " + tok.get("name") + " rolls a " + trapObj.saveType + " Save of " + savingThrow + ". Affecting " + tok.get('name') + "!"); }
                if (trapObj.damageRoll) {
                    savingThrowText += "<br>...takes  " + formatInlineRollAsHTML(damageRoll, damageToolTip, false, false) + " <i>" + trapObj.damageType + "</i> damage."; }
                if (trapObj.statusMarker) {
                    savingThrowText += "<br>... and is now <i>" + trapObj.condition + "</i>.";
                    statusMarkers = tok.get('statusmarkers');
                    if (DEBUG) { log("   status markers for this token: " + statusMarkers); }
            
                    if (statusMarkers.indexOf(trapObj.statusMarker) < 0) { // check to see if they already have a status marker marker. If not, add one.
                        if (statusMarkers != "") {statusMarkers += ",";} // add a comma to the end of the list
                        statusMarkers += trapObj.statusMarker;
                        tok.set('statusmarkers',statusMarkers); }      
                    } // end of (trapObj.statusmarker) === true
                } // end of Failed save block
            displayCard += appendHTMLRow(displayCard, savingThrowText);
            } ); // end of trapTargets.forEach())

    outputHTMLDisplay("", displayCard);
    
    } break; // end case TRAP
   
    case 'use': {               // CAST
        if (!selected.D20_Char) { log("API error from within USE subroutine: selected token does not represent any character! Exiting... "); break; }
        
        var new_Item = itemData.get(parts[0].toPropertyName());
        var new_ItemEffect = (new_Item) ? new_Item.onUse( selected.D20_Char, target.D20_Char ) : undefined;
//  parts[0] is a property of spellData, the spell name with no spaces or apostrophes. Case-sensitive, must be spelled exactly correct or this code will crash
//  parts[1] needs to be the name of a class. find_class() will .toLowerCase() it.
//  parts[1] can also be left 'undefined', such as with AlchemistsFire. This is an item effect being created as if it were a spell.
        if (DEBUG) { log("Now exiting USE command subroutine. Result = "); log(new_ItemEffect); }
        } break;          // end case USE

    default: log("     Main API error: " + command + " is not a valid command word.");
    } // end switch(command)  
    
    if (DEBUG) { log("---End of one chat:message event------------------------------------------------"); }

}); // end of on('chat:message') event

// ----- on("change") EVENT HANDLERS -----------------

on("change:attribute", function(obj, prev) {
    var DEBUG = true;
    
// Use characterData.lazy3() to select the r20_char and the corresponding D20_Char reference from the hash_table.
// Don't forget that changed.r20_token will return 'undefined'. D20_Char will be initialized, if needed, by the lazy3() method.

    var changed = characterData.lazy3(obj.get('_characterid'));
    if (DEBUG) { log("*** Called from within change:attribute event handler. Attribute named " + obj.get('name') + " changed for Roll20 Character " + changed.r20_char.get('name') + "."); }
    
// FOR NOW, "just to get it to work", we need to re-load the entire D20_Character, if ANY of the Attributes change.
// This is because the D20_Character.load_fromRoll20Attribute() method is not complete yet.

    changed.D20_Char.load_fromRoll20Character(changed.r20_char); // if lazy3() loaded the character already, this gets invoked twice... :/

}); // end of on("change:attribute") callback function

on("ready", function() {
//  If the "add" or "destroy" events are called for "attributes", rather than a "change" event, this means that one element has been
//  removed from a Repeating Field section via the character sheet. Therefore, that entire Repeating Field block will have to be
//  re-loaded. This will not occur in-game very frequently.

  on("add:attribute", function(obj) {
    var DEBUG = true;
    var changed = characterData.lazy3(obj.get('_characterid'));
    if (DEBUG) { log("*** Called from within add:attribute event handler. Attribute named " + obj.get('name') + " added for Roll20 Character " + changed.r20_char.get('name') + "."); }
  }); // end of on("add:attribute") callback function
  
  on("destroy:attribute", function(obj) {
    var DEBUG = true;
    var changed = characterData.lazy3(obj.get('_characterid'));
    if (DEBUG) { log("*** Called from within destroy:attribute event handler. Attribute named " + obj.get('name') + " destroyed for Roll20 Character " + changed.r20_char.get('name') + "."); }
  }); // end of on("add:attribute") callback function
  
}); // end of on("ready") event block

on("change:token", function(obj, prev) {
    var DEBUG = false;
    if (DEBUG) { log("*** Called from within change:token event handler for Token named " + obj.get('name') + "."); }

    if (obj.get('isdrawing')) { // OK it's a 'drawing'... but, is it a Spell Effect locator?
        if (obj.get('name').search("spell effect") > -1) { // yes, it's a Spell Effect
            var spell_info = JSON.parse(obj.get('gmnotes')); // { spell_id: spellData[property name], caster_id: characterData[caster ID], class_name: string }
            if (!spell_info.reposition) { obj.set( {left: prev.left, top: prev.top} ); }    
            if (!spell_info.rotate) { obj.set('rotation', prev.rotation ); }    
        } // end of "spell effect"
    } else { // if 'isdrawing' is set to false, most likely this is a 'creature token' bound to a character
        var changed = characterData.lazy3(obj.id);
        if (changed.r20_token !== obj) { log("    Fatal error: changed.r20_token !== the Token bound to this on(change) event! Breaking... ");
            return; }
        changed.D20_Char.load_fromRoll20Token(changed.r20_token); // not too "expensive" to re-load the token every time.
    }; // end of !isdrawing
}); // end of on("change:token") callback function

on("change:token:represents", function(obj, prev) {
    var DEBUG = true;

    if (DEBUG) { log("*** Called from within change:token:represents event handler. Token named " + obj.get('name') + " now represents Roll20 Character ID " + obj.get('represents') + "."); }

// Use this when a Token is changed to represent a different Character. If this happens, the Token's D20_Character object will
// need to have it's 'prototype' property changed, so that inheritance will work correctly.

}); // end of on("change:token:represents") callback function

