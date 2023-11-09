const options = {
  effect:['slide', 'fade', 'flip'],
  speed: ['.25', '1', '2'],
  auto: ['true', 'false'],
  repeat: ['0', '1', '2'],
  pause: ['0', '1', '2']
};

function logCombinations(options) {
  const combinations = [];
  const keys = Object.keys(options);

  function generateCombination(currentCombination, remainingKeys) {
    if (remainingKeys.length === 0) {
      combinations.push(currentCombination);
      return;
    }

    const key = remainingKeys[0];
    const values = options[key];

    for (const value of values) {
      const newCombination = currentCombination.concat([value]);
      const newRemainingKeys = remainingKeys.slice(1);
      generateCombination(newCombination, newRemainingKeys);
    }
  }

  generateCombination([], keys);
  return combinations;
}

// const combos = logCombinations(options);
// console.log(combos);
