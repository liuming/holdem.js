(function() {

var Holdem = function() {};

Holdem.Game = function(id) {
  var self = this;
  var state = 0, pot = 0, players = [], currentPlayer;

  this.id = function() { return id; };
  this.pot = function() { return pot; };
  this.hasSmallBlind = function() { return state & 2 === 0 ? false : true; };
  this.hasBigBlind = function() { return state & 4 === 0 ? false : true; };
  this.allPlayers = function() { return players.slice(); };
  this.currentPlayer = function() { return currentPlayer; };

  this.addPlayer = function(player) {
    if (player instanceof Holdem.Player && players.indexOf(player) === -1) players.push(player);
    return self.allPlayers();
  };

  this.removePlayer = function(player) {
    var index = players.indexOf(player);
    if (player instanceof Holdem.Player && index !== -1) players.splice(index, 1);
    return self.allPlayers();
  };

  this.start = function() {
    if (players.length <= 2) throw "Not enought player";

    currentPlayer = players[0];
    state |= 1;
  };

  this.availableActions = function() {
    if (currentPlayer.isFolded()) return [];
    if (self.hasSmallBlind() === false) return ['small', 'fold'];
    if (self.hasBigBlind() === false) return ['big', 'fold'];

    return ['call', 'raise', 'fold'];
  };

  this.bet = function(amount) {
    currentPlayer.transfer(-1 * Math.abs(amount));
    pot += amount;
  };

  this.smallBlind = function(amount) {
    self.bet(amount);
    state |= 2;
  };

  this.bigBlind = function(amount) {
    self.bet(amount);
    state |= 4;
  };

  this.check = function() {
    nextPlayer();
  };

  this.call = function() {
  };

  this.raise = function(amount) {
  };

  this.fold = function() {
    currentPlayer.fold();
  };

  var nextPlayer = function() {
    var index = (players.indexOf(currentPlayer) + 1) % players.length;
    return currentPlayer = players[index];
  };

  id = id || Holdem.randomInt();
};

Holdem.Player = function(name) {
  var id, credits = 0, state = 0;

  this.id = function() { return id; };
  this.name = function() { return name; };
  this.credits = function() { return credits };
  this.isFolded = function() { return (state & 2) === 0 ? false : true ;};

  this.transfer = function(amount) { credits += amount };
  this.fold = function() { state |= 2 };

  id = id || Holdem.randomInt();
};

Holdem.card = function() {
  switch (typeof arguments[0]) {
    case 'number':
      return {suit: Holdem.suit[arguments[0] & 15], rank: Holdem.rank[arguments[0] & ~15] };
      break;
    case 'string':
      return Holdem.rank[arguments[0]] | Holdem.suit[arguments[1]];
      break;
  }
};

/*
 * Some parts of this function are not using loop to get higher performance.
 */

Holdem.hand = function(cards) {
  if (cards.length !== 7) throw "The amount of cards is incorrect, must be 7.";

  var self = arguments.callee;

  var handHash = cards[0] | cards[1] | cards[2] | cards[3] | cards[4] | cards[5] | cards[6];
  var suitsCount = 0, ranksCount = 0;
  suitsCount += (handHash & 1) >> 0;
  suitsCount += (handHash & 2) >> 1;
  suitsCount += (handHash & 4) >> 2;
  suitsCount += (handHash & 8) >> 3;
  ranksCount += (handHash & 16) >> 4;
  ranksCount += (handHash & 32) >> 5;
  ranksCount += (handHash & 64) >> 6;
  ranksCount += (handHash & 128) >> 7;
  ranksCount += (handHash & 256) >> 8;
  ranksCount += (handHash & 512) >> 9;
  ranksCount += (handHash & 1024) >> 10;
  ranksCount += (handHash & 2048) >> 11;
  ranksCount += (handHash & 4096) >> 12;
  ranksCount += (handHash & 8192) >> 13;
  ranksCount += (handHash & 16384) >> 14;
  ranksCount += (handHash & 32786) >> 15;
  ranksCount += (handHash & 65536) >> 16;

  var cardsByRank = cards.slice.sort(function(left,right) {return left < right ? -1 : 1});
  var cardsBySuit = cards.slice.sort(function(left,right) {return (left & 15) < (right & 15) ? -1 : 1});
  var sortedRanks = [], sortedSuits = [];
  sortedRanks[0] = cardsByRank[0] & ~15;
  sortedRanks[1] = cardsByRank[1] & ~15;
  sortedRanks[2] = cardsByRank[2] & ~15;
  sortedRanks[3] = cardsByRank[3] & ~15;
  sortedRanks[4] = cardsByRank[4] & ~15;
  sortedRanks[5] = cardsByRank[5] & ~15;
  sortedRanks[6] = cardsByRank[6] & ~15;
  sortedSuits[0] = cardsBySuit[0] & 15;
  sortedSuits[1] = cardsBySuit[1] & 15;
  sortedSuits[2] = cardsBySuit[2] & 15;
  sortedSuits[3] = cardsBySuit[3] & 15;
  sortedSuits[4] = cardsBySuit[4] & 15;
  sortedSuits[5] = cardsBySuit[5] & 15;
  sortedSuits[6] = cardsBySuit[6] & 15;

  if (false) {
  } else if (self.isStraight(sortedRanks) && self.isFlush(sortedSuits)) {
    return 'straight_flush';
  } else if (ranksCount === 2 || ( ranksCount >= 2 && ranksCount <= 4 && self.isFourOfAKind(sortedRanks))) {
    return 'four_of_a_kind';
  } else if ((ranksCount === 3 || ranksCount === 4) && self.isFullHouse(sortedRanks)) {
    return 'full_house';
  } else if (suitsCount <= 3 && self.isFlush(sortedSuits)) {
    return 'flush';
  } else if (ranksCount >= 5 && self.isStraight(sortedRanks)) {
    return 'straight';
  } else if ((ranksCount === 4 || ranksCount === 5) && self.isThreeOfAKind(sortedRanks)) {
    return 'three_of_a_kind';
  } else if ((ranksCount === 4 || ranksCount === 5) && self.isTwoPair(sortedRanks)) {
    return 'two_pair';
  } else if (ranksCount === 6) {
    return 'one_pair';
  } else {
    return 'high_cards';
  }
};

// The cards passed into the following functions must be sorted

Holdem.hand.isFourOfAKind = function(ranks) {
  return ranks[0] === ranks[3] ||
         ranks[1] === ranks[4] ||
         ranks[2] === ranks[5] ||
         ranks[3] === ranks[6] ||
         false;
};

Holdem.hand.isFullHouse = function(ranks) {
  return Holdem.hand.isThreeOfAKind(ranks) && (
         (ranks[0] === ranks[1] && ranks[1] !== ranks[2]) ||
         (ranks[1] === ranks[2] && ranks[1] !== ranks[0] && ranks[2] !== ranks[3]) ||
         (ranks[2] === ranks[3] && ranks[2] !== ranks[1] && ranks[3] !== ranks[4]) ||
         (ranks[3] === ranks[4] && ranks[3] !== ranks[2] && ranks[4] !== ranks[5]) ||
         (ranks[4] === ranks[5] && ranks[4] !== ranks[3] && ranks[5] !== ranks[6]) ||
         (ranks[5] === ranks[6] && ranks[5] !== ranks[4]) ||
         false);
};

Holdem.hand.isFlush = function(suits) {
  return suits[0] === suits[4] ||
         suits[1] === suits[5] ||
         suits[3] === suits[6] ||
         false;
};

Holdem.hand.isStraight = function(ranks) {
  return false ||
         (ranks[0] << 1 === ranks[1] && ranks[1] << 1 === ranks[2] &&
          ranks[2] << 1 === ranks[3] && ranks[3] << 1 === ranks[4]) ||
         (ranks[1] << 1 === ranks[2] && ranks[2] << 1 === ranks[3] &&
          ranks[3] << 1 === ranks[4] && ranks[4] << 1 === ranks[5]) ||
         (ranks[2] << 1 === ranks[3] && ranks[4] << 1 === ranks[5] &&
          ranks[5] << 1 === ranks[6] && ranks[6] << 1 === ranks[7]) ||
         false;
};

Holdem.hand.isThreeOfAKind = function(ranks) {
  return ranks[0] === ranks[2] ||
         ranks[1] === ranks[3] ||
         ranks[2] === ranks[4] ||
         ranks[3] === ranks[5] ||
         ranks[4] === ranks[6] ||
         false;
};

Holdem.hand.isTwoPair = function(cards) {
};

Holdem.suit = {
  'spades'   : 8,
  'hearts'   : 4,
  'clubs'    : 2,
  'diamonds' : 1,
  8: 'spades',
  4: 'hearts',
  2: 'clubs',
  1: 'diamonds',
};

Holdem.rank = {
  '2'  : 16,
  '3'  : 32,
  '4'  : 64,
  '5'  : 128,
  '6'  : 256,
  '7'  : 512,
  '8'  : 1024,
  '9'  : 2048,
  '10' : 4096,
  'J'  : 8192,
  'Q'  : 16384,
  'K'  : 32786,
  'A'  : 65536,
  16    : '2',
  32    : '3',
  64    : '4',
  128   : '5',
  256   : '6',
  512   : '7',
  1024  : '8',
  2048  : '9',
  4096  : '10',
  8192  : 'J',
  16384 : 'Q',
  32786 : 'K',
  65536 : 'A',
};

/*
Holdem.flush = {
  8: 'spades',
  4: 'hearts',
  2: 'clubs',
  1: 'diamonds',
};
*/

Holdem.hand.straight = {
  126976 : ['A', 'K', 'Q', 'J', '10'],
  63488  : ['K', 'Q', 'J', '10', '9'],
  31744  : ['Q', 'J', '10', '9', '8'],
  15872  : ['J', '10', '9', '8', '7'],
  7936   : ['10', '9', '8', '7', '6'],
  3968   : ['9', '8', '7', '6', '5' ],
  1984   : ['8', '7', '6', '5', '4' ],
  992    : ['7', '6', '5', '4', '3' ],
  496    : ['6', '5', '4', '3', '2' ],
  65776  : ['5', '4', '3', '2', 'A' ],
};

Holdem.hand.value = {
  'straight_flush'   : 8,
  'four_of_a_kind'  : 7,
  'full_house'      : 6,
  'flush'           : 5,
  'straight'         : 4,
  'three_of_a_kind' : 3,
  'two_pair'        : 2,
  'one_pair'        : 1,
  'high_cards'      : 0,
};

Holdem.randomInt = function() {
  return parseInt(Math.random() * 2147483647);
};

exports.Holdem = Holdem;

})();
