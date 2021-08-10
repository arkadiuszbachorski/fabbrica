import { DefinitionType, Override } from "./types";
import { objectMap, times } from "./utils";
import { Sequence } from "./sequence";
import { Chance } from "./chance";
import { ManySubFactories } from "./manySubFactories";

export abstract class Factory<TYPE> {
  abstract define: DefinitionType<TYPE>;

  protected evaluateDefinition(index: number, itemsToCreate: number): TYPE {
    return objectMap(this.define, (value) => {
      if (value instanceof Sequence) {
        return value.evaluate(index, itemsToCreate);
      }
      if (value instanceof Chance) {
        return value.evaluate(index);
      }
      if (value instanceof ManySubFactories) {
        return value.evaluate();
      }
      try {
        const factory = new (value as any)() as Factory<any>;
        return factory.create();
      } catch (e) {}
      if (typeof value === "function") {
        return value();
      }

      return value;
    });
  }

  override(overrides: Override<TYPE>) {
    const newDefine = typeof overrides === "function" ? overrides() : overrides;
    this.define = { ...this.define, ...newDefine };
    return this;
  }

  pick<KEYS extends keyof TYPE>(
    keys: Array<KEYS>
  ): Factory<Pick<TYPE, Exclude<keyof TYPE, Exclude<keyof TYPE, KEYS>>>> {
    const pickedEntries = Object.entries(this.define).filter(([key]) =>
      keys.includes(key as any)
    );
    this.define = Object.fromEntries(pickedEntries) as any;
    return this;
  }

  omit<KEYS extends keyof TYPE>(keys: Array<KEYS>): Factory<Omit<TYPE, KEYS>> {
    const pickedEntries = Object.entries(this.define).filter(
      ([key]) => !keys.includes(key as any)
    );
    this.define = Object.fromEntries(pickedEntries) as any;
    return this;
  }

  create(): TYPE;
  create(
    number: number,
    handler?: (index: number, factory: this) => TYPE
  ): TYPE[];
  create(
    number?: number,
    handler?: (index: number, factory: this) => TYPE
  ): any {
    if (typeof number === "number") {
      return times((index) => {
        if (handler !== undefined) {
          return handler(index, this);
        } else {
          return this.evaluateDefinition(index, number);
        }
      }, number);
    }

    return this.evaluateDefinition(0, 1);
  }
}