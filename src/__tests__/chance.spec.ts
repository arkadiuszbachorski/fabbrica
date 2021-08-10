import { chance } from "../chance";
import { Factory } from "../factory";

class ResourceFactory extends Factory<{ id: number }> {
  define = {
    id: 0,
  };
}

describe("chance", () => {
  it("should return every value provided in chance exact number of times", () => {
    const resources = new ResourceFactory()
      .override({
        id: chance([
          [1, 0],
          [2, 100],
          [7, 1],
        ]),
      })
      .create(10_000);

    const sum = resources.reduce((acc, item) => acc + item.id, 0);

    expect(sum).toEqual((1 * 0 + 2 * 100 + 7 * 1) * 1_000);
  });
});
