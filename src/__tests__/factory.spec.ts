import { Factory } from "../factory";

describe("factory", () => {
  class ResourceFactory extends Factory<{ id: number }> {
    define = {
      id: 0,
    };
  }

  describe("simple model", () => {
    type Person = {
      name: string;
      age: number;
    };

    class PersonFactory extends Factory<Person> {
      define = {
        name: "Mark",
        age: () => Math.random(),
      };
    }

    it("generates object matching the interface and with lazy-evaluated values", async () => {
      const person = new PersonFactory().create();
      expect(person.name).toBe("Mark");
      expect(person.age).toBeLessThan(1);
      expect(person.age).toBeGreaterThanOrEqual(0);
    });

    it("allows to override values", () => {
      const oldPerson = new PersonFactory()
        .override({
          age: 99,
          name: () => "Arthur",
        })
        .create();

      expect(oldPerson).toEqual({
        name: "Arthur",
        age: 99,
      });
    });
  });

  describe("nested models", () => {
    type Dog = {
      name: string;
    };
    class DogFactory extends Factory<Dog> {
      define = {
        name: "Cooper",
      };
    }

    type PersonWithDog = {
      name: string;
      age: number;
      dog: Dog;
    };

    class PersonWithDogFactory extends Factory<PersonWithDog> {
      define = {
        name: "Ipsum",
        age: () => Math.random(),
        dog: DogFactory,
      };
    }

    it("allows to simply nest factories", () => {
      const personWithDog = new PersonWithDogFactory().create();
      expect(personWithDog.dog).toEqual({
        name: "Cooper",
      });
      expect(personWithDog.name).toBe("Ipsum");
    });
  });

  describe("states", () => {
    type Person = {
      id: null | string;
      name: string;
    };

    class PersonFactory extends Factory<Person> {
      define = {
        id: "default",
        name: "Foo Bar",
      };

      unassigned() {
        return this.override({
          id: null,
        });
      }

      assigned() {
        return this.override({
          id: "uuid",
        });
      }

      specified(name = "John") {
        return this.override({
          name: `${name} Doe`,
        });
      }
    }

    describe("choose state", () => {
      it("creates assigned person", () => {
        const person = new PersonFactory().assigned().create();
        expect(person.id).toBe("uuid");
      });

      it("creates unassigned person", () => {
        const person = new PersonFactory().unassigned().create();
        expect(person.id).toBe(null);
      });
    });

    it("returns default values when no state chosen", () => {
      const person = new PersonFactory().create();
      expect(person).toEqual({
        id: "default",
        name: "Foo Bar",
      });
    });

    it("allows to override state values", () => {
      const person = new PersonFactory()
        .override({
          id: "over",
        })
        .create();
      expect(person).toEqual({
        id: "over",
        name: "Foo Bar",
      });
    });

    it("allows to apply multiple states", () => {
      const person = new PersonFactory()
        .override({
          name: "random",
          id: "random",
        })
        .specified()
        .unassigned()
        .assigned()
        .create();

      expect(person).toEqual({
        id: "uuid",
        name: "John Doe",
      });
    });

    it("allows to pass arguments to states", () => {
      const person = new PersonFactory().specified("Martin").create();

      expect(person.name).toEqual("Martin Doe");
    });
  });

  describe("extending", () => {
    it("allows to extend factory by extending class", () => {
      type Person = {
        id: string | null;
        name: string;
      };
      type PersonDetails = Person & {
        age: number;
        address: string;
      };

      class PersonFactory extends Factory<Person> {
        define = {
          id: "uuid",
          name: "Foo Bar",
        };
      }

      class PersonDetailsFactory extends Factory<PersonDetails> {
        define = {
          ...new PersonFactory().define,
          name: "Joseph",
          age: () => Math.floor(Math.random() * 80),
          address: "Warsaw",
        };
      }

      const personDetails = new PersonDetailsFactory()
        .override({
          age: 60,
        })
        .create();

      expect(personDetails).toEqual({
        id: "uuid",
        name: "Joseph",
        age: 60,
        address: "Warsaw",
      });
    });
  });

  describe("create many", () => {
    it("allows to create many resources by passing number of resources to the create method", () => {
      const resources = new ResourceFactory().override({ id: 1 }).create(5);

      expect(resources).toEqual([
        { id: 1 },
        { id: 1 },
        { id: 1 },
        { id: 1 },
        { id: 1 },
      ]);
    });

    it("allows to create many resources in more specific way overriding by index", () => {
      const resources = new ResourceFactory().create(5, (index, factory) => {
        return factory.override({ id: index + 1 }).create();
      });

      expect(resources).toEqual([
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
      ]);
    });
  });

  describe("pick", () => {
    it("it computes only selected fields", () => {
      type Person = {
        id: string | null;
        name: string;
      };

      const fn = jest.fn();

      class PersonFactory extends Factory<Person> {
        define = {
          id: "uuid",
          name: fn,
        };
      }

      const person = new PersonFactory().pick(["id"]).create();

      expect(person).toEqual({
        id: "uuid",
      });
      expect(fn).not.toBeCalled();
    });
  });

  describe("omit", () => {
    it("it excludes selected fields", () => {
      type Person = {
        id: string;
        name: string;
        surname: string;
      };

      const fn = jest.fn();

      class PersonFactory extends Factory<Person> {
        define = {
          id: fn,
          name: () => "Jake",
          surname: fn,
        };
      }

      const person = new PersonFactory().omit(["id", "surname"]).create();

      expect(person).toEqual({
        name: "Jake",
      });
      expect(fn).not.toBeCalled();
    });
  });
});
