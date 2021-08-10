import { Factory } from "./factory";
import { randomInteger } from "./utils";

export class ManySubFactories<T> {
  object: Factory<T>;
  config: { min: number; max: number };

  static defaultConfig: ManySubFactories<any>["config"] = {
    min: 1,
    max: 10,
  };

  constructor(
    Ctor: {
      new (): Factory<T>;
    },
    config?: { min?: number; max?: number }
  ) {
    this.object = new Ctor();
    this.config = {
      ...ManySubFactories.defaultConfig,
      ...config,
    };
  }

  evaluate(): T[] {
    return this.object.create(randomInteger(this.config.min, this.config.max));
  }
}

export const many = <T>(
  Ctor: {
    new (): Factory<T>;
  },
  config?: { min?: number; max?: number }
) => new ManySubFactories(Ctor, config);
