import { randomizeArray, times } from "./utils";

export class Chance<T> {
  values: Array<T>;

  constructor(values: Array<[number, T]>) {
    const flatValues = values
      .map(([numberOfItems, value]) => {
        return times(() => value, numberOfItems);
      })
      .flat();

    this.values = randomizeArray(flatValues);
  }

  evaluate(index: number) {
    const valueIndex = index % this.values.length;
    return this.values[valueIndex];
  }
}

export const chance = <T>(values: Array<[number, T]>) => new Chance(values);

export const simpleChanceCreator = <T, E>(
  value: T,
  secondValueChance = 80,
  secondValue: E
) => {
  const safeChance = Math.abs(Math.floor(secondValueChance));
  if (safeChance === 0 || safeChance >= 100) {
    throw new Error("Chance must be integer between 1 and 99");
  }

  return new Chance<T | E>([
    [safeChance, value],
    [100 - safeChance, secondValue],
  ]);
};

export const orNull = <T>(value: T, chance = 80) =>
  simpleChanceCreator(value, chance, null);

export const orUndefined = <T>(value: T, chance = 80) =>
  simpleChanceCreator(value, chance, undefined);
