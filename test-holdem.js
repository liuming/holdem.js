(function() {

var assert = require('assert');
var Holdem = require('./holdem.js').Holdem;

var players = [], game = new Holdem.Game();

var index = 0;
while(index++ < 5) {
  players.push(new Holdem.Player('Player' + index));
};

//Adding players
assert.deepEqual(game.addPlayer(players[0]), [players[0]]);
assert.deepEqual(game.addPlayer(players[0]), [players[0]]);
assert.deepEqual(game.addPlayer(players[1]), [players[0], players[1]]);
assert.deepEqual(game.removePlayer(players[0]), [players[1]]);
assert.deepEqual(game.addPlayer(players[2]), [players[1], players[2]]);
assert.deepEqual(game.addPlayer(players[3]), [players[1], players[2], players[3]]);
assert.deepEqual(game.addPlayer(players[4]), [players[1], players[2], players[3], players[4]]);

//Run the game flow
game.start();
assert.equal(game.hasSmallBlind(), false);
assert.deepEqual(game.legalActions(), ['small', 'fold']);
assert.equal(game.currentPlayer, players[1]);
assert.equal(game.smallBlind(5), 5);
assert.ok(game.hasSmallBlind());
assert.equal(game.nextPlayer(), players[2]);
assert.deepEqual(game.legalActions(), ['big', 'fold']);
assert.equal(game.bigBlind(10), 10);
assert.equal(game.nextPlayer(), players[3]);
assert.deepEqual(game.legalActions(), ['call', 'raise', 'fold']);
assert.equal(game.call(), 10);
assert.equal(game.nextPlayer(), players[4]);
assert.deepEqual(game.legalActions(), ['call', 'raise', 'fold']);
assert.equal(game.raise(20), 20);
assert.equal(game.nextPlayer(), players[1]);

//Card to readable conversion
assert.equal(Holdem.card(), undefined);
assert.equal(Holdem.card('2', 'spades'), 24);
assert.deepEqual(Holdem.card(24), {suit: 'spades', rank: '2'});
assert.equal(Holdem.card('A', 'diamonds'), 65537);
assert.deepEqual(Holdem.card(65537), {suit: 'diamonds', rank: 'A'});
assert.ok(Holdem.card('2', 'spades') > Holdem.card('2', 'hearts'));
assert.ok(Holdem.card('A', 'diamonds') > Holdem.card('2', 'spades'));
assert.ok(Holdem.card('A', 'diamonds') > Holdem.card('K', 'spades'));

//Hand detection
assert.equal(Holdem.hand.isFourOfAKind([16, 16, 16, 16, 32, 64, 128]), true);
assert.equal(Holdem.hand.isFullHouse([16, 16, 16, 32, 32, 64, 128, 256]), true);
assert.equal(Holdem.hand.isFullHouse([16, 16, 16, 32, 64, 128, 256, 512]), false);
assert.equal(Holdem.hand.isFlush([1, 1, 1, 1, 1, 2, 4, 8]), true);
assert.equal(Holdem.hand.isStraight([16, 32, 64, 128, 256, 512, 1024]), true);
assert.equal(Holdem.hand.isTwoPair([16, 16, 32, 32, 64, 128, 256]), true);

assert.deepEqual(Holdem.hand([24, 40, 72, 136, 264, 1032, 2056]), 'straight_flush');
assert.deepEqual(Holdem.hand([17, 18, 20, 24, 40, 132, 516]), 'four_of_a_kind');
assert.deepEqual(Holdem.hand([17, 18, 20, 33, 34, 72, 264]), 'full_house');
assert.deepEqual(Holdem.hand([24, 72, 264, 1032, 4104, 17, 34]), 'flush');
assert.deepEqual(Holdem.hand([17, 34, 68, 136, 264, 1028, 4104]), 'straight');
assert.deepEqual(Holdem.hand([17, 18, 20, 40, 72, 264, 1032]), 'three_of_a_kind');
assert.deepEqual(Holdem.hand([17, 18, 33, 34, 65, 258, 1028]), 'two_pair');
assert.deepEqual(Holdem.hand([17, 18, 33, 66, 132, 520, 2052]), 'one_pair');

//Helper functions
assert.notEqual(Holdem.shuffle(Holdem.deck), Holdem.deck);
assert.notDeepEqual(Holdem.shuffle(Holdem.deck), Holdem.deck);

})();
