(function() {

var assert = require('assert');
var Holdem = require('./holdem.js').Holdem;

assert.equal(Holdem.card(), undefined);
assert.equal(Holdem.card('2', 'spades'), 24);
assert.deepEqual(Holdem.card(24), {suit: 'spades', rank: '2'});
assert.equal(Holdem.card('A', 'diamonds'), 65537);
assert.deepEqual(Holdem.card(65537), {suit: 'diamonds', rank: 'A'});
assert(Holdem.card('2', 'spades') > Holdem.card('2', 'hearts'));
assert(Holdem.card('A', 'diamonds') > Holdem.card('2', 'spades'));
assert(Holdem.card('A', 'diamonds') > Holdem.card('K', 'spades'));

assert.deepEqual(Holdem.handInfo([24, 40, 72, 136, 264]), 'straigh_flush');
assert.deepEqual(Holdem.handInfo([17, 18, 20, 24, 40]), 'four_of_a_kind');
assert.deepEqual(Holdem.handInfo([17, 18, 20, 33, 34]), 'full_house');
assert.deepEqual(Holdem.handInfo([24, 72, 264, 1032, 4104]), 'flush');
assert.deepEqual(Holdem.handInfo([17, 34, 68, 136, 264]), 'straigh');
assert.deepEqual(Holdem.handInfo([17, 18, 20, 40, 72]), 'three_of_a_kind');
assert.deepEqual(Holdem.handInfo([17, 18, 33, 34, 65]), 'two_pair');
assert.deepEqual(Holdem.handInfo([17, 18, 33, 66, 132]), 'one_pair');

})();
