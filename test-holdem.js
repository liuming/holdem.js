(function() {

var assert = require('assert');
var Holdem = require('./holdem.js').Holdem;

var players = [], game = new Holdem.Game();

var index = 0;
while(index++ < 4) {
  players.push(new Holdem.Player('Player' + index));
};

assert.deepEqual(game.addPlayer(players[0]), [players[0]]);
assert.deepEqual(game.addPlayer(players[0]), [players[0]]);
assert.deepEqual(game.addPlayer(players[1]), [players[0], players[1]]);
assert.deepEqual(game.removePlayer(players[0]), [players[1]]);
assert.deepEqual(game.addPlayer(players[2]), [players[1], players[2]]);
assert.deepEqual(game.addPlayer(players[3]), [players[1], players[2], players[3]]);

game.start();
assert.equal(game.hasSmallBlind(), false);
assert.ok(game.legalAction('small'));
assert.ok(game.legalAction('fold'));
assert.equal(game.currentPlayer, players[1]);
assert.equal(game.smallBlind(5));
game.nextPlayer();
assert.equal(game.currentPlayer, players[2]);

assert.equal(Holdem.card(), undefined);
assert.equal(Holdem.card('2', 'spades'), 24);
assert.deepEqual(Holdem.card(24), {suit: 'spades', rank: '2'});
assert.equal(Holdem.card('A', 'diamonds'), 65537);
assert.deepEqual(Holdem.card(65537), {suit: 'diamonds', rank: 'A'});
assert(Holdem.card('2', 'spades') > Holdem.card('2', 'hearts'));
assert(Holdem.card('A', 'diamonds') > Holdem.card('2', 'spades'));
assert(Holdem.card('A', 'diamonds') > Holdem.card('K', 'spades'));

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

assert.notEqual(Holdem.shuffle(Holdem.deck), Holdem.deck);
assert.notDeepEqual(Holdem.shuffle(Holdem.deck), Holdem.deck);

})();
