import { expect } from "chai";
import jsload from "../src/jsload";

describe("jsload parameters", () => {
  it("should throw when `resources` is not defined", () => {
    expect(() => jsload()).to.throw();
  });

  it("should throw when `resources` is not an Array or String", () => {
    expect(() => jsload({})).to.throw();
  });

  it("should not throw when `resources` is an Array", () => {
    expect(() => jsload(["foo"])).to.not.throw();
  });

  it("should not throw when `resources` is a String", () => {
    expect(() => jsload("foo")).to.not.throw();
  });

  it("should throw when `resources` and `fallbacks` types don't match", () => {
    expect(() => jsload(["foo"], null, null, "foo")).to.throw();
  });

  it("should not throw when `resources` and `fallbacks` types are identical", () => {
    expect(() => jsload("foo", null, null, "foo")).to.not.throw();
    expect(() => jsload(["foo"], null, null, ["foo"])).to.not.throw();
  });

  it("should throw when `promise` is not a Promise", () => {
    expect(() => jsload(["foo"], {})).to.throw();
  });

  it("should not throw when `promise` is a Promise", () => {
    expect(() => jsload(["foo"], Promise.resolve())).to.not.throw();
  });

  it("should throw when `callback` is not a Function", () => {
    expect(() => jsload(["foo"], null, {})).to.throw();
  });

  it("should not throw when `callback` is Function", () => {
    expect(() => jsload(["foo"], null, () => {})).to.not.throw();
  });
});
