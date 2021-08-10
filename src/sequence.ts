import { randomizeArray } from "./utils";
import { SequenceArgument, SequenceConfig } from "./types";

export class Sequence<T> {
  values: Array<SequenceArgument<T>>;
  randomizedArray?: Array<SequenceArgument<T>>;
  config: SequenceConfig<T>;

  static defaultConfig: SequenceConfig<any> = {
    fallback: null,
    randomizeIfNotEnoughItems: false,
  };

  constructor(
    values: Array<SequenceArgument<T>> | SequenceArgument<T>,
    config?: Partial<SequenceConfig<T>>
  ) {
    this.config = {
      ...Sequence.defaultConfig,
      ...config,
    };
    this.values = Array.isArray(values) ? values : [values];
  }

  protected evaluateRandomized(index: number) {
    if (!this.randomizedArray) {
      this.randomizedArray = randomizeArray(this.values);
    }
    return this.randomizedArray[index];
  }

  protected evaluateNormal(index: number) {
    const valueIndex = index % this.values.length;
    return this.values[valueIndex];
  }

  evaluate(index: number, itemsToCreate: number) {
    const hasTooSmallCollection = itemsToCreate < this.values.length;
    if (hasTooSmallCollection && this.config.fallback) {
      return this.config.fallback;
    }

    const value = this.config.randomizeIfNotEnoughItems
      ? this.evaluateRandomized(index)
      : this.evaluateNormal(index);

    return typeof value === "function" ? (value as any)(index) : value;
  }
}

export const sequence = <T>(
  values: Array<SequenceArgument<T>> | SequenceArgument<T>,
  config?: Partial<SequenceConfig<T>>
) => new Sequence(values, config);
