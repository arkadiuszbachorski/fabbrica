import { Factory } from "../factory";
import { many } from "../manySubFactories";

type Nested = { id: number };
type Resource = { id: number; children: Nested[] };

class NestedFactory extends Factory<Nested> {
  define = {
    id: 0,
  };
}

class ResourceFactory extends Factory<Resource> {
  define = {
    id: 0,
    children: many(NestedFactory),
  };
}

describe("manySubFactories", () => {
  it("should return array of nested within standard 1-10 range", () => {
    const resource = new ResourceFactory().create();
    const length = resource.children.length;

    expect(length).toBeGreaterThanOrEqual(1);
    expect(length).toBeLessThanOrEqual(10);
  });

  it("should return allow to pass custom range to many", () => {
    const resource = new ResourceFactory()
      .override({
        children: many(NestedFactory, { min: 25, max: 25 }),
      })
      .create();
    const length = resource.children.length;

    expect(length).toBe(25);
  });
});
