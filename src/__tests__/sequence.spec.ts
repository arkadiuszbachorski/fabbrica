import { Factory } from "../factory";
import { sequence } from "../sequence";

class ResourceFactory extends Factory<{ id: number }> {
  define = {
    id: 0,
  };
}

describe("sequence", () => {
  it("should override item values in sequence", () => {
    const resources = new ResourceFactory()
      .override({
        id: sequence([5, 0, 1]),
      })
      .create(5);

    expect(resources).toEqual([
      { id: 5 },
      { id: 0 },
      { id: 1 },
      { id: 5 },
      { id: 0 },
    ]);
  });

  it("should apply first item of sequence if only one resource is generated", () => {
    const resource = new ResourceFactory()
      .override({
        id: sequence([10, 2]),
      })
      .create();

    expect(resource).toEqual({ id: 10 });
  });

  it("should utilize fallback if length of generated items is lesser than sequence length", () => {
    const resources = new ResourceFactory()
      .override({
        id: sequence([5, 0, 1], { fallback: 100 }),
      })
      .create(2);

    expect(resources).toEqual([{ id: 100 }, { id: 100 }]);
  });

  it("should randomize sequence if length of generated items is lesser than sequence length", () => {
    const mock = jest.spyOn(global.Math, "random").mockReset();

    new ResourceFactory()
      .override({
        id: sequence([5, 0, 1, 5], {
          randomizeIfNotEnoughItems: true,
        }),
      })
      .create(3);

    expect(mock).toHaveBeenCalledTimes(3);
  });

  it("should pass index to sequence if function", () => {
    const resources = new ResourceFactory()
      .override({
        id: sequence((index) => index),
      })
      .create(3);

    expect(resources).toEqual([{ id: 0 }, { id: 1 }, { id: 2 }]);
  });

  it("should pass index to sequence if array of functions", () => {
    const resources = new ResourceFactory()
      .override({
        id: sequence([(index) => index, (index) => index * 100, -5]),
      })
      .create(3);

    expect(resources).toEqual([{ id: 0 }, { id: 100 }, { id: -5 }]);
  });
});
