(function() {

var Holdem = function() {};

Holdem.Game = function(options) {
  var self = this;

  this.state = 0;
  this.pot = 0;
  this.players = [];
  this.currentPlayer = undefined;
  this.minimumBet = 0;
  this.id = Holdem.randomInt();
};

Holdem.Game.prototype = {

  addPlayer: function(player) {
    if (player instanceof Holdem.Player && this.players.indexOf(player) === -1) this.players.push(player);
    return this.players;
  },

  removePlayer: function(player) {
    var index = this.players.indexOf(player);
    if (player instanceof Holdem.Player && index !== -1) this.players.splice(index, 1);
    return this.players;
  },

  nextPlayer: function() {
    var index = (this.players.indexOf(this.currentPlayer) + 1) % this.players.length;
    return this.currentPlayer = this.players[index];
  },

  start: function() {
    if (this.players.length < 2) throw "NOT_ENOUGH_PLAYER";

    this.currentPlayer = this.players[0];
    this.state |= 1;
  },

  legalActions: function() {
    if (this.currentPlayer.isFolded()) return [];
    if (this.hasSmallBlind() === false) return ['small', 'fold'];
    if (this.hasBigBlind() === false) return ['big', 'fold'];

    return ['call', 'raise', 'fold'];
  },

  isLegalAction: function(action) {
    return this.legalActions().indexOf(action) !== -1;
  },

  bet: function(amount) {
    amount = Math.abs(amount);
    if(amount < this.minimumBet) throw "AMOUNT_TOO_SMALL";
    this.currentPlayer.transfer(-1 * amount);
    this.pot += amount;
    return amount;
  },

  smallBlind: function(amount) {
    if (!this.isLegalAction('small')) throw "ACTION_DENIED";
    this.minimumBet = this.bet(amount);
    this.state |= 2;
    return amount;
  },

  bigBlind: function(amount) {
    if (!this.isLegalAction('big')) throw "ACTION_DENIED";
    this.minimumBet = this.bet(amount);
    this.state |= 4;
    return amount;
  },

  hasSmallBlind: function() {
    return (this.state & 2) === 0 ? false : true;
  },

  hasBigBlind: function() {
    return (this.state & 4) === 0 ? false : true;
  },

  check: function() {
    if (!this.isLegalAction('check')) throw "ACTION_DENIED";
  },

  call: function() {
    if (!this.isLegalAction('call')) throw "ACTION_DENIED";
    return this.bet(this.minimumBet);
  },

  raise: function(amount) {
    if (amount <= this.minimumBet) throw "AMOUNT_TOO_SMALL";
    return this.bet(amount);
  },

  fold: function() {
    this.currentPlayer.fold();
  },

};

Holdem.Player = function(name) {
  this.id = Holdem.randomInt();
  this.name = name;
  this.credits = 0;
  this.state = 0;
};

Holdem.Player.prototype = {
  isFolded: function() {
    return (this.state & 2) === 0 ? false : true;
  },
  transfer: function(amount) {
    this.credits += amount;
  },
  fold: function() {
    this.state |= 2;
  }
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

  var cardsByRank = cards.slice().sort(function(left,right) {return left < right ? -1 : 1});
  var cardsBySuit = cards.slice().sort(function(left,right) {return (left & 15) < (right & 15) ? -1 : 1});
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

Holdem.hand.isTwoPair = function(ranks) {
  return (ranks[0] === ranks[1] && ranks[2] === ranks[3]) ||
         (ranks[1] === ranks[2] && ranks[3] === ranks[4]) ||
         (ranks[2] === ranks[3] && ranks[4] === ranks[5]) ||
         (ranks[3] === ranks[4] && ranks[5] === ranks[6]) ||
         false;
};

Holdem.shuffle = function(deck) {
  deck = deck.slice();
  var times = 0;
  while(times++ < 52) {
    deck.splice(parseInt(Math.random() * 52), 0, deck.shift());
  }
  return deck;
};

Holdem.randomInt = function(range) {
  return parseInt(Math.random() * (range | 2147483647));
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

Holdem.deck = [ 17, 18, 20, 24, 33, 34, 36, 40, 65, 66, 68, 72, 129, 130, 132, 136, 257, 258, 260, 264, 513, 514, 516, 520, 1025, 1026, 1028, 1032, 2049, 2050, 2052, 2056, 4097, 4098, 4100, 4104, 8193, 8194, 8196, 8200, 16385, 16386, 16388, 16392, 32769, 32770, 32772, 32776, 65537, 65538, 65540, 65544 ];

Holdem.hand.value = {
  'straight_flush'  : 8,
  'four_of_a_kind'  : 7,
  'full_house'      : 6,
  'flush'           : 5,
  'straight'        : 4,
  'three_of_a_kind' : 3,
  'two_pair'        : 2,
  'one_pair'        : 1,
  'high_cards'      : 0,
};


exports.Holdem = Holdem;

})();
