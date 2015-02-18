D20_Character.calculate_AC = function (attacker, weapon) { // attacker is reference to the D20_Character doing the attacking,
//  weapon could be D20_Weapon but it might also be D20_Spell.
    var DEBUG = true;
    var defender = this; // necessary for "helper" functions
    var ac_modifiers = [ ];
	var dex_mod = Math.floor(this.abilities.dexterity / 2) - 5;
	var total_ac = 10;
	var tool_tip = "10 (Base Armor class)<br>"; // the "tooltip text" sent as the expression parameter of the formatInlineRollAsHTML() display subroutine

	if (DEBUG) { log("*** Called from within calculate_AC method of " + this.name + "'s D20_Character object. Attacker = " + attacker.name + ". Weapon = " + weapon.name + "."); }
	
// So, this is going to work *slightly* differently than the attack one; we are going to add up the bonuses that are listed in the AC section of the character sheet:
// Armor, Shield, Dex (if not flat-footed), Size, Dodge (if not flat-footed), Natural, Enhancement, Deflection, Sacred, Luck, Miscellaneous		
// THEN we will factor status markers, spell effects, and attack forms into it.
// Don't forget, bonuses of the same type (except dodge) do NOT stack! We need to code for that!

	if (weapon.touch) { tool_tip += "(This is a TOUCH attack)<br>"; }
	else {
		if (this.armor_class.armor) { ac_modifiers.push( { value: this.armor_class.armor, type: 'armor', text: 'armor' } ); }
		if (this.armor_class.shield) { ac_modifiers.push( { value: this.armor_class.shield, type: 'shield', text: 'shield' } ); }
		} // end of !weapon.touch
	
	if ( this.status_markers.interdiction ) {  tool_tip += "(This defender is FLAT-FOOTED)<br>"; }
	if ( (dex_mod < 0) || ( (dex_mod > 0) && ( !this.status_markers.interdiction ) ) ) {
		if (dex_mod > this.armor_class.max_dex) { ac_modifiers.push( { value: this.armor_class.max_dex, type: 'ability', text: 'max Dex from armor worn' } ); }
		else { ac_modifiers.push( { value: dex_mod, type: 'ability', text: 'Dexterity' } ); }
		} // end of Dexterity modifier
	
	if ( sizeModifier(this.size) ) { 
		ac_modifiers.push( { value: sizeModifier(this.size), type: 'size', text: this.size } ); }

	if ( (this.armor_class.dodge) && ( !this.status_markers.interdiction ) ) {
		ac_modifiers.push( { value: this.armor_class.dodge, type: 'dodge', text: 'dodge' } ); }
		
	if ( this.armor_class.natural ) { ac_modifiers.push( { value: this.armor_class.natural, type: 'natural', text: '' } ); }
	if ( this.armor_class.enhancement ) { ac_modifiers.push( { value: this.armor_class.enhancement, type: 'enhancement', text: '' } ); }
	if ( this.armor_class.deflection ) { ac_modifiers.push( { value: this.armor_class.deflection, type: 'deflection', text: '' } ); }
	if ( this.armor_class.sacred ) { ac_modifiers.push( { value: this.armor_class.sacred, type: 'sacred', text: '' } ); }
	if ( this.armor_class.luck ) { ac_modifiers.push( { value: this.armor_class.luck, type: 'luck', text: '' } ); }
	if ( this.armor_class.miscellaneous ) { ac_modifiers.push( { value: this.armor_class.miscellaneous, type: '', text: 'miscellaneous' } ); }

// FEATS?
// SPECIAL ABILITIES?

//  Code all STATUS MARKER dependent code which affect a HERE
    if (DEBUG) { log("Checking this.status_markers, value is: "); log(this.status_markers); log(""); }
    _.each( this.status_markers, function (value, key, list) {
        switch (key.toUpperCase()) {
        case "STRONG": // Rage effect
            break;
        case "FISHING-NET": // Entangled
        case "COBWEB":
            break;
        case "BLEEDING-EYE": // Blinded
            break;
        case "BOLT-SHIELD": // Shield of Faith
            break;
        default:
        }  // end switch (name of STATUS MARKER)  
    } ); // end of _.each(this.status_markers)
    
// Need to look up the Roll20 Token's TINT to do the Protection from Evil/Good/Law/Chaos spells!

//  Code all ATTACK FORMS that are NOT Feat- dependent HERE. (If the attack mode IS Feat-dependent, it should be resolved above, under Feats, and then REMOVED from the type_character.attack_modes Object's list of properties (using delete operator)
    if (DEBUG) { log("Checking this.attack_forms, value is: "); log(this.attack_forms); log(""); }
    _.each( this.attack_forms, function (value, key, list) {
        switch (key.toLowerCase()) { // they should already all be lower case, but, this makes certain...
        case "full_attack": 
            break;
        case "two_weapon": 
            break;
        case "charge":  // available to any character, there is no Feat that "improves" this
            ac_modifiers.push( { value: value.ac_modifier, type: '', text: value.name } );
            break;
        case "fight_defensively": // May be improved by "Combat Expertise" Feat - this really only changes the name
            ac_modifiers.push( { value: value.ac_modifier, type: '', text: defender.find_feat("Combat Expertise") ? "Combat Expertise" : value.name } );
            break;
        case "power_attack": 
            break;
        case "deadly_aim": 
            break;
        case "total_defense":  // available to any character, there is no Feat that "improves" this
            ac_modifiers.push( { value: value.ac_modifier, type: '', text: value.name } );
            break;
        default:
        }  // end switch (key)  
    } ); // end of _.each(this.attack_forms) list of properties
    
// <--- WORK SECTION --->		
		
	if (DEBUG) { log("   ac_modifiers[] = "); log(ac_modifiers); }

	_.each( ac_modifiers, function (element, index, list) {
		total_ac += element.value;
		tool_tip += ((element.value >= 0) ? '+ ' : '- ') + Math.abs(element.value).toString();
		tool_tip += (element.type) ? ' ' + element.type : '';
		tool_tip += (element.text) ? ' (' + element.text + ')' : '';
		tool_tip += (index === ac_modifiers.length - 1) ? '.' : '<br>';
		} ); // end of _.each iteratee function for ac_modifiers Array


	return { value: total_ac,
		modifiers: ac_modifiers,
		miss_chance: this.concealment,
		tool_tip: tool_tip };
}; // end of D20_Character.calculate_AC() method
        
D20_Character.calculate_AttackAndDamageMods = function (target, weapon) {
	var DEBUG = true;
	var attacker = this; 				// necessary to invoke "helper" functions
	
    var total_attack_modifier = 0;
    var attack_modifiers = [ ];			// will be an array of objects with properties: value, type, text.
//	The first attack_modifier, the Base Attack bonus, is determined by the attack() method and prepended to this Array after it is returned.
    var attack_ToolTip = " (1d20)<br>"; // the "tooltip text" sent as the expression parameter of the formatInlineRollAsHTML() display subroutine.
    var miss_chance = randomInteger(100);  // the miss chance due to concealment or other factors that grant a miss-chance. Always rolled, but only used if target.concealment > 0.

    var total_damage_modifier = 0;
    var damage_modifiers = [ ];         // will be an array of objects with properties: value, type, text.
    var damage_ToolTip = "";

    if (DEBUG) { log("Called from within D20_Character.calculate_AttackAndDamageMods. Attacker is " + this.name + " and target is " + target.name + ". Logging attacker: ");
        log(this); }

// now BEGIN building the attack_modifiers and damage_modifiers arrays, starting first with Ability Scores...

    if ( abilityBonus(this.abilities[weapon.ability]) ) {
        attack_modifiers.push( { value: Math.floor(this.abilities[weapon.ability] / 2) - 5, type: 'ability', text: weapon.ability.substr(0,1).toUpperCase() + weapon.ability.substr(1) } ); }
        
    if ( (weapon.apply_STR) && ( abilityBonus(this.abilities.strength) ) ) { // add the Strength modifier. May also apply to 'mighty' ranged weapons.
        if ((weapon.melee) && (weapon.twoH) && (abilityBonus(this.abilities.strength) > 0)) {
        //If this is positive modifier (a bonus not a penalty) then a 2-handed melee weapon adds 1.5 times the Strength modifier
            damage_modifiers.push( { value: Math.floor( abilityBonus(this.abilities.strength) * 1.5 ), type: 'ability', text: "2H: Strength bonus * 1.5" } ); }
        else {
            damage_modifiers.push( { value: abilityBonus(this.abilities.strength), type: 'ability', text: "Strength" } ); }
    } // end of (applySTR)    
        
    if ( sizeModifier(this.size) ) {
        attack_modifiers.push( { value: sizeModifier(this.size), type: 'size', text: this.size } ); }
  
    var rangeToTarget = testDistanceToFoe(this.xPos, this.yPos, target.xPos, target.yPos);
    if (weapon.melee) { // this is a melee weapon
        if (rangeToTarget > weapon.reach + (feetPerUnit / 2) ) {  // a little extra "slack" in case token is not snapped to hex grid
            if (DEBUG) { log("*** Distance to foe (" + rangeToTarget + ") is greater than weapon's reach (" + weapon.reach + "). Breaking out of attack_MeleeStandard."); }
            sendChat("", "/desc (( " + this.name + ", this foe is too far away to strike with this melee weapon. You must be within " + weapon.reach.toString() + " feet.))");
            return false; } // end (rangeToTarget > weapon.reach)
        else if (rangeToTarget <= (weapon.reach / 2) - (feetPerUnit / 2) ) { // a little extra "slack" in case token is not snapped to hex grid
            if (DEBUG) { log("*** Distance to foe (" + rangeToTarget + ") is less than or equal to half of the weapon's reach (" + weapon.reach + "). Breaking out of attack_MeleeStandard."); }
            sendChat("", "/desc (( " + this.name + ", this foe is too close for you to strike with this 'reach' weapon. You must be at least " + Math.round(weapon.reach / 2).toString() + " feet away.))");
            return false; } // end (rangeToTarget <= weapon.reach / 2)
    } else { // not a melee weapon
        if (Math.floor(rangeToTarget / weapon.range)) {
            attack_modifiers.push( { value: Math.floor(rangeToTarget / weapon.range) * -2, type: 'range', text: rangeToTarget.toString() + " feet" } ); }
    } // end !(weapon.melee)

//  Code all FEATS which affect attack or damage rolls HERE
    if (DEBUG) { log("Checking this.feats, value is: "); log(this.feats); log(""); }
    _.each( this.feats, function (element, index, list) {
        switch (element.name.trim().toUpperCase()) {
        case "BLIND-FIGHT":
            if (weapon.melee) {
                temp = randomInteger(100);
                if (DEBUG) { log("BLIND_FIGHT Feat recognized, wielding melee weapon. Rerolling miss_chance: old = " + miss_chance + ". new = " + temp + ". Using greater of the two values."); }
                miss_chance = (temp > miss_chance) ? temp : miss_chance; }
            break;
        case "DEADLY AIM":
            if (attacker.attack_forms.deadly_aim) {
                if (DEBUG) { log("DEADLY AIM Feat recognized, 'deadly_aim' attack form is Enabled. Validating Feat."); }
                attacker.attack_forms.deadly_aim.feat_valid = true; }
            break;
        case "COMBAT EXPERTISE":
            if (attacker.attack_forms.fight_defensively) {
                if (DEBUG) { log("COMBAT EXPERTISE Feat recognized, 'fight_defensively' attack form is Enabled. Validating Feat."); }
// Truthfully, this Feat should apply only to melee combat, and I have done the character sheet thing all wrong. I will fix it later.                
                attacker.attack_forms.fight_defensively.name = "Combat Expertise"; }
            break; 
        case "POINT BLANK SHOT":
            if ( (!weapon.melee) && (rangeToTarget <= 30) ) {
                attack_modifiers.push( { value: 1, type: '', text: "Point-Blank Shot" } ); 
                damage_modifiers.push( { value: 1, type: '', text: "Point-Blank Shot" } ); }
            break;
        case "POWER ATTACK":
            if (attacker.attack_forms.power_attack) {
                if (DEBUG) { log("POWER ATTACK Feat recognized, 'power_attack' attack form is Enabled. Validating Feat."); }
                attacker.attack_forms.power_attack.feat_valid = true; }
            break;   
        case "TWO-WEAPON FIGHTING":
// Attack sequences looked up from character sheet. Two-Weapon fighting is handled in the FULL ATTACK Action section.
            break;
        case "WEAPON FOCUS":
            if (!element.sub) {
                log("Warning in action_Attack Combat subroutine: Weapon Focus feat has no subtype specified for character " + this.name + ". Skipping this Feat..."); }
            else {
                if ( (weapon.name.toLowerCase().indexOf(element.sub.toLowerCase()) > -1) || (weapon.descript.toLowerCase().indexOf(element.sub.toLowerCase()) > -1) ) {
                    attack_modifiers.push( { value: parseInt( element.descript.charAt( element.descript.indexOf('+') + 1 ) ), type: '', text: element.name + ' (' + element.sub + ')' } ); }
            } // end of else (element.sub)
            break;
        default:
        }  // end switch (name of FEAT)  
    } ); // end of _.each(this.feats)
   
//  Code all SPECIAL ABILITIES which affect attack or damage rolls HERE
    if (DEBUG) { log("Checking this.spec_abilities, value is: "); log(this.spec_abilities); log(""); }
    _.each( this.spec_abilities, function (element, index, list) {
        switch (element.name.toUpperCase()) {
        case "FAVORED ENEMY":
            if (!element.sub) {
                log("Warning in action_Attack Combat subroutine: Favored Enemy special ability has no subtype specified for character " + this.name + ". Skipping this Ability..."); }
            else {
                if ( (target.race.toLowerCase().indexOf(element.sub.toLowerCase()) > -1) || (target.type.toLowerCase() === element.sub.toLowerCase()) ) {
                    attack_modifiers.push( { value: parseInt( element.descript.charAt( element.descript.indexOf('+') + 1 ) ), type: '', text: element.name + ' (' + element.sub + ')' } );
                    damage_modifiers.push( { value: parseInt( element.descript.charAt( element.descript.indexOf('+') + 1 ) ), type: '', text: element.name + ' (' + element.sub + ')' } ); }
            } // end of else (element.sub)
            break;
        default:
        }  // end switch (name of SPECIAL ABILITY)  
    } ); // end of _.each(this.spec_abilities)
    
//  Code all STATUS MARKER dependent code which affects attack or damage rolls HERE
//  Status markers are loaded in D20_Character.load_fromRoll20Token() ( eventually this will be D20_Character.spell_effects )
    if (DEBUG) { log("Checking this.status_markers, value is: "); log(this.status_markers); log(""); }
    _.each( this.status_markers, function (value, key, list) {
        switch (key.toUpperCase()) {
        case "BLUE":
            attack_modifiers.push( { value: 1, type: 'morale', text: "Bless" } );
            break;
        case "BROWN":
            attack_modifiers.push( { value: -1, type: 'morale', text: "Bane" } );
            break;
        case "ANGEL-OUTFIT":
            attack_modifiers.push( { value: value, type: 'luck', text: "Divine Favor" } );
            damage_modifiers.push( { value: value, type: 'luck', text: "Divine Favor" } );
            break;
        default:
        }  // end switch (name of STATUS MARKER)  
    } ); // end of _.each(this.status_markers)

//  Code all ATTACK FORMS that are NOT Feat- dependent HERE. (If the attack mode IS Feat-dependent, it should be resolved above, under Feats, and then REMOVED from the type_character.attack_modes Object's list of properties (using delete operator)
    if (DEBUG) { log("Checking this.attack_forms, value is: "); log(this.attack_forms); log(""); }
    _.each( this.attack_forms, function (value, key, list) {
        switch (key.toLowerCase()) { // they should already all be lower case, but, this makes certain...
        case "full_attack": // available to any character, there is no Feat that "improves" this
        	// This has already been handled, at the beginning of this method, where Base Attack Bonus is established
            break;
        case "two_weapon": // If the "Two-Weapon Fighting" Feat is found above, this will have been processed already. Anyone can fight with two weapons, however
            break;
        case "charge":  // available to any character, there is no Feat that "improves" this
            if (weapon.melee) { attack_modifiers.push( { value: value.attack_modifier, type: '', text: value.name } ); }
            break;
        case "fight_defensively": // If the "Expertise" Feat is found above, the name of the attack form will be changed to "Combat Expertise"
// I am aware that the Combat Expertise Feat is meant to only apply to melee combat, and that therefor thi sis mis-coded. I will fix it later.
            attack_modifiers.push( { value: value.attack_modifier, type: '', text: value.name } );
            break;
        case "power_attack": // If the "Power Attack" Feat is found above, the feat_valid property will bet set to true
            if ( (weapon.melee) && (value.feat_valid) ) {
                if (DEBUG) { log("'power_attack' attack form is Enabled, Power Attack Feat validated, wielding melee weapon. Applying modifiers."); }
                attack_modifiers.push( { value: value.attack_modifier, type: '', text: value.name } );
                damage_modifiers.push( { value: value.damage_modifier, type: '', text: value.name } ); }
            break;
        case "deadly_aim": // If the "Deadly Aim" Feat is found above, the feat_valid property will bet set to true
            if ( (!weapon.melee) && (value.feat_valid) ) {
                if (DEBUG) { log("'deadly_aim' attack form is Enabled, Deadly Aim Feat validated, wielding ranged weapon. Applying modifiers."); }
                attack_modifiers.push( { value: value.attack_modifier, type: '', text: value.name } );
                damage_modifiers.push( { value: value.damage_modifier, type: '', text: value.name } ); }
            break;
        case "total_defense":  // available to any character, there is no Feat that "improves" this
//  No attack can be made by a character using the Total Defense action. This should have already been checked, at the beginning of this function.
            break;
        default:
        }  // end switch (key)  
    } ); // end of _.each(this.attack_forms) list of properties
    
// Now go on to determine any modifiers based on the weapon (enhancement, etc.)

    if ( weapon.enhancement_bonus) {
        attack_modifiers.push( { value: weapon.enhancement_bonus, type: 'enhancement', text: 'magical'} );
        damage_modifiers.push( { value: weapon.enhancement_bonus, type: 'enhancement', text: 'magical'} ); }
    else if (weapon.descript.search('masterwork') > -1) {
        attack_modifiers.push( { value: 1, type: 'enhancement', text: 'masterwork'} ); }
    else if (weapon.descript.search('crude') > -1) {
        attack_modifiers.push( { value: -1, type: 'enhancement', text: 'crude'} ); }

    if ( weapon.attack_bonus ) { // should not be using this anymore, now that 'masterwork' is coded
        attack_modifiers.push( { value: weapon.attack_bonus, type: '', text: 'other weapon-specific mods'} ); }
    if (this.temp_attack_bonus) {  // from the bottom of the character sheet
        attack_modifiers.push( { value: this.temp_attack_bonus, type: '', text: 'other attack bonuses'} ); }
    if (this.temp_damage_bonus) {  // from the bottom of the character sheet
        damage_modifiers.push( { value: this.temp_attack_bonus, type: '', text: 'other damage bonuses'} ); }

/*  PROBLEM: right now there is no code that deals with the different TYPES of bonuses, which normally do not stack. We need to
    iterate through the bonuses and find the highest one of a particular type, and apply only that one. Some types of bonuses,
    such as dodge bonuses, DO stack. Penalties do NOT have types and always stack together.   */
        
/*  attack_modifiers = _.groupBy(attack_modifiers, function(m) { return (m.type) ? m.type : 'bonus'; } );
//  this groups together the attack_modifiers based on what type of bonus they are. If type is an empty string, these are
//  simply named "bonus". The _.groupBy function returns an object whose properties are all possible values of "type"

    _.each( attack_modifiers, function (element, index, list) { // names of bonus types
        var max_bonus, 
        }); // end of _.each(attack_modifiers) ---> names of bonus types		*/

//  OK THEN. Now that we have fully constructed the attack_modifiers and damage_modifiers arrays, we will iterate through them once,
//  adding up the total modifier, and building the <span> for the Inline DiceRoll's "ToolTip" text as we go.
    if (DEBUG) { log(" Attack_modifiers[] = "); log(attack_modifiers); }
    _.each( attack_modifiers, function (element, index, list) {
        total_attack_modifier += element.value;
        attack_ToolTip += ((element.value >= 0) ? '+ ' : '- ') + Math.abs(element.value).toString();
        attack_ToolTip += (element.type) ? ' ' + element.type : '';
        attack_ToolTip += (element.text) ? ' (' + element.text + ')' : '';
        attack_ToolTip += (index === attack_modifiers.length - 1) ? '.' : '<br>';
	    } ); // end of _.each iteratee function for attack_modifiers Array
//  Now, just as we did above, we iterate through the damage_modifiers[] Array, adding up the total modifier and building the "ToolTip" text.
	if (DEBUG) { log(" Damage_modifiers[] = "); log(damage_modifiers); }
	_.each( damage_modifiers, function (element, index, list) {
		total_damage_modifier += element.value;
		damage_ToolTip += ((element.value >= 0) ? '+ ' : '- ') + Math.abs(element.value).toString();
		damage_ToolTip += (element.type) ? ' ' + element.type : '';
		damage_ToolTip += (element.text) ? ' (' + element.text + ')' : '';
		damage_ToolTip += (index === damage_modifiers.length - 1) ? '.' : '<br>';
		} ); // end of _.each iteratee function for attack_modifiers Array

    return { attack: {
    			total: total_attack_modifier,	// integer
    			modifiers: attack_modifiers,	// an array of objects with properties: value, type, text.
    			tool_tip: attack_ToolTip,       // the "tooltip text" sent as the 'expression' parameter of formatInlineRollAsHTML()
                miss_chance: miss_chance },     // the chance of a miss due to concealment. Blind-Fight has already been processed.
    		damage: {
    			total: total_damage_modifier,	// integer
    			modifiers: damage_modifiers,    // an array of objects with properties: value, type, text.
    			tool_tip: damage_ToolTip } };	// the "tooltip text" sent as the 'expression' parameter of formatInlineRollAsHTML()
   
}; // end of D20_Character.calculate_AttackAndDamageMods() method

D20_Character.attack = function (target, weapon) {
// This code block handles Melee & Ranged, Standard, Full, and 2Weapon attacks
    var DEBUG = true;
    var attacker = this; // necessary in order to use 'this' with the underscore library helper functions used below

    if (DEBUG) { log("Called from within D20_Character.attack. Attacker is " + this.name + " and target is " + target.name + ". Logging attacker: ");
        log(this); }

// Initialize the HTML Display, beginning with the title block
    var attack_d20 = randomInteger(20);     // This is where the Attack Roll d20 is actually rolled!
    var threat_d20 = randomInteger(20);     // used only if the first attack roll threatens a critical hit
    var damage_roll = 0;                    // declared here, used below IF attack hits
    var base_attack_bonus = [ {value: this.base_attack_bonus, type: '', text: "Base Attack Bonus"} ];
//	This first modifer, the Base Attack, will be overwritten below, in the event of a Full Attack action or Two-Weapon attack.
//  This will be prepended to the attack_modifiers Array after it is returned from D20_Character.calculate_AttackAndDamageMods()
	var AnD_mods;							// the returned result of the calculate_AttackAndDamageMods() method
    var attack_Text = "Attack Roll: "; 		// HTML output, one line sent to appendHTMLRow() display subroutine
    var damage_Text = "Damage Roll: ";

    var temp = 0; var seq = ''; var action_type = "Standard";
    
// Status markers are loaded in D20_Character.load_fromRoll20Token() ( eventually this will be D20_Character.spell_effects )
    if (DEBUG) { log("Attacker status markers: "); log(this.status_markers);
        log("Target status markers: "); log(target.status_markers); }

// make certain the character is actually able to MAKE an attack, with the current attack forms, etc.

    if (this.attack_forms.total_defense) {
        sendChat("", "/desc ((" + this.name + ", you cannot make an attack while using the Total Defense action!))");
        return undefined; }
        
    if ( (this.status_markers['archery-target']) && (!weapon.melee) ) { attack_d20 = 20; }  // Hunter's Mercy
    
//  If making a full attack action, get the next bonus off of the sequence, rather than using the Base Attack Bonus
//  Two-weapon fighting, by definition, is a full attack action... but players might not have the Full Attack option checked
    if ((this.attack_forms.full_attack) || ((this.attack_forms.two_weapon) && (weapon.slot !== 'ranged'))) { // This is a FULL ATTACK action
        action_type = "Full-Round";
        if ((this.attack_forms.two_weapon) && (weapon.slot !== 'ranged')) { 
            seq = this.attack_forms.two_weapon[weapon.slot + '_remaining'];
            temp = sliceNextAttack(seq); // definined in Utilities.js
            this.attack_forms.two_weapon[weapon.slot + '_remaining'] = (temp.seq) ? temp.seq : '';;
            base_attack_bonus.text = "Two-Weapon Fighting, " + weapon.slot; }
        else { // a "normal" (not two-weapon) Full Attack action
            seq = this.attack_forms.full_attack[weapon.slot + '_remaining'];
            temp = sliceNextAttack(seq); // definined in Utilities.js
            this.attack_forms.full_attack[weapon.slot + '_remaining'] = (temp.seq) ? temp.seq : '';;
            base_attack_bonus.text = "Full-round Attack, " + weapon.slot; }  
        if (!seq) { // empty string
            sendChat("", "/desc ((" + this.name + ", you have used all of your attacks for this round.))");
            return undefined; }
        if (temp === null) { // do not use "falsy" values, because zero is a valid attack bonus!
            sendChat("", "/desc ((ERROR - " + weapon.slot + " attack sequence yielded NULL value!))");
            return undefined; }  
        base_attack_bonus.value = temp.value; } // end of FULL ATTACK action

    AnD_mods = this.calculate_AttackAndDamageMods(target, weapon);
//  returns { attack: { total, modifiers, tool_tip, miss_chance }, damage: { total, modifiers, tool_tip } }
	AnD_mods.attack.modifiers.unshift( base_attack_bonus ); // prepend to the front of the attack modifiers array
		
    var target_ac = target.calculate_AC( attacker, weapon ); // returns { value, modifiers, miss_chance, tool_tip } 
    if (DEBUG) { log(target_ac); }
    
    var displayCard = createHTMLDisplay(this.name, (weapon.melee ? "Melee" : "Ranged") + (weapon.touch ? " Touch" : " Attack"), action_type + " Action", 
        "vs. <b>" + target.name + "</b> — AC " +  formatInlineRollAsHTML(target_ac.value, target_ac.tool_tip, true, true, '#D1E0FF') + "<br>" + 
        "using " + this.gender_pronouns[2] + " <i>" + weapon.name + "</i>", this.display_color); // no ToolTip for the title <div>
    
    var fail = (attack_d20 === 1) ? true : false;
    var hit = ( (attack_d20 === 20) || ( (attack_d20 + AnD_mods.attack.total >= target_ac.value) && (!fail) ) ) ? true : false;
    var threat = (hit && (attack_d20 >= weapon.threat_range)) ? true : false;
    var crit = (threat && (threat_d20 + AnD_mods.attack.total >= target_ac.value)) ? true : false;
    
    if ((DEBUG) && (target_ac.miss_chance)) { log(" miss_chance = " + miss_chance + ", target's concealment = " + target_ac.miss_chance); }

    // The <span> for the Attack Roll includes the roll itself as well as the tooltip. 
    if (this.status_markers['archery-target']) {  // Hunter's Mercy
		attack_Text += (weapon.melee) ? formatInlineRollAsHTML(attack_d20 + AnD_mods.attack.total, ( (threat) ? makeMeGreen(attack_d20) : (fail) ? makeMeRed(attack_d20) : attack_d20.toString() ) + AnD_mods.attack.tool_tip, threat, fail) + " " 
			: formatInlineRollAsHTML(attack_d20 + AnD_mods.attack.total, makeMeGreen(attack_d20) + AnD_mods.attack.tool_tip.replace('1d20', makeMeGreen("Hunter's Mercy")), threat, fail) + " ";
		delete this.status_markers['archery-target'];
		if (this.r20_token) { this.r20_token.set( "status_archery-target", false); };
		} 
    else { attack_Text += formatInlineRollAsHTML(attack_d20 + AnD_mods.attack.total, ( (threat) ? makeMeGreen(attack_d20) : (fail) ? makeMeRed(attack_d20) : attack_d20.toString() ) + AnD_mods.attack.tool_tip, threat, fail) + " "; }
    
// Now determine if the attack was successful.
    if (fail) {   // per 3rd edition D&D rules, any roll of a natural 1 is considered a failure. Critical failures may have negative consequences!
        attack_Text += makeMeRed("<b>FUMBLE!</b>"); }
    else if (hit) {
        if ( (target_ac.miss_chance) && (AnD_mods.attack.miss_chance <= target_ac.miss_chance) ) { // if the target has concealment, the miss chance should be resolved before the player sees the attack roll
            attack_Text = formatInlineRollAsHTML(AnD_mods.attack.miss_chance, "Target has " + target_ac.miss_chance + "% concealment.", false, true) + " Miss due to <b>Concealment</b>";
            hit = false; }
        else if (threat) { // check to see if a critical hit has been scored
            attack_Text += "<b>Threat...</b><br>Threat roll: " + formatInlineRollAsHTML(threat_d20 + AnD_mods.attack.total, threat_d20.toString() + AnD_mods.attack.tool_tip, crit, false) + " ";
            if (crit) { attack_Text += makeMeGreen("<b>CRITICAL HIT!</b>"); }
            else { attack_Text += "<b>NORMAL HIT</b>"; }
        } else { // if not a (threat), then this is just a "normal" hit
            attack_Text += "<b>HIT</b>"; }
        } // end if (hit)
    else { attack_Text += "<b>MISS</b>"; }
      
    displayCard += appendHTMLRow(displayCard, attack_Text);
    
    if (hit) {  // Now, if the attack was successful, roll the damage. If a crit has been scored, actually roll it multiple times.
                // weapon.damage.roll must be a string which is a valid diceroll expression, i.e. '1d6' or '2d4+2', possibly followed by a Damage Type string within brackets. 
        for (var i = 1; i <= ( crit ? weapon.crit_multiplier : 1 ); i++) { // iterate this loop once on a normal damage roll, or weapon.crit_multiplier times if a critical hit
                damage_roll += rollDiceAsString(weapon.damage.roll); }

        var total_damage = ((damage_roll + AnD_mods.damage.total) >= 1) ? (damage_roll + AnD_mods.damage.total) : 1; // all successful hits result in minimum 1 point of damage

        damage_Text += formatInlineRollAsHTML( total_damage,
            ( (crit) ? makeMeGreen(damage_roll.toString()) + " (" + weapon.damage.roll + makeMeGreen('x' + weapon.crit_multiplier.toString()) : 
            damage_roll.toString() + " (" + weapon.damage.roll ) + " weapon damage)<br>" + AnD_mods.damage.tool_tip, crit, false); 
            
        if (weapon.damage.type !== '') { damage_Text += " [<i>" + weapon.damage.type + "</i>]"; }
    
// NOTE: SOON TO BE IMPLEMENTED ---> Use of '&' in weapon damage and ammunition fields, will split into an array of weapon damage roll and type properties
        
        displayCard += appendHTMLRow(displayCard, damage_Text);

// NOTE that this function does not (yet) actually apply the damage to the target!

    }; // end if(hit)
    
    outputHTMLDisplay(displayCard);
    return this;
}; // end D20_Character.attack() method
