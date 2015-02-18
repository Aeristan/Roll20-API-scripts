var D20_Character = {   // This object structure is defined for temporary variable declarations within functions which must "load" that information before performing calculations.
    id: '-1', // will be equal to the Roll20 ID of the character or token it represents, set by the load_fromRoll20Character() method of D20_Character)
    name: '« D20_Character pseudoclass »', // generally seen when a "token" not inheriting from a "character" does not receive a name
    player_name: '« NPC »',
    gender_pronouns: ['it', 'it', 'its'],
    race: 'other',
    type: 'other',
    display_color: '#000000', // used to build HTML DisplayCard. Default is black.
    size: 'Medium',
    char_class: { // An object with named properties whose values are objects representing Character Class data
        commoner: {
            name: 'commoner', 
            level: 1,
            HD: '1d6',
            BAB: 0,
            fort: 0,
            reflex: 0,
            will: 0,
            favored: true,
            PR: 'wisdom', // the ability upon which spellcasting is based, for this class
//          spellsPerDay: [ ],  // May be added by particular classes when they are "loaded", or, remain undefined
//          spellsKnown: [ ], 
            notes: '' }
        }, // end of char_class
    character_level: 1, // also Hit Dice, for monsters
    abilities: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10 },
    initiative: 0,
    base_attack_bonus: 0,
    saving_throws: { // right now, these are total Bonuses. I am working on the calc-as-you-go tool-tip thingy.
        fortitude: 0,
        reflex: 0,
        will: 0 },
    hit_points: {
        current: 1,
        max: 1,
        subdual: 0,
        bleed: 0 },
    damage_reduction: '',
    armor_class: { // these are AC totals which have been loaded directly from the Character Sheet Attributes
        total: 10, // will be phased out (and removed) once calculate_AC() is completed
        touch: 10,
        flat_footed: 10,
        check_penalty: 0,
        max_dex: Infinity,
        cover: 0,
//  From here downward, the values of the properties are MODIFIERS to be added to the ongoing AC calculation
// individual Tokens should still inherit these properties from their prototype D20_Character, even if others are over-written
        armor: 0,
        shield: 0,
        dodge: 0,
        natural: 0,
        enhancement: 0,
        deflection: 0,
        sacred: 0,
        luck: 0,
        miscellaneous: 0,
        },
    feats: [ {
        name: 'error',
        sub: '', // whatever is within the parentesis
        type: 'general',
        descript: 'error - this character has inherited its Feats property back to the D20_Character object' } ],
    spec_abilities: [ {
        name: 'error',
        sub: '', // whatever is within the parentesis
        type: 'general',
        descript: 'error - this character has inherited its Spec_abilities property back to the D20_Character object' } ],
    wielded: { // these will normally be three references to objects of D20_Weapon, loaded by load_fromRoll20Character()
        main: undefined,
        off: undefined,
        ranged: undefined },
    dual_wield: false, // should now be included in attack_forms
    xp_value: 0,
    attack_sequences: { }, // these contain the MAX values for the attack sequences; i.e. the full attack sequence not the one we are currently "on". These do not change as the full_attack option is toggled on or off!
    attack_forms: { }, // Object containing properties named for attack forms: Used to load full_attack, two_weapon, charge, fight_defensively, power_attack, deadly_aim, and total_defense. Loaded from the character sheet by D20_Character.load_Character()
    spell_effects: [ ], // Spells ACTIVE ON THIS character. References to type_SpellEffects. Not yet implemented.
    spells_ongoing: [ ], // Spells CAST BY THIS character, regardless of their target. References to type_SpellEffects. Not yet implemented.
    temp_attack_bonus: 0,
    temp_damage_bonus: 0,
    concealment: 0,
    template: false,
    attitude: 'indifferent',
    xPos: 0,
    yPos: 0,
    r20_token: undefined, // a reference to the Roll20 Token object of the Token that is represented by this character
    r20_char: undefined,  // a reference to the Roll20 Charactcer object of the Character that is analogous to this character
    page_ID: undefined,  // a string containing the unique Roll20 Page ID of the Page that this character's Token is on
    
    beget: function() { // this method creates and returns a new Object of D20_Character which descends from the current one
    // the method is necessary because some nested objects (such as armor class) must also inherit from the prototype
    
/*  This method is currently not being used because it does not work right and I cannot determine why. It seems that the inheritance
    is working correctly, in that the other D20_Character properties shine through. However, when the load_fromRoll20Character()
    method is invoked, the API throws an error that says that it cannot call this method of 'undefined'. */    
        var DEBUG = true;
    
        var N = Object.beget(this);
        N.abilities = Object.beget(this.abilities);
        N.saving_throws = Object.beget(this.saving_throws);
        N.hit_points = Object.beget(this.hit_points);
        N.armor_class = Object.beget(this.armor_class);
        N.wielded = Object.beget(this.wielded);
        
        if (DEBUG) { log("Called from within D20_Character.beget(). Returned result = "); log(N); }
        return N;
        }, // end beget()
 
    calculate_AC: function () { }, // see Combat subroutines.JS
    attack: function () { }, // see Combat subroutines.JS
        
    roll_fortitude: function (DC) {
        var dice_roll = randomInteger(20);
        
        return { value: Number(dice_roll + this.saving_throws.fortitude),
            modifier: Number(this.saving_throws.fortitude),
            raw: Number(dice_roll),
            DC: Number(DC),
            success: (dice_roll === 20) ? true : ( (dice_roll === 1) ? false : (dice_roll + this.saving_throws.fortitude >= DC) ),
            n20: (dice_roll === 20),
            n1: (dice_roll === 1),
            tool_tip: dice_roll.toString() + " (1d20) + <br>" + this.saving_throws.fortitude.toString() + " (Fortitude Save modifier)" };
        },  // end of roll_fortitude()
    
    roll_reflex: function (DC) { 
        var dice_roll = randomInteger(20);
        
        return { value: Number(dice_roll + this.saving_throws.reflex),
            modifier: Number(this.saving_throws.reflex),
            raw: Number(dice_roll),
            DC: Number(DC),
            success: (dice_roll === 20) ? true : ( (dice_roll === 1) ? false : (dice_roll + this.saving_throws.reflex >= DC) ),
            n20: (dice_roll === 20),
            n1: (dice_roll === 1),
            tool_tip: dice_roll.toString() + " (1d20) + <br>" + this.saving_throws.reflex.toString() + " (Reflex Save modifier)" };
        },  // end of roll_fortitude()
    
    roll_will: function (DC) { 
        var dice_roll = randomInteger(20);
        
        return { value: Number(dice_roll + this.saving_throws.will),
            modifier: Number(this.saving_throws.will),
            raw: Number(dice_roll),
            DC: Number(DC),
            success: (dice_roll === 20) ? true : ( (dice_roll === 1) ? false : (dice_roll + this.saving_throws.will >= DC) ),
            n20: (dice_roll === 20),
            n1: (dice_roll === 1),
            tool_tip: dice_roll.toString() + " (1d20) + <br>" + this.saving_throws.will.toString() + " (Will Save modifier)" };
        },  // end of roll_fortitude()
    
    find_class: function (name) { // a function used to iterate through char_class[], looking for a specific Class. Returns that element of the array.
        return this.char_class[name.toPropertyName()]; }, 
        
    find_feat: function (name, sub) { // a function used to iterate through feats[], looking for a specific Feat. Returns that element of the array.    
        return _.filter(this.feats, function (element) {
            if ( element.name.toLowerCase().search(name.toLowerCase()) === -1 ) return false; // if name does not match this Feat's name, return false
            if (sub) return ( element.sub.toLowerCase().search(sub.toLowerCase()) !== -1 ) // if there is a sub parameter, return true if it matches this feat's sub property, false if not
            else return true;                       // if there is no sub parameter, since this Feat's name already matches the name parameter, return true
            }) }, 
        
    find_spec_ability: function (name, sub) { // a function used to iterate through spec_abilities[], looking for a specific Special Ability. Returns that element of the array.    
        return _.filter(this.spec_abilities, function (element) {
            if ( element.name.toLowerCase().search(name.toLowerCase()) === -1 ) return false; // if name does not match this Feat's name, return false
            if (sub) return ( element.sub.toLowerCase().search(sub.toLowerCase()) !== -1 ) // if there is a sub parameter, return true if it matches this feat's sub property, false if not
            else return true;                       // if there is no sub parameter, since this Feat's name already matches the name parameter, return true
            }) },
            
    isFriend: function (targ) {
        var acceptable_attitude = [ ];
        switch (this.attitude) {
        case 'PC':
        case 'helpful':
        case 'friendly': { acceptable_attitude = ['PC', 'helpful', 'friendly']; } break;
        case 'indifferent': { acceptable_attitude = ['friendly', 'indifferent', 'unfriendly']; } break;
        case 'unfriendly': 
        case 'hostile': 
        case 'monster': { acceptable_attitude = ['unfriendly', 'hostile', 'monster']; } break;
        }; // end switch (caster.attitude)
        return ( _.find( acceptable_attitude, function(a) { return (a === targ.attitude); } ) !== undefined );
    }, // end isFriend()
  
    isFoe: function (targ) {
        var acceptable_attitude = [ ];
        switch (this.attitude) {
        case 'PC':
        case 'helpful':
        case 'friendly': { acceptable_attitude = ['unfriendly', 'hostile', 'monster']; } break;
        case 'indifferent': { acceptable_attitude = ['PC', 'helpful', 'hostile', 'monster']; } break;
        case 'unfriendly': 
        case 'hostile': 
        case 'monster': { acceptable_attitude = ['PC', 'helpful', 'friendly']; } break;
        }; // end switch (caster.attitude)
        return ( _.find( acceptable_attitude, function(a) { return (a === targ.attitude); } ) !== undefined );
    }, // end isFoe()
    
	load_fromRoll20Character: function(c) { // 'c' is a reference to a Roll20 Character object. function returns this.
		var DEBUG = false;
		var n = 0; var class_name = "";
	
		if (c.get("_type") === "character") {
			if (DEBUG) { log("Called from within D20_Character.load_fromRoll20Character(). Object ID " + c.id + " is a valid Character named " + c.get("name") + "."); } }
		else {
			log("Error in D20_Character.load_fromRoll20Character(). Object ID " + c.id + " is not a Character.");
			return undefined; }
		
	// NOTE: it does not appear that defaults are being correctly looked up from the character sheet, when the input is a SELECT
			
		this.id = c.id;
		this.name = getAttrByName(c.id, 'Char_Name') ? getAttrByName(c.id, 'Char_Name') : c.get('Name');
		if (getAttrByName(c.id, 'Player_Name')) { this.player_name = getAttrByName(c.id, 'Player_Name'); } // test this to make sure prototypal inheritance is actually working
		this.gender_pronouns = genderPronouns(getAttrByName(c.id, 'Gender'));
		this.race = getAttrByName(c.id, 'Race') ? getAttrByName(c.id, 'Race') : 'Human';
		this.type = getAttrByName(c.id, 'Type') ? getAttrByName(c.id, 'Type') : 'Humanoid';
		this.display_color = getAttrByName(c.id, 'Display_Color'); 
		this.size = getAttrByName(c.id, 'Size') ? getAttrByName(c.id, 'Size') : 'Medium';
	
		n = 0; this.char_class = { };
		while ( getAttrByName(c.id, "repeating_class_" + n + "_Class") != undefined ) { // test to see if the repeating_class attribute is defined for this index value
			class_name = getAttrByName( c.id, "repeating_class_" + n + "_Class" ).toPropertyName();
			if (DEBUG) { log("   Within while loop: repeating_class_" + n + "_Class = " + class_name ); }
			this.char_class[class_name] =  { name: getAttrByName(c.id, "repeating_class_" + n + "_Class"),
				level: getAttrByName(c.id, "repeating_class_" + n + "_ClassLevel") ? parseInt( getAttrByName( c.id, "repeating_class_" + n + "_ClassLevel" )) : 1,
				HD: getAttrByName(c.id, "repeating_class_" + n + "_ClassHD"),
				BAB:parseInt(getAttrByName(c.id, "repeating_class_" + n + "_ClassBAB")),
				fort: parseInt(getAttrByName(c.id, "repeating_class_" + n + "_ClassFort")),
				reflex: parseInt(getAttrByName(c.id, "repeating_class_" + n + "_ClassReflex")),
				will: parseInt(getAttrByName(c.id, "repeating_class_" + n + "_ClassWill")),
				favored: ( getAttrByName(c.id, "repeating_class_" + n + "_ClassFavored") === 'on') ? true : false,
				PR: getAttrByName(c.id, "repeating_class_" + n + "_ClassPR") ? getAttrByName(c.id, "repeating_class_" + n + "_ClassPR").toLowerCase() : "", // the ability upon which spellcasting is based, for this class
				notes: getAttrByName(c.id, "repeating_class_" + n + "_ClassSpec") }; // end of this.char_class[n] object declaration block
			if (getAttrByName(c.id, "repeating_class_" + n + "_Class_Spell_1_Cast") > 0) {
				this.char_class[class_name].spellsPerDay = [ ];
				for (x = 1; x <= 9; x++) { this.char_class[class_name].spellsPerDay[x] = parseInt(getAttrByName(c.id, "repeating_class_" + n + "_Class_Spell_" + x + "_Cast")); };
				}; // end if spells castable per day is defined
			if (getAttrByName(c.id, "repeating_class_" + n + "_Class_Spell_0_Known") > 0) {
				this.char_class[class_name].spellsKnown = [ ];
				for (x = 0; x <= 9; x++) { this.char_class[class_name].spellsKnown[x] = parseInt(getAttrByName(c.id, "repeating_class_" + n + "_Class_Spell_" + x + "_Known")); };
				}; // end if spells castable per day is defined
			n++; };   // end while loop for defined classes in repeating fields
	
		this.character_level = getAttrByName(c.id, 'Level');
		this.abilities = {
			strength: parseInt(getAttrByName(c.id, 'STR')),
			dexterity: parseInt(getAttrByName(c.id, 'DEX')),
			constitution: parseInt(getAttrByName(c.id, 'CON')),
			intelligence: parseInt(getAttrByName(c.id, 'INT')),
			wisdom: parseInt(getAttrByName(c.id, 'WIS')),
			charisma: parseInt(getAttrByName(c.id, 'CHA')) };
		this.initiative = parseInt(getAttrByName(c.id, 'Initiative'));
		this.base_attack_bonus = parseInt(getAttrByName(c.id, 'Base_Attack'));
		this.saving_throws = {
			fortitude: parseInt(getAttrByName(c.id, 'Fortitude')),
			reflex: parseInt(getAttrByName(c.id, 'Reflex')),
			will: parseInt(getAttrByName(c.id, 'Will')) };
		this.hit_points = {
			current: parseInt(getAttrByName(c.id, 'HP', "current")),
			max: parseInt(getAttrByName(c.id, 'HP', "max")),
			subdual: parseInt(getAttrByName(c.id, 'Subdual')),
			bleed: parseInt(getAttrByName(c.id, 'Bleed')) };
		this.damage_reduction = getAttrByName(c.id, 'Damage_Reduction');
		this.armor_class = {
	//  These values are TOTALS, looked up right now from the character sheet. This is the "old way" of doing this.
			total: parseInt(getAttrByName(c.id, 'AC')),
			touch: parseInt(getAttrByName(c.id, 'AC_touch')),
			flat_footed: parseInt(getAttrByName(c.id, 'AC_flat')),
			check_penalty: parseInt(getAttrByName(c.id, 'Armor_Check_Penalty')),
			max_dex: parseInt(getAttrByName(c.id, 'Armor_Body_maxDex')), // ignore the "shield" value for now
			cover: parseInt(getAttrByName(c.id, 'Cover')),
	//  These values are modifiers, used by calculate_AC() to computer the AC (and tool-tip). This is the "new way", not finished yet.
			armor: parseInt(getAttrByName(c.id, 'AC_armor')),
			shield: parseInt(getAttrByName(c.id, 'AC_shield')),
			dodge: parseInt(getAttrByName(c.id, 'AC_dodge')),
			natural: parseInt(getAttrByName(c.id, 'AC_natural')),
			enhancement: parseInt(getAttrByName(c.id, 'AC_enhance')),
			deflection: parseInt(getAttrByName(c.id, 'AC_deflect')),
			sacred: parseInt(getAttrByName(c.id, 'AC_sacred')),
			luck: parseInt(getAttrByName(c.id, 'AC_luck')),
			miscellaneous: parseInt(getAttrByName(c.id, 'AC_misc'))
			};
	
		n = 0; this.feats = [ ];
		while ( getAttrByName(c.id, "repeating_feats_" + n + "_Feat") != undefined ) { // test to see if the repeating_class attribute is defined for this index value
			if (DEBUG) { log("   Within while loop: repeating_feats_" + n + "_Feat = " + getAttrByName(c.id, "repeating_feats_" + n + "_Feat") ); }
			this.feats[n] =  { name: getAttrByName(c.id, "repeating_feats_" + n + "_Feat").trim(),
				sub: '', // whatever is within the parentesis in the name field; will be parsed out below, if present.
				type: getAttrByName(c.id, "repeating_feats_" + n + "_FeatType"),
				descript: getAttrByName(c.id, "repeating_feats_" + n + "_FeatDesc") };
			if (this.feats[n].name.indexOf('(') !== -1) { // if there is a parenthesis notation in the Feat's name, separate that out now
				this.feats[n].sub = this.feats[n].name.slice( this.feats[n].name.indexOf('(')+1 , this.feats[n].name.indexOf(')') );
				this.feats[n].name = this.feats[n].name.slice( 0 , this.feats[n].name.indexOf('(') ).trim(); };
			n++; };   // end while loop for defined classes in repeating fields
	
		n = 0; this.spec_abilities = [ ];
		while ( getAttrByName(c.id, "repeating_specability_" + n + "_SpecAbility") != undefined ) { // test to see if the repeating_class attribute is defined for this index value
			if (DEBUG) { log("   Within while loop: repeating_specability_" + n + "_SpecAbility = " + getAttrByName(c.id, "repeating_specabilities_" + n + "_SpecAbility") ); }
			this.spec_abilities[n] =  { name: getAttrByName(c.id, "repeating_specability_" + n + "_SpecAbility").trim(),
				sub: '', // whatever is within the parentesis in the name field; will be parsed out below, if present.
				type: getAttrByName(c.id, "repeating_specability_" + n + "_SpecAbilityType"),
				descript: getAttrByName(c.id, "repeating_specability_" + n + "_SpecAbilityDesc") };
			if (this.spec_abilities[n].name.indexOf('(') !== -1) { // if there is a parenthesis notation in the Special Ability's name, separate that out now
				this.spec_abilities[n].sub = this.spec_abilities[n].name.slice( this.spec_abilities[n].name.indexOf('(')+1 , this.spec_abilities[n].name.indexOf(')') );
				this.spec_abilities[n].name = this.spec_abilities[n].name.slice( 0 , this.spec_abilities[n].name.indexOf('(') ).trim(); };
			n++; };   // end while loop for defined classes in repeating fields
	
		if (this.hasOwnProperty('wielded') == false) {
			this.wielded = { main: Object.beget(D20_Weapon),
				off: Object.beget(D20_Weapon),
				ranged: Object.beget(D20_Weapon) } }; // end of this.wielded === D20_Character.wielded, inheriting from protoype when it shouldn't be
		this.wielded.main.load_fromRoll20Character(c, 'Main');
		this.wielded.off.load_fromRoll20Character(c, 'Off');
		this.wielded.ranged.load_fromRoll20Character(c, 'Ranged');
	
	//  These contain the MAX values for the attack sequences; i.e. the full attack sequence not the one we are currently "on".
	//  These do not change as the full_attack option is toggled on or off!
		this.attack_sequences = { full_main: getAttrByName(c.id, 'AttackForm_FullAttack_Main_sequence','max'),
			full_off: getAttrByName(c.id, 'AttackForm_FullAttack_Off_sequence','max'),
			full_ranged: getAttrByName(c.id, 'AttackForm_FullAttack_Ranged_sequence','max'),   
			two_main: getAttrByName(c.id, 'AttackForm_2Weapon_Main_sequence','max'),
			two_off: getAttrByName(c.id, 'AttackForm_2Weapon_Off_sequence','max') };
		
		this.attack_forms = { };
		this.load_AttackFormsFromRoll20(c);
			
		this.xp_value = parseInt(getAttrByName(c.id, 'XP_Value'));
		this.temp_attack_bonus = parseInt(getAttrByName(c.id, 'Temp_Attack_Bonus'));
		this.temp_damage_bonus = parseInt(getAttrByName(c.id, 'Temp_Damage_Bonus'));
		this.concealment = parseInt(getAttrByName(c.id, 'Concealment'));
		this.template = ( getAttrByName(c.id, 'Template') == 'on' ) ? true : false;
		this.attitude = getAttrByName(c.id, 'Attitude');
		
		this.r20_char = c;  // this allows the Roll20 API to directly alter the Character properties (i.e. Attributes) if it needs to
		
		if (DEBUG) {
			log(this);
			log("Exiting D20_Character.load_fromRoll20Character()."); }
			
		return this;
	}, // end of D20_Character.load_fromRoll20Character()
	
	load_AttackFormsFromRoll20: function (c) {
		var DEBUG = true;
	// Object containing properties named for attack forms: Used to load full_attack, two_weapon, charge, fight_defensively, power_attack, deadly_aim, and total_defense. Loaded from the character sheet by D20_Character.load_Character()
	// attack_forms contains the CURRENT full-attack and two-weapon sequences, but, the 'max' ones are stored in attack_sequences and
	// are NOT reloaded when attack forms are toggled on or off. When *this* method is called, the "current" values (main_remaining, etc)
	// are only overwritten if they are falsy (blank strings). 
		if ( getAttrByName(c.id, 'AttackForm_FullAttack') === 'on' ) {
			if (DEBUG) { log("   attack form: FullAttack is checked! Adding to this.attack_forms.full_attack."); }
			this.attack_forms.full_attack = this.attack_forms.full_attack || { name: 'Full Attack action' };
			this.attack_forms.full_attack.main_remaining   = this.attack_forms.full_attack.main_remaining   || this.attack_sequences.full_main;
			this.attack_forms.full_attack.off_remaining    = this.attack_forms.full_attack.off_remaining    || this.attack_sequences.full_off;
			this.attack_forms.full_attack.ranged_remaining = this.attack_forms.full_attack.ranged_remaining || this.attack_sequences.full_ranged;
			} // end FullAttack
		else { delete this.attack_forms.full_attack; }
		
		if ( getAttrByName(c.id, 'AttackForm_2Weapon') === 'on' ) {
			if (DEBUG) { log("   attack form: 2Weapon is checked! Adding to this.attack_forms.two_weapon."); }
			this.attack_forms.two_weapon = this.attack_forms.two_weapon || { name: 'Two-weapon fighting' };
			this.attack_forms.two_weapon.main_modifier  = parseInt( getAttrByName(c.id, 'AttackForm_2Weapon_Main_modifier') );
			this.attack_forms.two_weapon.main_remaining = this.attack_forms.two_weapon.main_remaining   || this.attack_sequences.two_main;
			this.attack_forms.two_weapon.off_modifier   = parseInt( getAttrByName(c.id, 'AttackForm_2Weapon_Off_modifier') );
			this.attack_forms.two_weapon.off_remaining  = this.attack_forms.two_weapon.off_remaining    || this.attack_sequences.two_off;
		} // end Two_Weapon
		else { delete this.attack_forms.two_weapon; }
		   
		if ( getAttrByName(c.id, 'AttackForm_Charge') === 'on' ) {
			if (DEBUG) { log("   attack form: Charge! is checked! Adding to this.attack_forms.charge."); }
			this.attack_forms.charge = { name: 'Charge! attack action',
				attack_modifier: parseInt( getAttrByName(c.id, 'AttackForm_Charge_bonus') ),
				ac_modifier: parseInt( getAttrByName(c.id, 'AttackForm_Charge_penalty') ) }  } // end Charge 
		else { delete this.attack_forms.charge; }
				
		if ( getAttrByName(c.id, 'AttackForm_FightDefensively') === 'on' ) {
			if (DEBUG) { log("   attack form: FightDefensively is checked! Adding to this.attack_forms.fight_defensively."); }
			this.attack_forms.fight_defensively = { name: 'Fight Defensively',
				attack_modifier: parseInt( getAttrByName(c.id, 'AttackForm_FightDefensively_penalty') ),
				ac_modifier: parseInt( getAttrByName(c.id, 'AttackForm_FightDefensively_bonus') ) }  } // end FightDefensively 
		else { delete this.attack_forms.fight_defensively; }
				
		if ( getAttrByName(c.id, 'AttackForm_PowerAttack') === 'on' ) { // Will only be used if the character has the required Feat!
			if (DEBUG) { log("   attack form: PowerAttack is checked! Adding to this.attack_forms.power_attack."); }
			this.attack_forms.power_attack = { name: 'Power Attack',
				attack_modifier: parseInt( getAttrByName(c.id, 'AttackForm_PowerAttack_penalty') ),
				damage_modifier: parseInt( getAttrByName(c.id, 'AttackForm_PowerAttack_bonus') ),
				feat_valid: false }  } // this will be set to true in the attack method as the API iterates through the character's Feats
		else { delete this.attack_forms.power_attack; }
				
		if ( getAttrByName(c.id, 'AttackForm_DeadlyAim') === 'on' ) { // Will only be used if the character has the required Feat!
			if (DEBUG) { log("   attack form: DeadlyAim is checked! Adding to this.attack_forms.deadly_aim."); }
			this.attack_forms.deadly_aim = { name: 'Deadly Aim',
				attack_modifier: parseInt( getAttrByName(c.id, 'AttackForm_DeadlyAim_penalty') ),
				damage_modifier: parseInt( getAttrByName(c.id, 'AttackForm_DeadlyAim_bonus') ),
				feat_valid: false }  } // this will be set to true in the attack method as the API iterates through the character's Feats
		else { delete this.attack_forms.deadly_aim; }
				
		if ( getAttrByName(c.id, 'AttackForm_TotalDefense') === 'on' ) {
			if (DEBUG) { log("   attack form: TotalDefense is checked! Adding to this.attack_forms.total_defense."); }
			this.attack_forms.total_defense = { name: 'Total Defense',
				ac_modifier: parseInt( getAttrByName(c.id, 'AttackForm_TotalDefense_bonus') ) }  } // end TotalDefense
		else { delete this.attack_forms.total_defense; }
				
		return this.attack_forms;
	}, // end load_AttackFormsFromRoll20()
	
	// *** NOT BEING USED YET, NEED TO FINISH CODING IT!!!
	load_fromRoll20Attribute: function(attr) { // 'attr' is a reference to a Roll20 Attribute object. function returns this.
		var DEBUG = true;
		var n = 0;
	
		if (attr.get("_type") === "attribute") {
			if (DEBUG) { log("*** Called from within D20_Character.load_fromRoll20Attribute(). Character name is '" + this.name + "'. Object ID " + attr.id + " is a valid Attribute named " + attr.get("name") + "."); } }
		else {
			log("*** Error in D20_Character.load_fromRoll20Attribute(). Object ID " + attr.id + " is not an Attribute.");
			return undefined; }
	
		if ( getObj('character', attr.get('_characterid')) !== this.r20_char) {
			log("*** Error in D20_Character.load_fromRoll20Attribute(): the Attribute's _characterid does not match this D20_Character object's r20_char property! Returning 'undefined'...");
			return undefined; }
			
		var val = attr.get('current'); var val_max = attr.get('max');
		var parsed_name = attr.get('name').split('_'); // parse the Attribute name between underscore characters. Useful for repeating fields
	
		switch (attr.get('name')) {
		
		case 'Char_Name': { this.name = val; } break;
		case 'Player_Name': { this.player_name = val; } break;
		case 'Gender': { this.gender_pronouns = genderPronouns(val); } break;
		case 'Race': { this.race = val; } break;
		case 'Type': { this.type = val; } break;
		case 'Display_Color': { this.display_color = val; } break;
		case 'Size': { this.size = val; } break;
		case 'Level': { this.character_level = parseInt(val); } break;
		case 'STR': { this.abilities.strength = parseInt(val); } break;
		case 'DEX': { this.abilities.dexterity = parseInt(val); } break;
		case 'CON': { this.abilities.constitution = parseInt(val); } break;
		case 'INT': { this.abilities.intelligence = parseInt(val); } break;
		case 'WIS': { this.abilities.wisdom = parseInt(val); } break;
		case 'CHA': { this.abilities.charisma = parseInt(val); } break;
		case 'Initiative': { this.initiative = parseInt(val); } break;
		case 'Base_Attack': { this.base_attack_bonus = parseInt(val); } break;
		case 'Fortitude': { this.saving_throws.fortitude = parseInt(val); } break;
		case 'Reflex': { this.saving_throws.reflex = parseInt(val); } break;
		case 'Will': { this.saving_throws.will = parseInt(val); } break;
		case 'HP': { this.hit_points.current = parseInt(val); this.hit_points.max = parseInt(val_max); } break;
		case 'Subdual': { this.hit_points.subdual = parseInt(val); } break;
		case 'Bleed': { this.hit_points.bleed = parseInt(val); } break;
		case 'Damage_Reduction': { this.damage_reduction = val; } break;
		case 'AC': { this.armor_class.total = parseInt(val); } break;
		case 'AC_touch': { this.armor_class.touch = parseInt(val); } break;
		case 'AC_flat': { this.armor_class.flat_footed = parseInt(val); } break;
		case 'Armor_Check_Penalty': { this.armor_class.check_penalty = parseInt(val); } break;
		case 'Cover': { this.armor_class.cover = parseInt(val); } break;
		case 'XP_Value': { this.xp_value = parseInt(val); } break;
		case 'Temp_Attack_Bonus': { this.temp_attack_bonus = parseInt(val); } break;
		case 'Temp_Damage_Bonus': { this.temp_damage_bonus = parseInt(val); } break;
		case 'Concealment': { this.temp_attack_bonus = parseInt(val); } break;
		case 'Template': { this.template = (val === 'on') ? true : false; } break;
		case 'Attitude': { this.attitude = val; } break;
		
		default: { // if the attribute name is not matched exactly above, parse it by the underscores, and check to see if it is one of a category of fields...
			switch (parsed_name[0]) {
			
			case 'AttackForm': {
				if (DEBUG) { log("   This Attribute pertains to an attack form named '" + parsed_name[1] + "'..."); }
				if (!this.hasOwnProperty(attack_forms)) { this.attack_forms = { }; };
				switch (parsed_name[1]) {
				
				case 'FullAttack': {
					if ( getAttrByName(this.r20_char.id, 'AttackForm_FullAttack') === 'on' ) {
						this.attack_forms.full_attack = { name: 'Full Attack action',
							main_sequence: getAttrByName(this.r20_char.id, 'AttackForm_FullAttack_Main_sequence','max'),
							off_sequence: getAttrByName(this.r20_char.id, 'AttackForm_FullAttack_Off_sequence','max'),
							ranged_sequence: getAttrByName(this.r20_char.id, 'AttackForm_FullAttack_Ranged_sequence','max') }  } // end FullAttack
					else { delete this.attack_forms.full_attack; }
					} break; // end of Full Attack attack form
				case '2Weapon': {
					if ( getAttrByName(this.r20_char.id, 'AttackForm_2Weapon') === 'on' ) {
						this.attack_forms.two_weapon = { name: 'Two-weapon fighting',
							main_modifier: parseInt( getAttrByName(this.r20_char.id, 'AttackForm_2Weapon_Main_modifier') ),
							main_sequence: getAttrByName(this.r20_char.id, 'AttackForm_2Weapon_Main_sequence','max'),
							off_modifier: parseInt( getAttrByName(this.r20_char.id, 'AttackForm_2Weapon_Off_modifier') ), 
							off_sequence: getAttrByName(this.r20_char.id, 'AttackForm_2Weapon_Off_sequence','max') }  } // end 2Weapon 
					else { delete this.attack_forms.two_weapon; }
					} break; // end of Two-Weapon Fighting attack form
				case 'Charge': {
					if ( getAttrByName(this.r20_char.id, 'AttackForm_Charge') === 'on' ) {
						this.attack_forms.charge = { name: 'Charge! attack action',
							attack_modifier: parseInt( getAttrByName(this.r20_char.id, 'AttackForm_Charge_bonus') ),
							ac_modifier: parseInt( getAttrByName(this.r20_char.id, 'AttackForm_Charge_penalty') ) }  } // end Charge 
					else { delete this.attack_forms.charge; }
					} break; // end of Charge! attack form
				case 'FightDefensively': {
					if ( getAttrByName(this.r20_char.id, 'AttackForm_FightDefensively') === 'on' ) {
						this.attack_forms.fight_defensively = { name: 'Fight Defensively',
							attack_modifier: parseInt( getAttrByName(this.r20_char.id, 'AttackForm_FightDefensively_penalty') ),
							ac_modifier: parseInt( getAttrByName(this.r20_char.id, 'AttackForm_FightDefensively_bonus') ) }  } // end FightDefensively 
					else { delete this.attack_forms.fight_defensively; }
					} break; // end of Fight Defensively attack form
				case 'PowerAttack': {
					if ( getAttrByName(this.r20_char.id, 'AttackForm_PowerAttack') === 'on' ) { // Will only be used if the character has the required Feat!
						this.attack_forms.power_attack = { name: 'Power Attack',
							attack_modifier: parseInt( getAttrByName(this.r20_char.id, 'AttackForm_PowerAttack_penalty') ),
							damage_modifier: parseInt( getAttrByName(this.r20_char.id, 'AttackForm_PowerAttack_bonus') ) }  } // end PowerAttack
					else { delete this.attack_forms.power_attack; }
					} break; // end of Power Attack attack form
				case 'DeadlyAim': {
					if ( getAttrByName(c.id, 'AttackForm_DeadlyAim') === 'on' ) { // Will only be used if the character has the required Feat!
						this.attack_forms.deadly_aim = { name: 'Deadly Aim',
							attack_modifier: parseInt( getAttrByName(c.id, 'AttackForm_DeadlyAim_penalty') ),
							damage_modifier: parseInt( getAttrByName(c.id, 'AttackForm_DeadlyAim_bonus') ) }  } // end DeadlyAim
					else { delete this.attack_forms.deadly_aim; }
					} break; // end of Deadly Aim attack form
				case 'TotalDefense': {
					if ( getAttrByName(c.id, 'AttackForm_TotalDefense') === 'on' ) {
						this.attack_forms.total_defense = { name: 'Total Defense',
							ac_modifier: parseInt( getAttrByName(c.id, 'AttackForm_TotalDefense_bonus') ) }  } // end TotalDefense
					else { delete this.attack_forms.total_defense; }
					} break; // end of Total Defense attack form
				default: log("   Error in AttackForm switch statement: " + parsed_name[1] + " is not a recognized option. (Maybe not spelled correctly?)");
				}; // end of switch(parsed_name[1]), what category of repeating field
				} break; // end of case 'AttackForm'
			case 'repeating': { // one of the ROLL20 character sheet REPEATING FIELDS
	//  When this method is invoked pertaining to on of the REPEATING FIELDS, it might be from within a "add:attribute" or
	//  "destroy:attribute" event, instead of a "change:attribute" event. The entire repeating field should be re-loaded.
				if (DEBUG) { log("   This Attribute belongs to a repeating field named '" + parsed_name[1] + "'..."); }
				switch (parsed_name[1]) {
				
				case 'class': {
	//  parsed_name[2] is a String representing a Number which is the position in the Array of Roll20's Repeating Fields.
	//  However, D20_Character.char_class is an Object whose named properties are Objects with class information in them.
	//  Therefore, parsed_name[2] is not used, only the name of the class, which is this Attribute only when
	//  parsed_name[3] === 'Class' AND parsed_name[4] === undefined.
					switch (parsed_name[3]) {
						
					case 'Class': {
							if (!parsed_name[4]) { // the name of the class has changed, so, we need to destroy the old char_class property and create a new one
						
							} else if (parsed_name[4] === 'Spell') { // otherwise a Spell
								// parsed_name[5] is part of the Attribute name, NOT a position in a Repeating Field
								// parsed_name[6] will be either 'Cast' or 'Known'
							} else { } // Error
							} break;
					case 'ClassLevel': { } break;
					case 'ClassHD': { } break;
					case 'ClassBAB': { } break;
					case 'ClassFort': { } break;
					case 'ClassReflex': { } break;
					case 'ClassWill': { } break;
					case 'ClassSpec': { } break;
					case 'ClassPR': { } break;
					case 'ClassFavored': { } break;
					default: { } // Error
					}; // end of switch(parsed_name[3])
					} break; // end of CLASS repeating field
				case 'feats': { } break; // end of FEATS repeating field
				case 'specability': { } break; // end of SPECIAL ABILITY repeating field
				
			//  SpellList1 and SpellList2 will have to be dealt with at a later date.
			
				default: log("   Error in repeating field switch statement: " + parsed_name[1] + " is not a recognized option. (Maybe not implemented yet?)");
				}; // end of switch(parsed_name[1]), what category of repeating field
				} break; // end of case 'repeating'
			case 'Weapon': {
				if (DEBUG) { log("   This Attribute is part of a Weapon group, for slot '" + parsed_name[1] + "'..."); }
				parsed_name[1] = parsed_name[1].toLowerCase();
				this.wielded[parsed_name[1].toLowerCase()] = this.wielded[parsed_name[1].toLowerCase()] || Object.beget(D20_Weapon);
				this.wielded[parsed_name[1].toLowerCase()].load_fromRoll20Character(this.r20_char, parsed_name[1]);
				
				} break; // end of case 'Weapon'
				
			default: { // if neither attr_name or parsed_name[0] are found in the switch statements above, log a WARNING to the output console
				log("*** Warning in D20_Character.load_fromRoll20Attribute(). Attribute named '" + attr.get('name') + "' cannot be parsed as a property of D20_Character. '" + this.name + "' has not been altered.");
	
				} // end of switch (parsed_name[0]) DEFAULT code block
			}; // end of switch (parsed_name[0])
			
			} // end of switch(attr.name) DEFAULT code block
		}; // end of switch (attr.name)
	
		if (DEBUG) {
			log(this);
			log("Exiting D20_Character.load_fromRoll20Attribute()."); }
			
		return this;
	}, // end of D20_Character.load_fromRoll20Attribute()
	
	load_fromRoll20Token: function(t) { // 't' is a reference to a Roll20 Token object. function returns this.
		var DEBUG = true;
		var n = 0;
		var that = this;
	
		if ( (t.get("_type") === "graphic") && (t.get("_subtype") === "token") ) {
			if (DEBUG) { log("Called from within D20_Character.load_fromRoll20Token(). Object ID " + t.id + " is a valid Token named " + t.get("name") + ".");
				if (t.get("represents") == "") { log("Warning in D20_Character.load_fromRoll20Token(). Object ID " + t.id + " is a Token that does not represent a valid Character. (This is allowed, however.)"); }
				} 
		} else { // t is not a Token
			if (DEBUG) { log("Error in D20_Character.load_fromRoll20Token(). Object ID " + t.id + " is not a Token."); }
			return undefined; }
			
		this.xPos = t.get('left'); // tack the X and Y positions of the actual token on to the character object being created.
		this.yPos = t.get('top');  
		this.rotation = t.get('rotation'); // needed for things like Color Spray
		this.page_ID = t.get('_pageid'); // used to make sure that attacks and spells affects only tokens on the same page
		this.status_markers = {  };
		this.r20_token = t; // this allows the Roll20 API to directly alter the Token properties (i.e. status markers) if it needs to
		
		if ( this.r20_token.get("statusmarkers") ) {
			_.each( this.r20_token.get("statusmarkers").split(","), function (element, index, list) {
				if (element.indexOf("@") > -1) {
					that.status_markers[ element.substring(0, element.indexOf("@")) ] = parseInt( element.substring( element.indexOf("@") + 1 ) ); }
				else { 
					that.status_markers[ element ] = -1; }
			}); } // end of _.each( attacker.status_markers )
	
		if (DEBUG) { log("   Loaded status markers: "); 
			log(this.status_markers); }    
		
		if (this.template) { // if this is a TEMPLATE, certain values will be taken from the Token's properties, not the Roll20 Character Sheet
			if (DEBUG) { log("   Recognized this Character as a TEMPLATE..."); }
			this.name = t.get('name');
			if (!this.hasOwnProperty('hit_points')) { this.hit_points = Object.beget(this.hit_points); }
			this.hit_points.current = parseInt( t.get('bar1_value') );
			if (!isNaN( parseInt( t.get('bar1_max') ) ) ) { this.hit_points.max = parseInt( t.get('bar1_max') ); }
			if (!this.hasOwnProperty('armor_class')) { this.armor_class = Object.beget(this.armor_class); }
			this.armor_class.total = parseInt( t.get('bar3_value') ); }
	
		
		if (DEBUG) {
			log(this);
			log("Exiting D20_Character.load_fromRoll20Token()."); }
			
		return this;
	} // end of D20_Character.load_fromRoll20Token()
  
}; // end of D20_Character object declaration 

var characterData = (function () { 
    var DEBUG = false; // I know this works; I only need to DEBUG the lazy3() method in the Roll20 interface
    var hash_table = {};
/*  One large private "map", the properties of which will be references to objects of D20_Character.
    This "map" will be populated using "Lazy Initialization". The names of the properties will correspond to the unique Roll20
    object IDs, minus the leading hyphen. In this way, Roll20 Characters will be linked to the D20_Character objects representing
    them. Roll20 Token objects will be linked to objects which inherit directly from the D20_Character objects that they
    represent: in this way, prototypal inheritance can be used, without the Algorythm needing to know which type of Roll20 object a
    specific property corresponds to. */
    
    var _static = {

        get: function(n) {
/*  This method retrieves the value of property named by the Roll20 ID string passed in, minus the leading hyphen. There may be
    other hyphens in the ID after the leading one, however; this is allowed. If it does not exist, return undefined. */
        if ((!n) || (n === '-1')) { if (DEBUG) { log("     Error in characterData.get() method: attempt to read from ID '-1'. Returning undefined."); }
            return undefined; }
        if (DEBUG) { log("*** Called from within characterData.get( " + n + " ). D20_Character = "); log(hash_table[n.substring(1)]); }
        return hash_table[n.substring(1)]; },
    
        set: function(n, obj) {
/*  This method sets the value of a property of the characterData object to the object reference passed in. Whether this will be
    a "character" (from a Roll20 Character object, inheriting from D20_Character and updating most of the D20_Character properties),
    or a "token" (from a Roll20 Token object, which will inherit from the D20_Character object corresponding to the Characters
    they represent, updating only certain properties like xPos, yPos, and perhaps Hit Points) will be determined by the mainAPI. */
        if ((!n) || (n === '-1')) { if (DEBUG) { log("     Error in characterData.get() method: attempt to read from ID '-1'. Returning undefined."); }
            return undefined; }
        if (DEBUG) { log("*** Called from within characterData.set( " + n + " ). D20_Character = "); log(obj); }
        hash_table[n.substring(1)] = obj;
        return obj; }
        }; // end of _static
        
    return _static;
})(); // returns the result of invoking this function, an object of type _static, with access to the private member hash_table.

characterData.lazy3 = function(id) {
    var DEBUG = false;
/*  This adds a method to the characterData object, which is declared in Character object declarations.js. The method takes a
    valid Roll20 ID (a string) referring to either a TOKEN or a CHARACTER and returns an object with three properties: 
        r20_token: a reference to the Roll20 Token object with this ID (if any)
        r20_char: a reference to the Roll20 Character with this ID (if any), OR, a reference to the Roll20 Character REPRESENTED
            by this Token, if this ID refers to a token
        D20_Char: a reference to the entry in the characterData hash_table corresponding to this ID (minus the leading '-'), which
            will either by a D20_Character object, or a direct descendant of a D20_Character object (if a Token)
    Note that since this method is added after-the-fact, it will NOT have access to the characterData object's private members;
        rather, it will have to use the get() and set() methods provided. */  
        
    if (DEBUG) { log(""); log("*** Called from within characterData.lazy3( " + id + " ). Checking for Roll20 Tokens and/or Characters."); }

    var _result = {
        r20_token: getObj('graphic', id),
        r20_char: getObj('character', id),
        D20_Char: this.get(id) };
        
    var parent_typeChar = D20_Character; // the default parent for new "characters", unless it is a "token" inheriting from an exisiting "character"
    
    if ( ( _result.r20_token || _result.r20_char ) === undefined ) {
        if (DEBUG) { log("     Error: this ID represents neither a Roll20 Token nor a Character. Breaking."); }
        return _result; } // if id is neither a Token nor a Character, all three values will return 'undefined'.
    // This should be the case if '-1' is passed in for an id. getObj('type','-1') and characterData.get('-1') always return undefined.
    
    if (_result.r20_token) { // if a token, the r20_char property should then reflect the character this Token represents
        _result.r20_char = getObj('character', _result.r20_token.get('represents') ); } // might still be 'undefined' if this Token does not represent a Character
        
    if (!_result.D20_Char) { // if this id does not yet have an entry in the characterData hash_table, we create one here
        if (_result.r20_token) { // new "tokens" will inherit from the D20_Character entries of the "characters" they represent
            if (_result.r20_char) { // if not 'undefined', this Token represents a Character
                parent_typeChar = this.get(_result.r20_char.id); // check to see if it has an entry. returns 'undefined' if not found
                if (!parent_typeChar) { // the character represented by this Roll20 Token does not yet have a character Data entry either.
                    parent_typeChar = Object.beget(D20_Character);
                    parent_typeChar.load_fromRoll20Character(_result.r20_char);
                    if (DEBUG) { log("*** Called from within characterData.lazy3(). Creating new hash_table entry [ " + _result.r20_char.id + "] for parent character named '" + parent_typeChar.name + "'."); }
                    this.set(_result.r20_char.id, parent_typeChar); // create the entry in the hash_table for this Token's Character
                }; // end of (parent_typeChar does not yet have hash_table entry)
            }; // end of (this Roll20 Token represents a Character)
            _result.D20_Char = Object.beget(parent_typeChar); // either an entry from the hash_table, or a New D20_Character descendant            
            _result.D20_Char.load_fromRoll20Token(_result.r20_token);
        } // end of (result is a Roll20 Token)
        else { // (result is a Roll20 Character)
            _result.D20_Char = Object.beget(parent_typeChar); // a New D20_Character descendant            
            _result.D20_Char.load_fromRoll20Character(_result.r20_char);
        } // end of (result is a Roll20 Character)
        if (DEBUG) { log("*** Called from within characterData.lazy3(). Creating new hash_table entry [ " + id + "] for token/character named '" + _result.D20_Char.name + "'."); }
        this.set(id, _result.D20_Char);
    }; // end of (result.D20_Char does not yet exist in hash_table)
 
    if (DEBUG) {
        log("*** Called from within characterData.lazy3( " + id + " ). Returning the following:");
        log("     _result.r20_token = " + ( (_result.r20_token) ? _result.r20_token.get('name') : undefined ) );
        log("     _result.r20_char = " + ( (_result.r20_char) ? _result.r20_char.get('name') : undefined ) );
        log("     _result.D20_Char = "); log(_result.D20_Char);
        log("     Test to make sure prototypal inheritance is working: this D20_Character belongs to the Player named " + _result.D20_Char.player_name + ".");
        log("*** Exiting characterData.lazy3(). "); log(""); }
        
//  This function is supposed to be using the new beget() method of D20_Character, rather than Object.beget(), but it isn't working
//  correctly for some reason. It seems that the inheritance is working correctly, in that the other D20_Character properties
//  shine through. However, when the load_fromRoll20Character() method is invoked, the API throws an error that says that it
//  cannot call this method of 'undefined'.

    return _result;
}; // end of characterData.lazy3()

