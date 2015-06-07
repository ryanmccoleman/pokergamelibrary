# pokergamelibrary
This is a library written in raw javascript that can be used to process the winner in a poker hand. This project demonstrates my ability to write modular, well structured raw javascript. The setup is to take in a number of individuals' poker hands (in the format "5C", "AD", "3H", "2H", "KD") process the hands based on the configured rules and return which hand is the winner.

The project is configured to process five different types of poker hands (a subset of the conventional poker hands): Four of a Kind, Flush, Three of a Kind, Pair, and High Card, ordered according to value and to be able to break ties based on predetermined rules. The library has a rule processing engine and a tiebreaking engine, and the rules and tiebreakers that correspond to each hand are definied in the ConfigObject.HandType object. In order to kick off the project you simply need to to create an instance the PokerGame object and pass in hand objects for each of the individual hands that would be playing (this is done at the bottom of pokergame.js.

So if you wanted to add a new hand type (e.g. a Straight) to be processed you would need to add a new object to the ConfigObjects hand type object, assign it a value corresponding to the relative value of the hand type, make reference to the rules (from the RuleProcessor object) that need to be processed, in order that they are to be processed, and add the tiebreakers (from the TieBreakerProcessor object) in the order that they are to be processed. The individual rules and tiebreakers correspond to methods in their respective objects, so if it is a new rule or tiebreaker, a method with a name that corresponds to the tiebreaker or rule name will have to be created in order that the rule gets processed accordingly.
