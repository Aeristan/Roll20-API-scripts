var D20_Spell = {
    name: '',
    school: 'universal',
    descriptors: [ ], // such as 'Mind-Affecting', 'Light', 'Fear', 'Good', etc
    caster_list: [ ], // [ ['class', level], ['class', level] ]
    cast_time: 'standard action',
    components: {
        v: true,
        s: true,
        m: false,
        f: false,
        df: false } ,
    range: 'caster', // A string. In a spell declaration, will usually be a formula, i.e., 'Close', 'Medium', 'Long', etc.
    range_inc: undefined, // may be set to a range increment, in feet, by those spells which require a Ranged attack roll
    area: 0, // Integer. Feet
    area_shape: '', // for an area-effect spell
    targets: [ ], // an array of references to D20_Character objects for targeted spell
    duration: '',   // A string. In a spell declaration, will usually be a formula, i.e., '1 minute / level'.
    saving_throw: 'none', // may be 'fortitude', 'reflex', or 'will'
    attack_type: 'none', // may consist of 'melee' or 'ranged', as well as 'standard' or 'touch'
    save_DC: '-err-', // just here to prevent errors. This should NEVER be displayed, as createHTMLDisplay() should only be called AFTERr createSpellEffect()
    spell_resistance: 'harmless',
    description_text: '', // text
    link: '', // a URL to wherever you got the spell from, or, the name and page number of a printed book
    DEBUG: true, // if set to true, this spell's methods will log to the output console
    
    onCast: function(caster, class_name) {

    if (this.DEBUG) { log("Called from within D20_Spell.onCast() { name='" + this.name + "', caster='" + caster.name + "', class_name='" + class_name + "' }");
        log("---method is empty, inheriting from D20_Spell prototype"); }
            
// <-------------------------------------->

// If this spell is "instantaneous" and requires no positioning of any Spell Effect Tokens in the UI (such as 'Bless'), then
// onCast() can simply invoke onFinishCast(). If this spell requires the creation of a Spell Effect Token (such as 'Sleep' or
// 'Color Spray', this method creates that Token and assigns to it a reference to an objetc containing the spell variables.)

// !!! Need to write code to check that the Spell Effect locator is not outside the spell's effective range, based on caster level

//    var new_SpellEffect = createObj("graphic", { name: caster.name + "'s " + this.name + " spell effect",
//        _subtype: "token", pageid: caster.page_ID, layer: "objects",
//        imgsrc: "https://s3.amazonaws.com/files.d20.io/images/4167432/QN_dRsOM0idvf5zuTNFZ1Q/thumb.png?1401104007", // this is the link to the generic 'Spell Effect' black targeting marker I provided, some spells (like 'Color Spray') will change this value
//        left: caster.xPos, top: caster.yPos, width: 76, height: 87, rotation: 0,
//        controlledby: caster.r20_char.get("controlledby"), aura1_radius: this.area, aura1_color: "#9999FF",
//        showname: true, showplayers_name: true, playersedit_name: false,  playersedit_bar1: false,  playersedit_bar2: false,  playersedit_bar3: false,  playersedit_aura1: false,  playersedit_aura2: false,
//        gmnotes: JSON.stringify( {spell_id: this.name.replace(/\s\u0027/g, ''), caster_id: caster.id} ) // store the Roll20 character ID of the caster in the gmnotes field.
//        } );   // end of createObj() function
//    toFront(new_SpellEffect);
//    sendChat("", "/desc (("+ caster.name + ", please position your " + this.name + " spell effect, then click the 'Finish' button.))");

// <-------------------------------------->

    return false; // nothing was done, normally will return new_SpellEffect;
    }, // end of onCast()
    
    onFinishCast: function() {
        
    if (this.DEBUG) { log("Called from within D20_Spell.onFinishCast() { name='" + this.name + "'}");

        log("---method is empty, inheriting from D20_Spell prototype"); }
        
// <-------------------------------------->

// Invoke getTokensWithinArea(pageID, x, y, distance, direction, angle, path_width) if area of effect (rewritten Dec 2014, Utilities.js, still returns array of Roll20 Tokens)

// OR - if using the Roll20 graphic interface @{target|token_id} (which would by now already be parsed into D20_Character from withing the Main API (on:chat:messge) event), just include this as a second parameter
// BUT - does it then get stored in new_SpellEffect.targets as a D20_Character object reference, or, a Roll20 Token object reference ???

// Iterate through results as necessary (saving throws, affects only allies, or whatever)

// Create the new_SpellEffect AFTER the exact targets (D20_Character references) have been determined, but, BEFORE those targets are affected (so that appendHTMLRow() may be used 'as we go')

// var new_SpellEffect = this.create_SpellEffect(caster, targets);  <-- Targets are stored as Roll20 Token objects (?)

// var HTML_Output = new_SpellEffect.create_HTMLDisplay();

// _.each(targets) { using appendHTMLRow( HTML_Output , rowContent ); }

// perform other Roll20-related updates (status markers, tints and aura colors, etc)

//  --- NOT IMPLEMENTED YET --- append a reference to this SpellEffect to the spell_effects[] array of all of the targets IF they have been computed into D20_Character objects and IF you have arranged to keep this object after the script has finished executing

//    outputHTMLDisplay(HTML_Output);

// <-------------------------------------->

    return false; // nothing was done
    }, // end of onFinishCast()
    
    onExpire: function() {
        
    if (this.DEBUG) { log("Called from within D20_Spell.onExpire() { name='" + this.name + "'}");
        
        log("---method is empty, inheriting from D20_Spell prototype"); }
    return false; // nothing was done
    }, // end of onExpire()

    create_SpellEffect: function(caster, class_name, targets) { // caster is a reference to a D20_Character object, targets currently stores one or more D20_Character references

    if (this.DEBUG) { log("Called from within D20_Spell.create_SpellEffect() { name='" + this.name + "', caster=" + caster.name + ", casting from class '" + class_name + "' }" ); }

    var casting_from_this_class = caster.find_class(class_name);
    if (!casting_from_this_class) {
        log("Error in D20_Spell.createSpellEffect(): " + caster.name + " cannot cast spell named " + this.name + " because the specified class '" + class_name + "' is not found inside the caster's char_class[] array. Exiting...");
        return undefined; }
    var spell_level = _.find(this.caster_list, function(e) { return ( e[0] === casting_from_this_class.name.toLowerCase() ); } ); // returns an array with two elements, ['class_name', level], if found
    if (!spell_level) {
        log("Error in D20_Spell.createSpellEffect(): " + caster.name + " cannot cast spell named " + this.name + " because the specified class '" + class_name + "' is not found inside this spell's caster_list[] array. Exiting...");
        return undefined;
    } else { spell_level = spell_level[1]; } // the second element of the returned array
    var result = _.extend(Object.beget(this), { // a SpellEffect inherits from the D20_Spell object which creates it with this method,
        spell_level: spell_level,               // and adds the following properties...
        caster_level: casting_from_this_class.level,
        cast_by_this_class: casting_from_this_class,
//        range: 0,
//        area: 0,
//        duration: 1,
        save_DC: 10 + spell_level + abilityBonus(caster.abilities[casting_from_this_class.PR]),
        caster: caster, // a reference to the character that cast the spell, of D20_Character
        targets: (targets) ? targets : [ ] // targets currently stores one or more D20_Character references. This is done in the onCast() method, from which the createSpellEffect() method is generally called.
        });
    
    var o_parenth = this.school.indexOf('(');
    var school_only = (o_parenth !== -1) ? this.school.substring(0, o_parenth).trim() : this.school;
    if (this.DEBUG) { log("Searching for Spell Focus Feat for the school of " + school_only);
        log( caster.find_feat("Spell Focus", school_only)[0] ); }
    if ( caster.find_feat("Spell Focus", school_only)[0] ) { result.save_DC += 1; }
    if ( caster.find_feat("Spellcasting Prodigy", casting_from_this_class.PR)[0] ) { result.save_DC += 1; }
    
    if (this.DEBUG) { log("   exiting create_SpellEffect(). Returned result = ");
        log(result); }
    return result;
    }, // end of createSpellEffect()
  
    create_HTMLDisplay: function() {

    return createHTMLDisplay( "<i>" + this.name + "</i>", // the title, in large print at the top.
        this.cast_by_this_class.name + " Spell", // the name of the class from which this spell was cast
        this.cast_time, // usually will be "Standard Action"
        (this.saving_throw === 'none') ? '' : ( "opposed by " + this.saving_throw + " DC " + this.save_DC ), // computed saving throw information
        this.caster.display_color, // background color for the title <div>
        this.description_text ); // the ToolTip text
    } // end of createHTMLDisplay()
 
}; // end of D20_Spell object declaration

var spellData = { // one large global object, the properties of which will be objects of D20_Spell
    DEBUG: true,
    add_Spell: function(spell) {   // strip out: spaces, apostrophes (')
        spellData[spell.name.toPropertyName()] = _.extend(Object.beget(D20_Spell), spell);
        if (this.DEBUG) { log("Added spell '" + spell.name + "' to spellData." + spell.name.toPropertyName() ); }
        } // end of add_Spell()
}; 

// BEGIN SPELL DECLARATIONS HERE __________________________________________________________________________
spellData.add_Spell( {
    name: 'Bane',
    school: 'enchantment (compulsion)',
    descriptors: ['Fear', 'Mind-Affecting'],
    caster_list: [ ['priest',1] ], // [ ['class', level], ['class', level] ]
    cast_time: '1 standard action',
    components: { v: true, s: true, m: false, f: false, df: true } ,
    range: 'caster', // the caster
    area: 50,       // 50 foot burst centered on the caster
    area_shape: 'burst', 
    duration: '1 minute / level', 
    saving_throw: 'Will',
    spell_resistance: 'yes',
    description_text: 'Bane fills your enemies with fear and doubt. Each affected creature takes a –1 penalty on attack rolls and a –1 penalty on saving throws against fear effects. Bane counters and dispels bless.', // text
    link: 'http://paizo.com/pathfinderRPG/prd/spells/bane.html#bane',
    DEBUG: true,
    
    onCast: function(caster, class_name) { return this.onFinishCast(caster, class_name); }, // spell is cast and finished in the same moment
   
    onFinishCast: function(caster, class_name) {   
    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onFinishCast()"); }

// Select all of the character-Tokens on the same page within a 50 foot radius area of the caster, including the caster,
// giving ONLY PCs and their allies (Attitude = 'helpful' or 'friendly') a BLUE status marker if they do not already have one.

    var spell_recipients = getTokensWithinArea( caster.page_ID, caster.xPos, caster.yPos, (this.area / feetPerUnit) ); // returns D20_Character references now
    if (!spell_recipients[0]) { log("---error: getTokensWithinArea() returned no matches. Should have at least included the caster. Exiting...");  return false; }
    if (this.DEBUG) { log( spell_recipients ); }
            
    if (this.DEBUG) { log(" Filtering spell recipients based on Attitude attribute"); }
    spell_recipients = _.filter(spell_recipients, function(targ) { return caster.isFoe(targ); } ); // this spell affects only allies of the caster
    if (!spell_recipients[0]) { log("---warning: _.filter based on caster.isFoe() returned no matches."); }
    if (this.DEBUG) { log( spell_recipients ); }

    var new_SpellEffect = this.create_SpellEffect(caster, class_name); // targets are now D20_Character references
    
    if (!new_SpellEffect) { log("--- YOU GOT PROBLEMS: create_SpellEffect() method does not work & returned undefined. Exiting. "); return undefined;  }
        
    var HTML_Output = new_SpellEffect.create_HTMLDisplay();

// _.each(targets) { using appendHTMLRow( HTML_Output , rowContent ); }

    if (this.DEBUG) { log(" Affecting spell recipients..."); }
    _.each(spell_recipients, function(target) {
        var save_result = target.roll_will(new_SpellEffect.save_DC); // returns a custom object with properties { value, modifier, raw, DC, success, n20, n1, tool_tip }
        if (this.DEBUG) { log("   Will saving throw = " + save_result.tool_tip + " Save DC = " + save_result.DC + "."); }
    // The <span> for the Saving Throw Roll includes the roll itself as well as the tooltip.        
        var savingThrowText = "vs. <b>" + target.name + "</b>: " + formatInlineRollAsHTML(save_result.value, save_result.tool_tip, save_result.n20, save_result.n1 ); 
        if (save_result.success) { savingThrowText += " <b>Success</b><br>...the spell has no effect."; }
        else { // did not succeed at the Saving Throw
            new_SpellEffect.targets.push(target);
            if (this.DEBUG) { log("   Baneing " + target.name + "."); }
            savingThrowText += " <b>Failure</b>. ";
            if (target.r20_token.get("status_blue")) {  // Bane counters and dispels Bless
                savingThrowText += target.name + " is no longer <i>Blessed!</i>";
                target.r20_token.set("status_blue", false); }
            else { // if target is not currently Blessed, it gets Baned
                savingThrowText += target.name + " has been <i>Baned!</i>";
                target.r20_token.set("status_brown", new_SpellEffect.caster_level * 10); }  
            }; // end of failed saving throw
        
        HTML_Output += appendHTMLRow(HTML_Output, savingThrowText);
    }); // end _.each(target_array)
         
         
    caster.r20_token.set( {aura1_radius: this.area, aura1_color: "#996633", tint_color: "#996633" } );
//  --- NOT IMPLEMENTED YET --- append a reference to this SpellEffect to the spell_effects[] array of all of the targets IF they have been computed into D20_Character objects and IF you have arranged to keep this object after the script has finished executing

    outputHTMLDisplay(HTML_Output); 
    return new_SpellEffect; 
    } // end of onFinishCast()
  
 } ); // end of spellData.Bane

spellData.add_Spell( {
    name: 'Bless',
    school: 'enchantment (compulsion)',
    descriptors: ['Mind-Affecting'],
    caster_list: [ ['priest',1] , ['paladin',1] ], // [ ['class', level], ['class', level] ]
    cast_time: '1 standard action',
    components: { v: true, s: true, m: false, f: false, df: true } ,
    range: 'caster', // the caster
    area: 50,       // 50 foot burst centered on the caster
    area_shape: 'burst', 
    duration: '1 minute / level',  
    description_text: 'Bless fills your allies with courage. The caster and each ally within 50 feet gains a +1 morale bonus on attack rolls and on saving throws against fear effects. Bless counters and dispels bane.', // text
    link: 'http://paizo.com/pathfinderRPG/prd/spells/bless.html#bless',
    DEBUG: true,
    
    onCast: function(caster, class_name) { return this.onFinishCast(caster, class_name); }, // spell is cast and finished in the same moment
   
    onFinishCast: function(caster, class_name) {
    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onFinishCast()"); }

// Select all of the character-Tokens on the same page within a 50 foot radius area of the caster, including the caster,
// giving ONLY PCs and their allies (Attitude = 'helpful' or 'friendly') a BLUE status marker if they do not already have one.

    var spell_recipients = getTokensWithinArea( caster.page_ID, caster.xPos, caster.yPos, (this.area / feetPerUnit) ); // returns D20_Character references now
    if (!spell_recipients[0]) { log("---error: getTokensWithinArea() returned no matches. Should have at least included the caster. Exiting...");  return false; }
    if (this.DEBUG) { log( spell_recipients ); }
            
    if (this.DEBUG) { log(" Filtering spell recipients based on Attitude attribute"); }
    spell_recipients = _.filter(spell_recipients, function(targ) { return caster.isFriend(targ); } ); // this spell affects only allies of the caster
    if (!spell_recipients[0]) { log("---error: _.filter based on caster.isFriend() returned no matches. Should have at least included the caster. Exiting..."); return false; }
    if (this.DEBUG) { log( spell_recipients ); }

    var new_SpellEffect = this.create_SpellEffect(caster, class_name, spell_recipients); // targets are now D20_Character references
    
    if (!new_SpellEffect) { log("--- YOU GOT PROBLEMS: create_SpellEffect() method does not work & returned undefined. Exiting. "); return undefined;  }
        
    var HTML_Output = new_SpellEffect.create_HTMLDisplay();

// _.each(targets) { using appendHTMLRow( HTML_Output , rowContent ); }

    if (this.DEBUG) { log(" Affecting spell recipients..."); }
    _.each(spell_recipients, function(element, index, list) { // D20_Character references
        if (this.DEBUG) { log("   Blessing " + element.name + "."); }
        if (element.r20_token.get("status_brown")) {  // Bless counters and dispels Bane
            HTML_Output += appendHTMLRow(HTML_Output, "<b>" + element.name + "</b> is no longer <i>Baned!</i>");
            element.r20_token.set("status_brown", false); }
        else { // if target is not currently Baned, it gets Blessed
            HTML_Output += appendHTMLRow(HTML_Output, "<b>" + element.name + "</b> has been <i>Blessed!</i>");
            element.r20_token.set("status_blue", new_SpellEffect.caster_level * 10); }
        } ); // end of _.Each(spellRecipients)        
            
    caster.r20_token.set( {aura1_radius: this.area, aura1_color: "#A4C2F4", tint_color: "#A4C2F4" } );

//  --- NOT IMPLEMENTED YET --- append a reference to this SpellEffect to the spell_effects[] array of all of the targets IF they have been computed into D20_Character objects and IF you have arranged to keep this object after the script has finished executing

    outputHTMLDisplay(HTML_Output);
    return new_SpellEffect; 
    } // end of onFinishCast()
   
 } ); // end of spellData.Bless

spellData.add_Spell( {
	name: 'Charm Person',
    school: 'enchantment (compulsion)',
    descriptors: ['Mind-Affecting'],
    caster_list: [ ['bard',1] , ['sorcerer',1], ['wizard',1] ], // [ ['class', level], ['class', level] ]
    cast_time: '1 standard action',
    components: { v: true, s: true, m: false, f: false, df: false } ,
    range: 'Close', // A string. In a spell declaration, will usually be a formula, i.e., 'Close', 'Medium', 'Long', etc.
    duration: '1 hour / level',  
    saving_throw: 'Will',
    spell_resistance: 'yes',
    description_text: "This charm makes a humanoid creature regard you as its trusted friend and ally (treat the target's attitude as friendly). If the creature is currently being threatened or attacked by you or your allies, however, it receives a +5 bonus on its saving throw. The spell does not enable you to control the charmed person as if it were an automaton, but it perceives your words and actions in the most favorable way. You can try to give the subject orders, but you must win an opposed Charisma check to convince it to do anything it wouldn't ordinarily do. (Retries are not allowed.) An affected creature never obeys suicidal or obviously harmful orders, but it might be convinced that something very dangerous is worth doing. Any act by you or your apparent allies that threatens the charmed person breaks the spell. You must speak the person's language to communicate your commands, or else be good at pantomiming.", // text
    link: 'http://paizo.com/pathfinderRPG/prd/spells/charmPerson.html#charm-person',
    DEBUG: true,
    
    onCast: function(caster, class_name, target) { return this.onFinishCast(caster, class_name, target); },
    
    onFinishCast: function(caster, class_name, target) { // caster is a reference to a D20_Character object corresponding to a Roll20 character
    // class_name is a string, hopefully indicating a class posessed by the caster; target is a D20_Character reference tied to a Roll20 Character object
    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onFinishCast() { name='" + this.name + "'}"); }
    if (!target) { log("Error in spellData.CharmPerson: 'target' is " + target + ". Returning 'false'..."); return false; }
    
    var new_SpellEffect = this.create_SpellEffect(caster, class_name, target);
    if (!new_SpellEffect) { log("--- YOU GOT PROBLEMS: create_SpellEffect() method does not work & returned undefined. Exiting. "); return undefined;  }
    var HTML_Output = new_SpellEffect.create_HTMLDisplay();

    var save_result = target.roll_will(new_SpellEffect.save_DC); // returns a custom object with properties { value, modifier, raw, DC, success, n20, n1, tool_tip }
	if (this.DEBUG) { log("   Will saving throw = " + save_result.tool_tip + " Save DC = " + save_result.DC + "."); }
    // The <span> for the Saving Throw Roll includes the roll itself as well as the tooltip.        
	var savingThrowText = "vs. <b>" + target.name + "</b>: " + formatInlineRollAsHTML(save_result.value, save_result.tool_tip, save_result.n20, save_result.n1 ); 
	if (save_result.success) { savingThrowText += " <b>Success</b><br>...the spell has no effect."; }
	else { // did not succeed at the Saving Throw
		savingThrowText += " <b>Failure</b>.<br>" + target.name + " is now <i>Charmed</i>.";
		target.attitude = 'friendly';
		if (target.r20_token) { target.r20_token.set( "status_chained-heart", true ); }
        }; // end of (!save_result.success)

	HTML_Output += appendHTMLRow(HTML_Output, savingThrowText);

//  --- NOT IMPLEMENTED YET --- append a reference to this SpellEffect to the spell_effects[] array of all of the targets IF they have been computed into D20_Character objects and IF you have arranged to keep this object after the script has finished executing

    outputHTMLDisplay(HTML_Output);
    return new_SpellEffect; 

    } // end of onFinishCast()
} ); // end of spellData.CharmPerson

spellData.add_Spell( {
    name: 'Color Spray',
    school: 'illusion (pattern)',
    descriptors: ['Mind-Affecting'],
    caster_list: [ ['sorcerer',1], ['wizard',1] ], // [ ['class', level], ['class', level] ]
    cast_time: '1 standard action',
    components: { v: true, s: true, m: false, f: false, df: false } ,
    range: 0, // A string. In a spell declaration, will usually be a formula, i.e., 'Close', 'Medium', 'Long', etc.
    area: 15, // Integer. Feet
    area_shape: 'cone', // for an area-effect spell
    duration: 'see text',  
    saving_throw: 'Will',
    spell_resistance: 'yes',
    description_text: "A vivid cone of clashing colors springs forth from your hand, causing creatures to become stunned, perhaps also blinded, and possibly knocking them unconscious. Each creature within the cone is affected according to HD. 2 HD or less: The creature is unconscious, blinded, and stunned for 2d4 rounds, then blinded and stunned for 1d4 rounds, and then stunned for 1 round. (Only living creatures are knocked unconscious.) 3 or 4 HD: The creature is blinded and stunned for 1d4 rounds, then stunned for 1 round. 5 or more HD: The creature is stunned for 1 round. Sightless creatures are not affected by color spray.", // text
    link: 'http://paizo.com/pathfinderRPG/prd/spells/colorSpray.html#color-spray',
    DEBUG: true,
    
    onCast: function(caster, class_name) {
    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onCast() { name='" + this.name + "', caster='" + caster.name + "', class_name='" + class_name + "' }"); }

// <-------------------------------------->
        
    var new_SpellEffect = createObj("graphic", { name: caster.name + "'s " + this.name + " spell effect",
        _subtype: "token", pageid: caster.page_ID, layer: "objects",
        imgsrc: "https://s3.amazonaws.com/files.d20.io/images/4356712/qTiTZt4YOt1Q8_ek-Ob3bA/thumb.png?1402526981", // Rainbow Color Spray graphic
        left: caster.xPos, top: caster.yPos, width: (this.area * 18), height: (this.area * 33.5), rotation: 0, isdrawing: true,
        controlledby: caster.r20_char.get("controlledby"), 
        showname: false, showplayers_name: true, playersedit_name: false,  playersedit_bar1: false,  playersedit_bar2: false,  playersedit_bar3: false,  playersedit_aura1: false,  playersedit_aura2: false,
        gmnotes: JSON.stringify( {type: 'spell', name_id: this.name.toPropertyName(), caster_id: caster.id, class_name: class_name, reposition: false, rotate: true } ) // store the Roll20 character ID of the caster in the gmnotes field.
        } );   // end of createObj() function
    toFront(new_SpellEffect);
    sendChat("", "/desc (("+ caster.name + ", please position your " + this.name + " spell effect, then click the 'Finish' button.))");

// <-------------------------------------->

    return new_SpellEffect; // a reference to a Roll20 Token representing a spell effect, not tied to the characterData Lazy Initialization hash table (yet)
    }, // end of onCast()
 
    onFinishCast: function(caster, class_name, location) { // caster is a reference to a D20_Character object corresponding to a Roll20 character
    // class_name is a string, hopefully indicating a class posessed by the caster
    // location is a D20_Character reference to a Roll20 Token which inherits directly from D20_Character, not from a Roll20 Character object
       
    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onFinishCast() { name='" + this.name + "'}"); }

// !!! Need to write code to check that the Spell Effect locator is not outside the spell's effective range, based on caster level

// Select all of the character-Tokens on the same page within a 10 foot radius area of the spell effect marker.
// Filter out types not affected, then sort by Hit Dice. Spell affects least powerful creatures first, up to 4 Hit Dice.

    var target_array = getTokensWithinArea( location.page_ID, location.xPos, location.yPos, (this.area / feetPerUnit), location.rotation, 60 ); // returns D20_Character references now
    if (!target_array[0]) {
            log("---warning: getTokensWithinArea() returned no matches. Exiting...");
            return false; }
            
    if (this.DEBUG) { log( target_array ); }
            
    if (this.DEBUG) { log(" Filtering target_array, removing caster and all Constructs."); }

    target_array = _.reject(target_array, function(target) { return ((target.type === "Construct") || (target === caster)) });
    if (this.DEBUG) { log(target_array); }
 
    var new_SpellEffect = this.create_SpellEffect(caster, class_name); // The absense of the third argument will set new_SpellEffect.targets = [ ]. Must be set later.
    if (!new_SpellEffect) { log("--- YOU GOT PROBLEMS: create_SpellEffect() method does not work & returned undefined. Exiting. "); return undefined;  }
    var HTML_Output = new_SpellEffect.create_HTMLDisplay();

// _.each(targets) { using appendHTMLRow( HTML_Output , rowContent ); }

    if (this.DEBUG) { log(" Affecting spell recipients..."); }

    _.each(target_array, function(target) {
        var save_result = target.roll_will(new_SpellEffect.save_DC); // returns a custom object with properties { value, modifier, raw, DC, success, n20, n1, tool_tip }
        if (this.DEBUG) { log("   Will saving throw = " + save_result.tool_tip + " Save DC = " + save_result.DC + "."); }
    // The <span> for the Saving Throw Roll includes the roll itself as well as the tooltip.        
        var savingThrowText = "vs. <b>" + target.name + "</b>: " + formatInlineRollAsHTML(save_result.value, save_result.tool_tip, save_result.n20, save_result.n1 ); 
        if (save_result.success) { savingThrowText += " <b>Success</b><br>...the spell has no effect."; }
        else { // did not succeed at the Saving Throw
            new_SpellEffect.targets.push(target);
            savingThrowText += " <b>Failure</b>. " + target.name + " is now<br>";
            
            var unconscious_rounds = (target.type === "Undead") ? 0 : (randomInteger(4) + randomInteger(4));
            var blinded_rounds = randomInteger(4);
            var stunned_rounds = 1;
            if (target.character_level > 2) { unconscious_rounds = 0; }
            if (target.character_level > 5) { blinded_rounds = 0; }
            blinded_rounds += unconscious_rounds;
            stunned_rounds += blinded_rounds;
            
            if (unconscious_rounds) { savingThrowText += "<i>Unconscious</i> for " + unconscious_rounds + " rounds,<br>"; }
            if (blinded_rounds) { savingThrowText += "<i>Blinded</i> for " + blinded_rounds + " rounds, and<br>"; }
            if (stunned_rounds) { savingThrowText += "<i>Stunned</i> for " + stunned_rounds + " rounds."; }
                
            if (target.r20_token) {
                if (unconscious_rounds) { target.r20_token.set( "status_pummeled", unconscious_rounds.toString() ); }
                if (blinded_rounds) { target.r20_token.set( "status_bleeding-eye", blinded_rounds.toString() ); }
                if (stunned_rounds) { target.r20_token.set( "status_half-haze", stunned_rounds.toString() ); }
                }; // end if (target.r20_token)
                
            }; // end of (!save_result.success)

        HTML_Output += appendHTMLRow(HTML_Output, savingThrowText);
    }); // end _.each(target_array)

//  --- NOT IMPLEMENTED YET --- append a reference to this SpellEffect to the spell_effects[] array of all of the targets IF they have been computed into D20_Character objects and IF you have arranged to keep this object after the script has finished executing

    outputHTMLDisplay(HTML_Output);
    return new_SpellEffect; 

    } // end of onFinishCast()
   
} ); // end of spellData.ColorSpray

spellData.add_Spell( {
    name: 'Entangle',
    school: 'transmutation',
    descriptors: [ ],
    caster_list: [ ['druid',1] , ['ranger',1] ], // [ ['class', level], ['class', level] ]
    cast_time: '1 standard action',
    components: { v: true, s: true, m: false, f: false, df: true } ,
    range: 'Long', // (400 ft. + 40 ft./level)
    area: 40,       // 40 foot spread centered on the spell locator
    area_shape: 'spread', 
    duration: '1 minute / level (D)',  
    saving_throw: 'Reflex',
    spell_resistance: 'no',
    description_text: 'This spell causes tall grass, weeds, and other plants to wrap around creatures in the area of effect or those that enter the area. Creatures that fail their save gain the entangled condition. Creatures that make their save can move as normal, but those that remain in the area must save again at the end of your turn. Creatures that move into the area must save immediately. Those that fail must end their movement and gain the entangled condition. Entangled creatures can attempt to break free as a move action, making a Strength or Escape Artist check. The DC for this check is equal to the DC of the spell. The entire area of effect is considered difficult terrain while the effect lasts. If the plants in the area are covered in thorns, those in the area take 1 point of damage each time they fail a save against the entangle or fail a check made to break free. Other effects, depending on the local plants, might be possible at GM discretion.', // text
    link: 'http://paizo.com/pathfinderRPG/prd/spells/entangle.html#entangle',
    DEBUG: true,
    
    onCast: function(caster, class_name) {

    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onCast() { name='" + this.name + "', caster='" + caster.name + "', class_name='" + class_name + "' }"); }

// <-------------------------------------->
        
    var new_SpellEffect = createObj("graphic", { name: caster.name + "'s " + this.name + " spell effect",
        _subtype: "token", pageid: caster.page_ID, layer: "objects",
        imgsrc: "https://s3.amazonaws.com/files.d20.io/images/4167432/QN_dRsOM0idvf5zuTNFZ1Q/thumb.png?1401104007", // this is the link to the generic 'Spell Effect' black targeting marker I provided, some spells (like 'Color Spray') will change this value
        left: caster.xPos + 70, top: caster.yPos, width: 76, height: 87, rotation: 0, isdrawing: true,
        controlledby: caster.r20_char.get("controlledby"), aura1_radius: this.area, aura1_color: "#336600",
        showname: true, showplayers_name: true, playersedit_name: false,  playersedit_bar1: false,  playersedit_bar2: false,  playersedit_bar3: false,  playersedit_aura1: false,  playersedit_aura2: false,
        gmnotes: JSON.stringify( {type: 'spell', name_id: this.name.toPropertyName(), caster_id: caster.id, class_name: class_name, reposition: true, rotate: false } ) // store the Roll20 character ID of the caster in the gmnotes field.
        } );   // end of createObj() function
    toFront(new_SpellEffect);
    sendChat("", "/desc (("+ caster.name + ", please position your " + this.name + " spell effect, then click the 'Finish' button.))");

// <-------------------------------------->

    return new_SpellEffect; // a reference to a Roll20 Token representing a spell effect, not tied to the characterData Lazy Initialization hash table (yet)
    }, // end of onCast()
 
    onFinishCast: function(caster, class_name, location) { // caster is a reference to a D20_Character object corresponding to a Roll20 character
    // class_name is a string, hopefully indicating a class posessed by the caster
    // location is a D20_Character reference to a Roll20 Token which inherits directly from D20_Character, not from a Roll20 Character object
       
    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onFinishCast() { name='" + this.name + "'}"); }

// !!! Need to write code to check that the Spell Effect locator is not outside the spell's effective range, based on caster level

// Select all of the character-Tokens on the same page within a 10 foot radius area of the spell effect marker.
// Filter out types not affected, then sort by Hit Dice. Spell affects least powerful creatures first, up to 4 Hit Dice.

    var target_array = getTokensWithinArea( location.page_ID, location.xPos, location.yPos, (this.area / feetPerUnit) ); // returns D20_Character references now
    if (!target_array[0]) {
            log("---warning: getTokensWithinArea() returned no matches. Exiting...");
            return false; }
            
    if (this.DEBUG) { log(" Filtering target_array to reject Flying creatures."); }
    target_array = _.reject(target_array, function(target) { return target.status_markers.hasOwnProperty('fluffy-wing'); });
    if (this.DEBUG) { log(target_array); }
 
    var new_SpellEffect = this.create_SpellEffect(caster, class_name); // The absense of the third argument will set new_SpellEffect.targets = [ ]. Must be set later.
    if (!new_SpellEffect) { log("--- YOU GOT PROBLEMS: create_SpellEffect() method does not work & returned undefined. Exiting. "); return undefined;  }
    var HTML_Output = new_SpellEffect.create_HTMLDisplay();

// _.each(targets) { using appendHTMLRow( HTML_Output , rowContent ); }

    if (this.DEBUG) { log(" Affecting spell recipients..."); }

    _.each(target_array, function(target) {
        var save_result = target.roll_reflex(new_SpellEffect.save_DC); // returns a custom object with properties { value, modifier, raw, DC, success, n20, n1, tool_tip }
        if (this.DEBUG) { log("   Reflex saving throw = " + save_result.tool_tip + " Save DC = " + save_result.DC + "."); }
    // The <span> for the Saving Throw Roll includes the roll itself as well as the tooltip.        
        var savingThrowText = "vs. <b>" + target.name + "</b>: " + formatInlineRollAsHTML(save_result.value, save_result.tool_tip, save_result.n20, save_result.n1 ); 
        if (save_result.success) { savingThrowText += " <b>Success</b><br>...the spell has no effect."; }
        else { // did not succeed at the Saving Throw
            new_SpellEffect.targets.push(target);
            savingThrowText += " <b>Failure</b>. " + target.name + " is now <i>Entangled</i>.<br>";
            if (target.r20_token) { target.r20_token.set("status_cobweb", new_SpellEffect.caster_level * 10); }
            }; // end of failed saving throw
        
        HTML_Output += appendHTMLRow(HTML_Output, savingThrowText);
    }); // end _.each(target_array)

//  --- NOT IMPLEMENTED YET --- append a reference to this SpellEffect to the spell_effects[] array of all of the targets IF they have been computed into D20_Character objects and IF you have arranged to keep this object after the script has finished executing

    outputHTMLDisplay(HTML_Output);
    return new_SpellEffect; 

    } // end of onFinishCast()
   
 } ); // end of spellData.Entangle

spellData.add_Spell( {
	name: 'Hold Person',
    school: 'enchantment (compulsion)',
    descriptors: ['Mind-Affecting'],
    caster_list: [ ['bard',2], ['priest',2], ['sorcerer',3], ['wizard',3] ], // [ ['class', level], ['class', level] ]
    cast_time: '1 standard action',
    components: { v: true, s: true, m: false, f: true, df: true } ,
    range: 'Medium', // A string. In a spell declaration, will usually be a formula, i.e., 'Close', 'Medium', 'Long', etc.
    duration: '1 round / level',  
    saving_throw: 'Will',
    spell_resistance: 'yes',
    description_text: "The subject becomes paralyzed and freezes in place. It is aware and breathes normally but cannot take any actions, even speech. Each round on its turn, the subject may attempt a new saving throw to end the effect. This is a full-round action that does not provoke attacks of opportunity. A winged creature who is paralyzed cannot flap its wings and falls. A swimmer can't swim and may drown.", // text
    link: 'http://paizo.com/pathfinderRPG/prd/spells/holdPerson.html#hold-person',
    DEBUG: true,
    
    onCast: function(caster, class_name, target) { return this.onFinishCast(caster, class_name, target); },
    
    onFinishCast: function(caster, class_name, target) { // caster is a reference to a D20_Character object corresponding to a Roll20 character
    // class_name is a string, hopefully indicating a class posessed by the caster; target is a D20_Character reference tied to a Roll20 Character object
    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onFinishCast() { name='" + this.name + "'}"); }
    if (!target) { log("Error in spellData.HoldPerson: 'target' is " + target + ". Returning 'false'..."); return false; }
    
    var new_SpellEffect = this.create_SpellEffect(caster, class_name, target);
    if (!new_SpellEffect) { log("--- YOU GOT PROBLEMS: create_SpellEffect() method does not work & returned undefined. Exiting. "); return undefined;  }
    var HTML_Output = new_SpellEffect.create_HTMLDisplay();

    var save_result = target.roll_will(new_SpellEffect.save_DC); // returns a custom object with properties { value, modifier, raw, DC, success, n20, n1, tool_tip }
	if (this.DEBUG) { log("   Will saving throw = " + save_result.tool_tip + " Save DC = " + save_result.DC + "."); }
    // The <span> for the Saving Throw Roll includes the roll itself as well as the tooltip.        
	var savingThrowText = "vs. <b>" + target.name + "</b>: " + formatInlineRollAsHTML(save_result.value, save_result.tool_tip, save_result.n20, save_result.n1 ); 
	if (save_result.success) { savingThrowText += " <b>Success</b><br>...the spell has no effect."; }
	else { // did not succeed at the Saving Throw
		savingThrowText += " <b>Failure</b>.<br>" + target.name + " is now <i>Held</i>.";
		if (target.r20_token) { target.r20_token.set( "status_frozen-orb", new_SpellEffect.caster_level);
			target.r20_token.set( 'tint_color', "#FFFFFF" ); }
        }; // end of (!save_result.success)

	HTML_Output += appendHTMLRow(HTML_Output, savingThrowText);

//  --- NOT IMPLEMENTED YET --- append a reference to this SpellEffect to the spell_effects[] array of all of the targets IF they have been computed into D20_Character objects and IF you have arranged to keep this object after the script has finished executing

    outputHTMLDisplay(HTML_Output);
    return new_SpellEffect; 

    } // end of onFinishCast()
} ); // end of spellData.HoldPerson

spellData.add_Spell( {
    name: "Hunter's Mercy",
    school: 'transmutation',
    descriptors: [],
    caster_list: [ ['ranger',1] ], // [ ['class', level], ['class', level] ]
    cast_time: '1 standard action',
    components: { v: true, s: true, m: false, f: false, df: false } ,
    range: 'caster', // the caster
    duration: '1 round',  
    description_text: 'This transmutation makes a bow strike true. Your next attack with the bow (if it is made before the end of the next round) hits and automatically threatens a critical hit. If you don’t hit in the round following the casting of this spell, the effect is wasted.', // text
    link: '',
    DEBUG: true,
    
    onCast: function(caster, class_name) { return this.onFinishCast(caster, class_name); }, // spell is cast and finished in the same moment
   
    onFinishCast: function(caster, class_name) {
    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onFinishCast()"); }

    var new_SpellEffect = this.create_SpellEffect(caster, class_name, caster); // targets are now D20_Character references
    if (!new_SpellEffect) { log("--- YOU GOT PROBLEMS: create_SpellEffect() method does not work & returned undefined. Exiting. "); return undefined;  }
        
    var HTML_Output = new_SpellEffect.create_HTMLDisplay();
    HTML_Output += appendHTMLRow(HTML_Output, "Your ranged attack (if made in the next round) will automatically <b>Hit</b> and threaten a <b>Critical Hit</b>!");

    caster.status_markers['archery-target'] = -1;
    if (caster.r20_token) { caster.r20_token.set( "status_archery-target", true ); }

    outputHTMLDisplay(HTML_Output);
    return new_SpellEffect; 
    } // end of onFinishCast()
   
 } ); // end of spellData.HuntersMercy

spellData.add_Spell( {
    name: 'Sleep',
    school: 'enchantment (compulsion)',
    descriptors: ['Mind-Affecting'],
    caster_list: [ ['bard',1] , ['sorcerer',1], ['wizard',1] ], // [ ['class', level], ['class', level] ]
    cast_time: '1 standard action',
    components: { v: true, s: true, m: false, f: false, df: true } ,
    range: 'Medium', // A string. In a spell declaration, will usually be a formula, i.e., 'Close', 'Medium', 'Long', etc.
    area: 10, // Integer. Feet
    area_shape: 'burst', // for an area-effect spell
    duration: '1 minute / level',  
    saving_throw: 'Will',
    spell_resistance: 'yes',
    description_text: "A sleep spell causes a magical slumber to come upon 4 HD of creatures. Creatures with the fewest HD are affected first. Among creatures with equal HD, those who are closest to the spell's point of origin are affected first. HD that are not sufficient to affect a creature are wasted. Sleeping creatures are helpless. Slapping or wounding awakens an affected creature, but normal noise does not. Awakening a creature is a standard action (an application of the aid another action). Sleep does not target unconscious creatures, constructs, or undead creatures.", // text
    link: 'http://paizo.com/pathfinderRPG/prd/spells/sleep.html#sleep',
    DEBUG: true,
    
    onCast: function(caster, class_name) {

    if (this.DEBUG) { log("Called from within spellData." + + this.name.toPropertyName() + ".onCast() { name='" + this.name + "', caster='" + caster.name + "', class_name='" + class_name + "' }"); }

// <-------------------------------------->
        
    var new_SpellEffect = createObj("graphic", { name: caster.name + "'s " + this.name + " spell effect",
        _subtype: "token", pageid: caster.page_ID, layer: "objects",
        imgsrc: "https://s3.amazonaws.com/files.d20.io/images/4167432/QN_dRsOM0idvf5zuTNFZ1Q/thumb.png?1401104007", // this is the link to the generic 'Spell Effect' black targeting marker I provided, some spells (like 'Color Spray') will change this value
        left: caster.xPos + 70, top: caster.yPos, width: 76, height: 87, rotation: 0, isdrawing: true,
        controlledby: caster.r20_char.get("controlledby"), aura1_radius: this.area, aura1_color: "#9999FF",
        showname: true, showplayers_name: true, playersedit_name: false,  playersedit_bar1: false,  playersedit_bar2: false,  playersedit_bar3: false,  playersedit_aura1: false,  playersedit_aura2: false,
        gmnotes: JSON.stringify( {type: 'spell', name_id: this.name.toPropertyName(), caster_id: caster.id, class_name: class_name, reposition: true, rotate: false } ) // store the Roll20 character ID of the caster in the gmnotes field.
        } );   // end of createObj() function
    toFront(new_SpellEffect);
    sendChat("", "/desc (("+ caster.name + ", please position your " + this.name + " spell effect, then click the 'Finish' button.))");

// <-------------------------------------->

    return new_SpellEffect; // a reference to a Roll20 Token representing a spell effect, not tied to the characterData Lazy Initialization hash table (yet)
    }, // end of onCast()
 
    onFinishCast: function(caster, class_name, location) { // caster is a reference to a D20_Character object corresponding to a Roll20 character
    // class_name is a string, hopefully indicating a class posessed by the caster
    // location is a D20_Character reference to a Roll20 Token which inherits directly from D20_Character, not from a Roll20 Character object
       
    if (this.DEBUG) { log("Called from within spellData." + this.name.toPropertyName() + ".onFinishCast() { name='" + this.name + "'}"); }

// !!! Need to write code to check that the Spell Effect locator is not outside the spell's effective range, based on caster level

// Select all of the character-Tokens on the same page within a 10 foot radius area of the spell effect marker.
// Filter out types not affected, then sort by Hit Dice. Spell affects least powerful creatures first, up to 4 Hit Dice.

    var target_array = getTokensWithinArea( location.page_ID, location.xPos, location.yPos, (this.area / feetPerUnit) ); // returns D20_Character references now
    if (!target_array[0]) {
            log("---warning: getTokensWithinArea() returned no matches. Exiting...");
            return false; }
            
    if (this.DEBUG) { log( target_array ); }
            
    if (this.DEBUG) { log(" Filtering target_array based on Type and Race attributes."); }

    target_array = _.reject(target_array, function(target) { return ((target.race.substring(0,3) === "Elf") || (target.type === "Construct") || (target.type === "Undead")) });
    target_array = _.sortBy(target_array, function(target) { return (target.character_level + distanceBetweenPoints( location.xPos, location.yPos, target.xPos, target.yPos ) / 10000); }); // sort by Level / Hit Dice and then by distance
    if (this.DEBUG) { log(target_array); }
 
    var HitDiceAffected = 4;
    
    if (HitDiceAffected < target_array[0].character_level) {
        sendChat("", "/desc (( This spell will not affect any of the targets in the area, because the spell affects only 4 Hit Dice worth of creatures. ))");    
        return false; }; // returning FALSE indicates that the spell was not successfully cast

    var new_SpellEffect = this.create_SpellEffect(caster, class_name); // The absense of the third argument will set new_SpellEffect.targets = [ ]. Must be set later.
    if (!new_SpellEffect) { log("--- YOU GOT PROBLEMS: create_SpellEffect() method does not work & returned undefined. Exiting. "); return undefined;  }
    var HTML_Output = new_SpellEffect.create_HTMLDisplay();

// _.each(targets) { using appendHTMLRow( HTML_Output , rowContent ); }

    if (this.DEBUG) { log(" Affecting spell recipients..."); }

    _.each(target_array, function(target) {
        if (HitDiceAffected < target.character_level) { return; } // break out of the _.each iteration
        else { HitDiceAffected -= target.character_level; }; // decrement the remaining HitDiceAffected
        var save_result = target.roll_will(new_SpellEffect.save_DC); // returns a custom object with properties { value, modifier, raw, DC, success, n20, n1, tool_tip }
        if (this.DEBUG) { log("   Will saving throw = " + save_result.tool_tip + " Save DC = " + save_result.DC + "."); }
    // The <span> for the Saving Throw Roll includes the roll itself as well as the tooltip.        
        var savingThrowText = "vs. <b>" + target.name + "</b>: " + formatInlineRollAsHTML(save_result.value, save_result.tool_tip, save_result.n20, save_result.n1 ); 
        if (save_result.success) { savingThrowText += " <b>Success</b><br>...the spell has no effect."; }
        else { // did not succeed at the Saving Throw
            new_SpellEffect.targets.push(target);
            savingThrowText += " <b>Failure</b>. " + target.name + " is now <i>Asleep</i>.<br>";
            if (target.r20_token) { target.r20_token.set("status_sleepy", new_SpellEffect.caster_level * 10); }
            }; // end of failed saving throw
        
        HTML_Output += appendHTMLRow(HTML_Output, savingThrowText);
    }); // end _.each(target_array)

//  --- NOT IMPLEMENTED YET --- append a reference to this SpellEffect to the spell_effects[] array of all of the targets IF they have been computed into D20_Character objects and IF you have arranged to keep this object after the script has finished executing

    outputHTMLDisplay(HTML_Output);
    return new_SpellEffect; 

    } // end of onFinishCast()
   
} ); // end of spellData.Sleep

// <-------------------------------------------------------->>


