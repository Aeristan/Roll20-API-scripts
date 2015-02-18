var D20_Item = {
    name: "",           // a string. Does not need to be unique. Exmaple: "Faelar's tears"
    DEBUG: false,        // if set to TRUE, DEBUG information is logged to the console
    descript: "",         // a string. Describes the item in game terms. Example: "+1 precise composite longbow".
    size: "Medium",   	// a string, one of several types. Example: 'Medium' (the default)
    weight: 0,          // a positive integer. The item's weight in pounds.
    gold_value: 0,      // a positive integer. The item's base price in gold pieces.
    use_time: '1 standard action',
    
    onUse: function (user) { return this }, 		// a function to be invoked whenever this item is 'used'.
    onFinishUse: function (user) { return this }   // to be invoked after an Effect marker is selected and the FINISH macro button is clicked
    
	}; // end of D20_Item object declaration

var D20_Weapon = _.extend(Object.beget(D20_Item), {
    slot: '--err--',          // will be 'main', 'off', 'ranged', or 'item'. Always lower-case.
    category: '',             // a string, one of several types. Used for proficiency, weapon focus, specialization, etc. Example: 'longbow'
    damage: {
        roll: '1',            // a diceroll expression, example: '1d6'. By default, a weapon does only 1 point of damage. May contain a damage type code in brackets. Example: '1d6[Fire]'.
        type: '' },           // a string, one of several damage types. Needs to be parsed from the weapon damage Roll20 Attribute   
    attack_bonus: 0,          // an integer value, to be added or subtracted to the attack roll ONLY, such as with masterwork weapons
    enhancement_bonus: 0,     // an integer value. The magical enhancement bonus. Applied to both attack and damage rolls.
    threat_range: 20,         // an integer between 2 and 20. The threat range of the weapon. Used for critical hits.
    crit_multiplier: 2,       // an integer >= 1. On a successful hit, the damage of the weapon is rolled this many times. If = 1, crits are irrelevant.
    ability: '',              // the ability used for attack rolls with this weapon, usually either 'STRENGTH' or 'DEXTERITY'
    range: 0,                 // a positive integer. The range increment for either projectile or thrown weapons. If set to zero, weapon cannot be thrown.
    reach: 5,                 // a positive integer. The "reach" of a melee weapon. This value is not used for ranged weapons.
    melee: true,              // set to false if this is a projectile (not thrown) ranged weapon
    grenade: false,           // set to true if this is a thrown (grenade-like) weapon (typically loaded from the Item section of the Character Sheet)
    touch: false,             // set to true if this is a "touch" attack. Will use "touch" AC rather than total AC
    apply_STR: true,          // a boolean value. Whether or not to apply strength bonus to damage. Always true for melee weapons.
    twoH: false,              // set to true if this weapon requires two hands.
    charges: 1,               // the number of uses remaining. When this becomes 0, the item is consumed, unless it can be recharged
    saving_throw: 'none',	  
    save_DC: 0,
    description_text: "You can throw a flask of alchemist's fire as a splash weapon. Treat this attack as a ranged touch attack with a range increment of 10 feet. A direct hit deals 1d6 points of fire damage. Every creature within 5 feet of the point where the flask hits takes 1 point of fire damage from the splash. On the round following a direct hit, the target takes an additional 1d6 points of damage. If desired, the target can use a full-round action to attempt to extinguish the flames before taking this additional damage. Extinguishing the flames requires a DC 15 Reflex save. Rolling on the ground provides the target a +2 bonus on the save. Leaping into a lake or magically extinguishing the flames automatically smothers the fire.", // text
    link: "http://paizo.com/pathfinderRPG/prd/ultimateEquipment/gear/alchemicalWeapons.html#Alchemist's-Fire",
    
    onAttack: function (user, target) { return this }, // to be invoked every time an attack is attempted
	onMiss: function (user, target) { return this },	// a function to be invoked when the attack is unsuccessful. Useful for grenade-like weapons.    
    onFumble: function (user, target) { return this }, // a function to be invoked when the attack roll is a critical miss (a natural 1)
    onHit: function (user, target) { return this },    // a function to be invoked every time the weapon makes a hit
    onCrit: function (user, target) { return this },   // a function to be invoked every time the weapon scores a CRITICAL hit
    
	load_fromRoll20Character: function(c, slot) { // 'c' is a reference to a Roll20 Character object, slot is either
		var DEBUG = false; var that = this;       // 'Main', 'Off', 'Ranged', or 'Item1'. function returns this.
		var oBrace = 0; var cBrace = 0; var damageString = ''; var n = 0;  // used below to parse Damage Type from inside braces from within Weapon Damage string
	
		if (DEBUG) { log("*** Called from within D20_Weapon.load_fromRoll20Character()."); }
		if (c.get("_type") != "character") {
			log("     Error in D20_Weapon.load_fromRoll20Character. Object ID " + c.id + " is not a Character.");
			return undefined;
		} else if (DEBUG) {
			log("     Object ID " + c.id + " is a valid character named " + c.get("name") + ". slot = " + slot); }
		
		slot = slot.slice(0,1).toUpperCase() + slot.slice(1).toLowerCase();  // Either 'Main', 'Off', 'Ranged', or 'Item1'.
		slot = (slot === 'Item') ? 'Item1' : slot;
		if ((slot != 'Off') && (slot != 'Ranged') && (slot != 'Item1')) { slot = 'Main'; }      // Used for string concatenation.
		
		this.name = getAttrByName(c.id, "Weapon_" + slot + "_name");
		this.slot = slot.toLowerCase(); // Either 'main', 'off', or 'ranged'
	//  this.category will be filled in later; for now, use descriptor for Weapon Focus feats
		this.descript = getAttrByName(c.id, "Weapon_" + slot + "_notes");
		damageString = getAttrByName(c.id, "Weapon_" + slot + "_damage");
		this.attack_bonus = parseInt(getAttrByName(c.id, "Weapon_" + slot + "_hitBonus"));
		this.enhancement_bonus = parseInt(getAttrByName(c.id, "Weapon_" + slot + "_enhance"));
		this.threat_range = parseInt(getAttrByName(c.id, "Weapon_" + slot + "_threat"));
		this.crit_multiplier = parseInt(getAttrByName(c.id, "Weapon_" + slot + "_critMultiplier"));
		this.ability = (slot == 'Ranged') ? 'dexterity' : (getAttrByName(c.id, "Weapon_" + slot + "_ability") == 'DEX') ? 'dexterity' : 'strength';
		this.range = (slot == 'Ranged') ? parseInt(getAttrByName(c.id, "Weapon_" + slot + "_range")) : 0;
		this.melee = (slot == 'Ranged') ? false : true;
		this.touch = ( this.descript.toLowerCase().indexOf('touch') === -1 ) ? false : true;
		this.apply_STR = (slot == 'Ranged') ? (( getAttrByName(c.id, "Weapon_" + slot + "_applySTR") == 'on') ? true : false ) : (this.touch ? false : true);
		this.twoH = (slot == 'Main') ? Boolean(getAttrByName(c.id, "Weapon_" + slot + "_2H")) : false;
		
		// parse the Damage Type from inside the braces from within Weapon Damage string
		oBrace = damageString.indexOf('['); // damage types are always enclosed in braces
		cBrace = damageString.indexOf(']');
		
		if (this.hasOwnProperty('damage') == false) { this.damage = { } }; // inheriting from protoype when it shouldn't be
		if ((oBrace != -1) && (cBrace != -1) && (cBrace > oBrace)) { // check for a valid damageType string
			this.damage.type = damageString.slice(oBrace + 1, cBrace); // get the type from within the braces
					damageString = damageString.slice(0, oBrace); // then, slice damage type off the end, so you don't /roll it
			} else { this.damage.type = ''; };
		this.damage.roll = damageString;
		
		//now parse the string from Weapon 'notes' field
		this.notes = getAttrByName(c.id, "Weapon_" + slot + "_notes");
		if (DEBUG) { log("Parsing weapon notes: "); log(this.notes.split(',')); }
		_.each(this.notes.split(','), function(element, index, list) { // 'notes' field is comma-delimited
			tempE = element.trim().toLowerCase();
			n = 0;
			oBrace = tempE.indexOf('('); // reach values are always enclosed in parenthesis
			cBrace = tempE.indexOf(')');
			if ((oBrace != -1) && (cBrace != -1) && (cBrace > oBrace)) {
				n = parseInt(tempE.slice(oBrace + 1, cBrace)); // the value inside any parenthesis should be an integer
				tempE = tempE.slice(0, oBrace).trim(); }; // then, slice the parenthetical value off the element, storing it in tempE};
	
			switch (tempE) {
			
			case 'reach': {
				that.reach = n;    
			} break; // end case 'reach'
				
			}  // end switch(tempE)
			
			}); // end of _.each(this.notes.split(' ') )
			
		if (DEBUG) {
			log("     Exiting function D20_Weapon.load_fromRoll20Character(). Logging return result:");
			log(this); }
			
		return this;
		}  // end of D20_Weapon.load_fromRoll20Character()
    
    } ); // end of D20_Weapon object extension

var itemData = (function () { 
    var DEBUG = false; // I know this works; I only need to DEBUG the lazy3() method in the Roll20 interface
    var hash_table = {};
/*  One large private "map", the properties of which will be references to objects of D20_Item.
    This "map" will be populated using "Lazy Initialization". The names of the properties will correspond to the unique object IDs.
    D20_Item references will be used through the Campaign, such as with the D20_character.attack() method.
    D20_Weapon objects inherit from D20_Item objects: in this way, prototypal inheritance can be used, without the Algorythm needing
    to know which type of object a specific property corresponds to. */
    
    var _static = {

        get: function(n) {	//  This method retrieves the value of property named. If it does not exist, return undefined.
			if (!n) { if (DEBUG) { log("     Error in itemData.get() method: attempt to read from a 'falsy' ID value. Returning undefined."); }
				return undefined; }
			if (DEBUG) { log("*** Called from within itemData.get( " + n + " ). D20_Item = "); log(hash_table[n]); }
			return hash_table[n]; },
		
		set: function(n, obj) {	//  This method sets the value of a property of the itemData object to the object reference passed in. 
			//  Whether this will be a D20_Item object, or another type that inherits from that (such as D20_Weapon), should not matter.
			if (!n) { if (DEBUG) { log("     Error in itemData.set() method: attempt to write to a 'falsy' ID value. Returning undefined."); }
				return undefined; }
			if (DEBUG) { log("*** Called from within itemData.set( " + n + " ). D20_Item = "); log(obj); }
			hash_table[n] = obj;
			return obj; },
			
		add_Item: function(item, prot) {  // item is a D20_Item or descendant; 'prot' [optional] is the reference to use as the Prototype
            var DEBUG = true;
			prot = prot || D20_Item; 	  // defaults to D20_Item for the prototype
			if (DEBUG) { log("Added item  '" + item.name + "' to itemData." + item.name.toPropertyName() ); }
			// use the toPropertyName() method to strip out: spaces, apostrophes ('), from Item name. Calls the set() method above.
			return this.set( item.name.toPropertyName(), _.extend(Object.beget(prot), item) ); 
			} // end of add_Item()
			
        }; // end of _static
        
    return _static;	// returns the result of invoking this function, an object of type _static, which has public methods with access
})(); 				// to the private member hash_table.

itemData.add_Item( {
	name: "Alchemist's Fire",
	DEBUG: true,			// still working on this, the first, item in itemData
    descript: "masterwork alchemical",  // a string. Describes the item in game terms. Example: "+1 precise composite longbow".
    size: "Diminutive",
    weight: 1,          	
    gold_value: 20,      	
    slot: 'item',          	
    category: 'thrown',    	
    damage: {				// Need to find a way to spread it over two rounds
        roll: '1d6',
        type: 'Fire' },   
    attack_bonus: 0,          
    enhancement_bonus: 0,     
    threat_range: 20,         
    crit_multiplier: 1,     // No crits
    ability: 'dexterity',
    range: 10,
    reach: 0,               // This value is not used for ranged weapons.
    melee: false,
    grenade: true,          // this is a thrown (grenade-like) weapon. See onMiss() method and D20_Character.attack(). 
    touch: true,            // this is a ranged "touch" attack.
    apply_STR: false,
    twoH: false,
    charges: 1,             // single-use item
    saving_throw: 'reflex',	// in the case of Alchemist's Fire, the target may make a save on their next turn to extinguish the flames
    save_DC: 15,
    area: 5,				// the radius of the 'blast', in feet
    description_text: "You can throw a flask of alchemist's fire as a splash weapon. Treat this attack as a ranged touch attack with a range increment of 10 feet. A direct hit deals 1d6 points of fire damage. Every creature within 5 feet of the point where the flask hits takes 1 point of fire damage from the splash. On the round following a direct hit, the target takes an additional 1d6 points of damage. If desired, the target can use a full-round action to attempt to extinguish the flames before taking this additional damage. Extinguishing the flames requires a DC 15 Reflex save. Rolling on the ground provides the target a +2 bonus on the save. Leaping into a lake or magically extinguishing the flames automatically smothers the fire.", // text
    link: 'http://paizo.com/pathfinderRPG/prd/equipment.html',

    onUse: function (user, target) { // user is the D20_Character who is activating this object. Target may be a D20_Character OR an {xPos, yPos} location
//		if (this.DEBUG) { log("Called from within itemData." + this.name.toPropertyName() + ".onUse() { name='" + this.name + "', caster='" + user.name + "' }"); }
	
	// <-------------------------------------->

		if 	(!target) { target = { xPos: user.xPos + 70, yPos: user.yPos }; }
		var new_ItemEffect = create_Fire(target.xPos, target.yPos, 'RED', user.page_ID);
		new_ItemEffect.set( { name: user.name + "'s " + this.name + " effect",
			controlledby: user.r20_char.get("controlledby"), aura1_radius: this.area, aura1_color: "#FF0000",
			showname: true, showplayers_name: true, playersedit_name: false,  playersedit_bar1: false,  playersedit_bar2: false,  playersedit_bar3: false,  playersedit_aura1: false,  playersedit_aura2: false,
			gmnotes: JSON.stringify( {type: 'item', name_id: this.name.toPropertyName(), caster_id: user.id, class_name: undefined, reposition: true, rotate: false } ) // store the Roll20 character ID of the user in the gmnotes field.
			} );   // end of new_ItemEffect.set()    
		toFront(new_ItemEffect);
		sendChat("", "/desc (("+ user.name + ", please position your " + this.name + " item effect, then click the 'Finish' button.))");
	
	// <-------------------------------------->
	
		return new_ItemEffect; }, // a reference to a Roll20 Token representing an item effect, not to the characterData Lazy Initialization hash table
			
	onMiss: function () { return this },		// grenade-like weapon    
    onFumble: function () { return this }, 		// a function to be invoked when the attack roll is a critical miss (a natural 1)
    onHit: function () { return this },    		// inflict Fire damage over 2 rounds

    onFinishUse: function(user, location) { // user is a reference to a D20_Character object corresponding to a Roll20 character
    // location is either a D20_Character, or simply a location with { xPos, yPos ] properties
		var item_ref = this; // needed to use "helper" functions   
		if (this.DEBUG) { log("Called from within itemData." + this.name.toPropertyName() + ".onFinishUse() { name='" + this.name + "'}"); }
	
	// !!! Need to write code to check that the Spell Effect locator is not outside the spell's effective range, based on caster level
	
	// Select all of the character-Tokens on the same page within a 10 foot radius area of the spell effect marker.
	// Filter out types not affected, then sort by Hit Dice. Spell affects least powerful creatures first, up to 4 Hit Dice.
		var primary_target = (location.name) ? location : undefined; // testing to see if location is a D20_Character. Name property should "shine through"	if (this.DEBUG) { log("location === "); log(location); log("primary_target === "); log(primary_target); } 
		var target_array = getTokensWithinArea( location.page_ID, location.xPos, location.yPos, (this.area / feetPerUnit) ); // returns D20_Character references now
		if (!target_array[0]) {
				log("---warning: getTokensWithinArea() returned no matches. Exiting...");
				return false; }
				
		if (this.DEBUG) { log(" Sorting target_array based on distance from the locator."); }
		target_array = _.sortBy(target_array, function(target) { return distanceBetweenPoints( location.xPos, location.yPos, target.xPos, target.yPos ); }); // sort by distance
		if (this.DEBUG) { log(target_array); }
//		var HTML_Output = this.create_HTMLDisplay(user.display_color);
		var HTML_Output = '';
		
//	THIS IS NOT RIGHT. We need to be using the D20_Character.attack() methods to calculate the attack and target AC, and also to
//	create the HTML display. Simply add to that method to encompass 'grenade-like' weapons, and pass this D20_Weapon to that method
//	through the 'weapon' parameter.

		var fire_damage = randomInteger(6);
		
	// _.each(targets) { using appendHTMLRow( HTML_Output , rowContent ); }
	
		if (this.DEBUG) { log(" Affecting spell recipients..."); }
	
		_.each(target_array, function(target) {
	
			var attackText = "<b>" + target.name + "</b> takes "; 
			// new_SpellEffect.targets.push(target);
			if (target === primary_target ) {
				attackText += formatInlineRollAsHTML(fire_damage, fire_damage.toString() + " (1d6)", false, false ) + "[Fire] damage";
				if (location.r20_token) { location.r20_token.set("red", 2); }
				} // end of, if location is a D20_Character reference
			else { attackText += formatInlineRollAsHTML(1, '1', false, false ) + "[Fire] splash"; }; // end of splash damage
			
			HTML_Output += appendHTMLRow(HTML_Output, attackText);
		}); // end _.each(target_array)
	
	//  --- NOT IMPLEMENTED YET --- append a reference to this SpellEffect to the spell_effects[] array of all of the targets IF they have been computed into D20_Character objects and IF you have arranged to keep this object after the script has finished executing
	
		outputHTMLDisplay(HTML_Output);
		return this; 
	
    } // end of onFinishCast()
   
}, D20_Weapon ); // end of itemData.AlchemistsFire
