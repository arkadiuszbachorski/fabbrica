import { Sequence } from "./sequence";
import { Chance } from "./chance";
import { Factory } from "./factory";
import { ManySubFactories } from "./manySubFactories";

export type SequenceConfig<T> = {
  fallback: T | null;
  randomizeIfNotEnoughItems: boolean;
};

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type DefinitionType<T> = {
  [KEY in keyof T]:
    | (() => T[KEY])
    | T[KEY]
    | Sequence<T[KEY]>
    | Chance<T[KEY]>
    | ManySubFactories<
        ArrayElement<T[KEY] extends readonly unknown[] ? T[KEY] : never>
      >
    | { new (): Factory<T[KEY]> };
};

export type Override<T> =
  | Partial<DefinitionType<T>>
  | (() => Partial<DefinitionType<T>>);

export type SequenceArgument<T> = T | ((index: number) => T);
