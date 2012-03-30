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

  //Assign an id if it's not passed in
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
      return {suit: Holdem.suit[arguments[0] & 15], rank: Holdem.rank[arguments[0] >> 4 << 4] };
      break;
    case 'string':
      return Holdem.rank[arguments[0]] | Holdem.suit[arguments[1]];
      break;
  }
};

Holdem.handInfo = function(cards) {
  //if (cards.length !== 7) throw "Number of cards is incorrect, must be 7.";

  var handBits = cards[0] | cards[1] | cards[2] | cards[3] | cards[4] | cards[5] | cards[6]; //Not to use loop for higher performance
  var suitsCount = 0, ranksCount = 0, suitsBits = handBits & 15, ranksBits = handBits >> 4 << 4;

  //Not to use loop for higher performance
  suitsCount += (handBits & 1) >> 0;
  suitsCount += (handBits & 2) >> 1;
  suitsCount += (handBits & 4) >> 2;
  suitsCount += (handBits & 8) >> 3;
  ranksCount += (handBits & 16) >> 4;
  ranksCount += (handBits & 32) >> 5;
  ranksCount += (handBits & 64) >> 6;
  ranksCount += (handBits & 128) >> 7;
  ranksCount += (handBits & 256) >> 8;
  ranksCount += (handBits & 512) >> 9;
  ranksCount += (handBits & 1024) >> 10;
  ranksCount += (handBits & 2048) >> 11;
  ranksCount += (handBits & 4096) >> 12;
  ranksCount += (handBits & 8192) >> 13;
  ranksCount += (handBits & 16384) >> 14;
  ranksCount += (handBits & 32786) >> 15;
  ranksCount += (handBits & 65536) >> 16;

  //Detect the characteristic of a hand
  //FIXME: this is for 5 cards game, not 7
  if (false) {
  } else if (ranksCount === 4) {
    return 'one_pair';
  } else if (ranksCount === 3) {
    return (cards[0] & cards[1] & cards[2]) >> 4 << 4 !== 0 ||
           (cards[1] & cards[2] & cards[3]) >> 4 << 4 !== 0 ||
           (cards[2] & cards[3] & cards[4]) >> 4 << 4 !== 0
           ? 'three_of_a_kind' : 'two_pair';
  } else if (suitsCount > 1 && ranksCount === 5 && Holdem.straigh[ranksBits]) {
    return 'straigh';
  } else if (suitsCount === 1 && ranksCount === 5) {
    return Holdem.straigh[ranksBits] ? 'straigh_flush' : 'flush';
  } else if (ranksCount === 2) {
    cards.sort(function(left,right) {return left < right ? -1 : 1});
    return (cards[1] & cards[2]) >> 4 << 4 !== 0 &&
           (cards[2] & cards[3]) >> 4 << 4 !== 0
           ? 'four_of_a_kind' : 'full_house';
  } else {
    return 'high_cards';
  }
};

Holdem.randomInt = function() {
  return parseInt(Math.random() * 2147483647);
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

Holdem.straigh = {
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

Holdem.handValue = {
  'straigh_flush'   : 8,
  'four_of_a_kind'  : 7,
  'full_house'      : 6,
  'flush'           : 5,
  'straigh'         : 4,
  'three_of_a_kind' : 3,
  'two_pair'        : 2,
  'one_pair'        : 1,
  'high_cards'      : 0,
};



exports.Holdem = Holdem;

})();
