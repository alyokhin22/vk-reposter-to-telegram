export const asyncSleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const randomNumber = (min:number, max:number) =>
  Math.round(Math.random() * (max-min) + min)
