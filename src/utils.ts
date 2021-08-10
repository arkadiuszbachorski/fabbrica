export const times = <T>(callback: (index: number) => T, number: number): T[] =>
  new Array(number).fill(undefined).map((_, index) => {
    return callback(index);
  });

export const objectMap = <In, Out = In>(
  object: In,
  callback: (x: In[keyof In & keyof Out]) => Out[keyof In & keyof Out]
): Out => {
  const entries = Object.entries(object).map(([key, value]) => {
    return [key, callback(value)];
  });
  return Object.fromEntries(entries);
};

export const randomInteger = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const arraySwap = <T>(array: T[], index: number, secondIndex: number) => {
  [array[index], array[secondIndex]] = [array[secondIndex], array[index]];
};

export const randomizeArray = <T>(input: T[]): T[] => {
  const array = [...input];

  for (let index = array.length - 1; index > 0; index--) {
    const second = randomInteger(0, index);
    arraySwap(array, index, second);
  }

  return array;
};
