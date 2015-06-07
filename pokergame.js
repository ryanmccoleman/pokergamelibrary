// the Utility object is for different common utilities that could be used anywhere
	var UtilityObject = {
		cardValueDictionary: {
			"2": 2,
			"3": 3,
			"4": 4,
			"5": 5,
			"6": 6,
			"7": 7,
			"8": 8,
			"9": 9,
			"10": 10,
			"J": 11,
			"Q": 12,
			"K": 13,
			"A": 14
		} 
	}
	// the configuration houses the handtype rules, which are to be configured and available in different
	// places in the application. This configuratino stores the relative value of different hand types
	// the rules to process in order to classify and analysize a hand type and the tiebreaker rules 
	// that need to be applied for a hand type. 
	var ConfigObject = {
		handTypes: [
			{name: "fourofkind", value: 5, rules: [["isMultipleOfKind", 4]], tiebreakers: ["firstmatchvalue"]},
			{name: "flush", value: 4, rules: ["isFlush", "highCard"], tiebreakers: ["highcard"]},
			{name: "threeofkind", value: 3, rules: [["isMultipleOfKind", 3], ["isMultipleOfKind", 2], "kicker"], tiebreakers: ["extrapair", "firstmatchvalue","secondmatchvalue", "kicker"]},
			{name: "pair", value: 2, rules: [["isMultipleOfKind", 2], ["isMultipleOfKind", 2], "kicker"], tiebreakers: ["extrapair", "firstmatchvalue","secondmatchvalue", "kicker"]},
			{name: "highcard", value: 1, rules: ["highCard"], tiebreakers: ["highcard"]}
		]
	};

// The rule processor takes in a hand and analysizes it against a specific hand type that is passed in
// if the handtype matches the hand the hand gets classified as such and an object is returned 
// providing the classification and additional information about the hand.
RuleProcessor.prototype = {
	ruleList: null,
	fullHand: null,
	cardValues: [],
	suitArray: [],
	ruleNumber: 0,
	matchedHandType: null,
	additionalInfo: {},
	handType: null,
	init: function() {
		this.getSuitArray();
		this.getCardValues();
	},
	processRule: function(rule) {
		this.ruleNumber ++;
		 if (typeof rule === "string") {
			return this[rule]();
		} else if(Array.isArray(rule) === true) {
			return this[rule[0]](rule[1]);
		}
	},

	getCardValues: function() {
		this.cardValues = [];
		for (var i = 0; i < this.fullHand.length; i++) {
			if(this.fullHand[i].length === 3) {
				this.cardValues.push(UtilityObject.cardValueDictionary[this.fullHand[i].substring(0, 2)]);
			} else {
				this.cardValues.push(UtilityObject.cardValueDictionary[this.fullHand[i].charAt(0)]);
			}
		};
	},

	getSuitArray: function() {
		this.suitArray = [];
		for (var i = 0; i < this.fullHand.length; i++) {
			if(this.fullHand[i].length === 3) {
				this.suitArray.push(this.fullHand[i].charAt(2));
			} else if(this.fullHand[i].length === 2) {
				this.suitArray.push(this.fullHand[i].charAt(1));
			}
		};
	},

	// this works to clear out matched values from the cardValue list to allow subsequent rules 
	trimCardValues: function() {
		if(typeof this.additionalInfo["firstmatchvalue"] !== "undefined") {
			while(this.cardValues.indexOf(this.additionalInfo["firstmatchvalue"]) !== -1) {
				this.cardValues.splice(this.cardValues.indexOf(this.additionalInfo["firstmatchvalue"]), 1)
			}			
		} 
		if(typeof this.additionalInfo["secondmatchvalue"] !== "undefined") {
			while(this.cardValues.indexOf(this.additionalInfo["secondmatchvalue"]) !== -1) {
				this.cardValues.splice(this.cardValues.indexOf(this.additionalInfo["firstmatchvalue"]), 1)
			}
		}
	},

	isMultipleOfKind: function(factor) {
		var countNumberObject = this.countNumberTheSame(this.cardValues);
		if(countNumberObject === false) {
			return false;
		} else {
			switch(factor) {
				case 4:
				if(countNumberObject.numberRepeating === 4) {
					this.additionalInfo["firstmatchvalue"] = countNumberObject.repeatingValue;
					return true;
				}
				break;

				case 3: 
				if(countNumberObject.numberRepeating === 3) {
					this.additionalInfo["firstmatchvalue"] = countNumberObject.repeatingValue;
					this.trimCardValues();
					return true;
				}
				break;

				case 2: 
				if(countNumberObject.numberRepeating === 2) {
					if(this.ruleNumber === 1) {
						this.additionalInfo["firstmatchvalue"] = countNumberObject.repeatingValue;
						this.trimCardValues();							
					} else {
						// to make sure in the case of two pair that the first match value is the larger
						if(countNumberObject.repeatingValue > this.additionalInfo["firstmatchvalue"]) {
							var firstRecordedMatchvalue = this.additionalInfo["firstmatchvalue"];
							this.additionalInfo["firstmatchvalue"] = countNumberObject.repeatingValue;
							this.additionalInfo["secondmatchvalue"] = firstRecordedMatchvalue;
						} else {
							this.additionalInfo["secondmatchvalue"] = countNumberObject.repeatingValue;
						}
						this.additionalInfo["extrapair"] = true;
						this.trimCardValues();							
					}
				return true;
				}

			}
		}
	},
	countNumberTheSame: function(valueArray) {
		var highestNumberSame = 0;
		var ValueOfHighestMultiple = null;
		for (var i = 0; i < valueArray.length; i++) {
			var numberTheSame = 0;
			for (var j = 0; j < valueArray.length; j++) {
				if (valueArray[i] === valueArray[j]) {
					numberTheSame ++;
				}
			};
			if(numberTheSame > highestNumberSame) {
				highestNumberSame = numberTheSame;
				ValueOfHighestMultiple = valueArray[i];
			}
		};
		if(highestNumberSame < 2) {
			return false;
		} else {
			return {
				repeatingValue: ValueOfHighestMultiple,
				numberRepeating: highestNumberSame
			}
		}
	},
	highCard: function() {
		this.additionalInfo["highcard"] = this.cardValues.sort(function(a, b){return b-a});
		return true;
	},
	isFlush: function() {
		for (var i = 0; i < this.suitArray.length; i++) {
			if(this.suitArray[0] !== this.suitArray[i]) {
				return false;
			}
		};
		return true
	},
	kicker: function() {
		this.additionalInfo["kicker"] = this.cardValues.sort(function(a, b){return b-a});
		return true;
	},
	processAll: function() {
		this.additionalInfo = {};
		if(this.processRule(this.ruleList[0]) === true) {
			this.matchedHandType = this.ruleList[0];
			if(this.ruleList.length > 1) {
				for (var i =1; i < this.ruleList.length; i++) {
					this.processRule(this.ruleList[i]);
				}
			}
		}
		if(this.matchedHandType === null) {
			return false;
		} else {
			return {
				matchedHandType: this.matchedHandType,
				additionalInfo: this.additionalInfo
			}		
		}
	}

}

function RuleProcessor(obj) {
	if (obj) {
		for (key in obj) {
			this[key] = obj[key];
		}
	}
	this.init();
}



// The HandAnalysis class is dependent on the ConfigOject.handTypes being configured 
// the hand class looks at a player's hand and uses the rule processor class to determine
// what type of hand it is and attach the relevant data that is used to compare it to other
// hands
HandAnalysis.prototype = {
	handTypeConfig: ConfigObject.handTypes,
	analysisResultObj: {},
	playerHand: null,
	analyzeHand: function() {
		var processorResultObj = {};
		for (var i = 0; i < this.handTypeConfig.length; i++) {
			var handtyperesult = this.processHandType(this.handTypeConfig[i]);
			if(handtyperesult !== false) {
				processorResultObj = handtyperesult;
				processorResultObj.handMainClassification = this.handTypeConfig[i].name;
				processorResultObj.handMainClassValue = this.handTypeConfig[i].value;
				break;
			}
		};
		return processorResultObj; 
	},
	processHandType: function(configitem) {
		var rulePro =  new RuleProcessor({
			ruleList: configitem.rules,
			fullHand: this.playerHand
		});
		return rulePro.processAll();
	}
}

function HandAnalysis(obj) {
	if (obj) {
		for (key in obj) {
			this[key] = obj[key];
		}
	}
}

// TiebreakerProcessor takes a list of tied players and the list of tiebreaker rules that they
// share due to them being in the same HandType and processes the rules until either the tie
// is broken or no more rules are left
TieBreakerProcessor.prototype = {
	tieBreakerRules: [],
	tiedPlayersList: [],
	runTieCheck: function() {
		for (var i = 0; i < this.tieBreakerRules.length; i++) {
			this[this.tieBreakerRules[i]]();
			if(this.tiedPlayersList.length === 1) {
				return this.tiedPlayersList;
			}
		};
		return this.tiedPlayersList;
	},
	firstmatchvalue: function() {
		var highestMatchValue = 0;
		for (var i = 0; i < this.tiedPlayersList.length; i++) {
			if(this.tiedPlayersList[i].scorecard.additionalInfo.firstmatchvalue > highestMatchValue) {
				highestMatchValue = this.tiedPlayersList[i].scorecard.additionalInfo.firstmatchvalue;
			}
		};
		var indexesToRemove = [];
		for (var i = 0; i < this.tiedPlayersList.length; i++) {
			if(this.tiedPlayersList[i].scorecard.additionalInfo.firstmatchvalue < highestMatchValue) {
				indexesToRemove.push(i);
			}
		};
		this.removeIndexesFromPlayerList(indexesToRemove);
	},
	secondmatchvalue: function() {
		var highestMatchValue = 0;
		for (var i = 0; i < this.tiedPlayersList.length; i++) {
			if(this.tiedPlayersList[i].scorecard.additionalInfo.secondmatchvalue > highestMatchValue) {
				highestMatchValue = this.tiedPlayersList[i].scorecard.additionalInfo.secondmatchvalue;
			}
		};
		var indexesToRemove = [];
		for (var i = 0; i < this.tiedPlayersList.length; i++) {
			if(this.tiedPlayersList[i].scorecard.additionalInfo.secondmatchvalue < highestMatchValue) {
				indexesToRemove.push(indexOf(this.tiedPlayersList[i]));
			}
		};
		this.removeIndexesFromPlayerList(indexesToRemove);
	},
	highcard: function() {
		var highestvalue = 0;
		var indexesToRemove = [];
		for (var i = 0; i < this.tiedPlayersList.length; i++) {
			if(this.tiedPlayersList[i].scorecard.additionalInfo.highcard[0] > highestvalue) {
				highestvalue = this.tiedPlayersList[i].scorecard.additionalInfo.highcard[0]
			}
		};
		for (var i = 0; i < this.tiedPlayersList.length; i++) {
			if(this.tiedPlayersList[i].scorecard.additionalInfo.highcard[0] < highestvalue) {
				indexesToRemove.push(i);
			} 
		};
		if (this.removeIndexesFromPlayerList(indexesToRemove) === 1) {
			return;
		} else {
			for (var i = 0; i < this.tiedPlayersList.length; i++) {
				this.tiedPlayersList[i].scorecard.additionalInfo.highcard.splice(0, 1);
			};
			this.highcard();
		}

	},
	extrapair: function() {
		// check if they have an extra pair
		var indexesToRemove = [];
		var doesAnyoneHaveExtraPair = false;
		for (var i = 0; i < this.tiedPlayersList.length; i++) {
			if(typeof this.tiedPlayersList[i].scorecard.additionalInfo.extrapair === "undefined") {
				indexesToRemove.push(i);
			} else if(this.tiedPlayersList[i].scorecard.additionalInfo.extrapair === true) {
				doesAnyoneHaveExtraPair = true;
			}
		};
		if(doesAnyoneHaveExtraPair === true)
			this.removeIndexesFromPlayerList(indexesToRemove);
	},
	kicker: function() {
		var highestvalue = 0;
		var indexesToRemove = [];
		for (var i = 0; i < this.tiedPlayersList.length; i++) {
			if(this.tiedPlayersList[i].scorecard.additionalInfo.kicker[0] > highestvalue) {
				highestvalue = this.tiedPlayersList[i].scorecard.additionalInfo.kicker[0]
			}
		};
		for (var i = 0; i < this.tiedPlayersList.length; i++) {
			if(this.tiedPlayersList[i].scorecard.additionalInfo.kicker[0] < highestvalue) {
				indexesToRemove.push(i);
			} 
		};
		if (this.removeIndexesFromPlayerList(indexesToRemove) === 1) {
			return;
		} else {
			for (var i = 0; i < this.tiedPlayersList.length; i++) {
				this.tiedPlayersList[i].scorecard.additionalInfo.kicker.splice(0, 1);
			};
			this.kicker();
		}
	},
	removeIndexesFromPlayerList: function(indexesToRemove) {
		if (indexesToRemove.length > 0) {
			for (var i = 0; i < indexesToRemove.length; i++) {
				this.tiedPlayersList.splice(indexesToRemove[i], 1);
			};
		}
		return this.tiedPlayersList.length;
	}
}

function TieBreakerProcessor(obj) {
	if (obj) {
		for (key in obj) {
			this[key] = obj[key];
		}
	}
}
/* The PokerGame class is dependent on the ConfigOject.handTypes being configured */
// The poker game class organizes the application, takes in a list of player's hands
// and returns the winner(s) as an object that contains relavent information classifying the
// winning hand
PokerGame.prototype = {
	playersHandsInput: [],
	playersScoreCards: [],
	bestHandTypePlayerList: [],
	handTypeWinnerValue: null,
	handTypeWinnerTiebreakerArray: null,
	numberOfHandTypes: ConfigObject.handTypes.length,
	runGame: function() {
		for (var i = 0; i < this.playersHandsInput.length; i++) {
			this.analyzeEachHand(this.playersHandsInput[i]);
		};
		this.checkWhoHasEachHandType();
		return this.isThereATie();
	},
	analyzeEachHand: function(playerandhand) {
		var handAnaObj = new HandAnalysis({
			playerHand: playerandhand.hand
		});
		var handAnalysis = handAnaObj.analyzeHand();
		this.playersScoreCards.push({name: playerandhand.name, scorecard: handAnalysis});
	},
	checkWhoHasEachHandType: function() {
		var counter = this.numberOfHandTypes; 
		while(counter > 0) {
			for (var i = 0; i < this.playersScoreCards.length; i++) {
				if(this.playersScoreCards[i].scorecard.handMainClassValue === counter) {
					this.bestHandTypePlayerList.push(this.playersScoreCards[i]);
				}
			};
			if(this.bestHandTypePlayerList.length > 0) {
				this.handTypeWinnerValue = counter;
				break;
			}
			counter --;
		}
	},
	isThereATie: function() {
		if(this.bestHandTypePlayerList.length > 1) {
			var tieProcessor = new TieBreakerProcessor({
				tieBreakerRules: this.getTieBreakerArray(),
				tiedPlayersList: this.bestHandTypePlayerList
			});
			return {
				winner: tieProcessor.runTieCheck()
			}
		} else {
			return {
				winner: this.bestHandTypePlayerList
			}
		}
	},
	getTieBreakerArray: function() {
		for (var i = 0; i < ConfigObject.handTypes.length; i++) {
			if(ConfigObject.handTypes[i].value === this.handTypeWinnerValue) {
				this.handTypeWinnerTiebreakerArray = ConfigObject.handTypes[i].tiebreakers;
				break;
			}
		};
		return this.handTypeWinnerTiebreakerArray;
	}

}

function PokerGame(obj) {
	if (obj) {
		for (key in obj) {
			this[key] = obj[key];
		}
	}
}

var poGame = new PokerGame({
	playersHandsInput: [
		{name: "Joe", hand: ["3H", "4H", "5H", "6H", "8H"]},
		{name: "Bob", hand: ["3C", "3D", "3S", "8C", "10D"]},
		{name: "Sally", hand: ["AC", "10C", "5C", "2S", "2C"]},
		{name: "Billy", hand: ["4D", "5D", "6D", "7D", "8D"]},
	]
});


var finalResult = poGame.runGame();
console.log("The winner(s) of the hand is:");
console.log(finalResult.winner);
