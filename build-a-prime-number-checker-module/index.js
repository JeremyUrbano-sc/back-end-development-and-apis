function isPrime(num) {
  if (!Number.isInteger(num) || num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0) return false;

  for (let i = 3; i * i <= num; i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

module.exports = { isPrime };