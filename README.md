# pokergamelibrary
This is a library written in raw javascript that can be used to process the winner in a poker hand. This project demonstrates my ability to write modular, well structured raw javascript. The setup is to take in a number of individuals' poker hands (in the format "5C", "AD", "3H", "2H", "KD") process the hands based on the configured rules and return which hand is the winner.

The project is configured to process five different types of poker hands (a subset of the conventional poker hands): Four of a Kind, Flush, Three of a Kind, Pair, and High Card, ordered according to value and to be able to break ties based on predetermined rules. The library has a rule processing engine and a tiebreaking engine, and the rules and tiebreakers that correspond to each hand are definied in the ConfigObject.HandType object. In order to kick off the project you simply need to to create an instance the PokerGame object and pass in hand objects for each of the individual hands that would be playing (this is done at the bottom of pokergame.js.
