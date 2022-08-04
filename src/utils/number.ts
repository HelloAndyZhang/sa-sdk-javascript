const getRandomBasic = (function () {
  const today = new Date()
  let seed = today.getTime()

  function rnd() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280.0
  }
  return function rand(number: number) {
    return Math.ceil(rnd() * number)
  }
})()

export const getRandom = () => {
  if (typeof Uint32Array === 'function') {
    const crypto =
      (typeof window !== 'undefined' && (window.crypto || window.msCrypto)) ||
      (typeof self !== 'undefined' && self.crypto)
    if (crypto) {
      const typedArray = new Uint32Array(1)
      const randomNumber = crypto.getRandomValues(typedArray)[0]
      const integerLimit = Math.pow(2, 32)
      return randomNumber / integerLimit
    }
  }
  return getRandomBasic(10000000000000000000) / 10000000000000000000
}
