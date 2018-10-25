import { expect } from "chai";
import jsload from "../src/jsload";
import jsdom from "jsdom-global";

describe("jsload parameters", () => {
  let cleanup;

  beforeEach(() => {
    cleanup = jsdom();
  });

  afterEach(() => {
    cleanup();
  });

  it("should throw when `resources` is not defined", () => {
    expect(() => jsload()).to.throw();
  });

  it("should throw when `resources` is not an Array or String", () => {
    expect(() => jsload({})).to.throw();
  });

  it("should throw when `resources` and `fallbacks` types don't match", () => {
    expect(() => jsload(["foo"], "foo", null, null)).to.throw();
  });

  it("should throw when `promise` is not a Promise", () => {
    expect(() => jsload(["foo"], [], {})).to.throw();
  });

  it("should throw when `callback` is not a Function", () => {
    expect(() => jsload(["foo"], [], null, {})).to.throw();
  });
});
