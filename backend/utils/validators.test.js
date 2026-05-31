// Minimal smoke test runnable via `node validators.test.js`.
// Kept dependency-free to avoid pulling jest/mocha into a backend that
// doesn't have a test runner configured yet.
const assert = require("node:assert/strict");
const {
  isEthAddress,
  isBytes32,
  isPositiveNumber,
  isNonNegativeInteger,
  isNonEmptyString,
} = require("./validators");

assert.equal(isEthAddress("0x0000000000000000000000000000000000000000"), true);
assert.equal(isEthAddress("0xabc"), false);
assert.equal(isEthAddress(null), false);

assert.equal(
  isBytes32("0x" + "a".repeat(64)),
  true
);
assert.equal(isBytes32("0xabc"), false);

assert.equal(isPositiveNumber(1), true);
assert.equal(isPositiveNumber("2.5"), true);
assert.equal(isPositiveNumber(0), false);
assert.equal(isPositiveNumber(-1), false);
assert.equal(isPositiveNumber("abc"), false);

assert.equal(isNonNegativeInteger(0), true);
assert.equal(isNonNegativeInteger(5), true);
assert.equal(isNonNegativeInteger(-1), false);
assert.equal(isNonNegativeInteger(1.5), false);

assert.equal(isNonEmptyString("x"), true);
assert.equal(isNonEmptyString("  "), false);
assert.equal(isNonEmptyString(""), false);
assert.equal(isNonEmptyString(undefined), false);

console.log("validators ok");
