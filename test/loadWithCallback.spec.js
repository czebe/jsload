import jsdom from "jsdom-global";
import { expect } from "chai";
import jsload from "../src/jsload";
import sinon from "sinon";

describe("Load resource with callback", () => {
  let cleanup;

  beforeEach(() => {
    cleanup = jsdom();
  });

  afterEach(() => {
    cleanup();
  });

  it("should load requested resource and execute `callback` function", () => {
    const callbackSpy = sinon.spy();
    jsload(["http://localhost/foo.js"], null, callbackSpy);

    const injected = document.getElementsByTagName("script")[0];
    injected.onload();

    expect(callbackSpy.calledOnce).to.be.true;
  });

  it("should load requested Array of resources and execute `callback` function", () => {
    const callbackSpy = sinon.spy();
    jsload(
      [
        "http://localhost/foo1.js",
        "http://localhost/foo2.js",
        "http://localhost/foo3.js"
      ],
      null,
      callbackSpy
    );

    const injected1 = document.getElementsByTagName("script")[0];
    const injected2 = document.getElementsByTagName("script")[1];
    const injected3 = document.getElementsByTagName("script")[2];
    injected1.onload();
    injected2.onload();
    injected3.onload();

    expect(callbackSpy.calledOnce).to.be.true;
  });

  it("should throw an error", () => {
    expect(() => {
      jsload(["http://localhost/foo.js"], null, () => {});
      const injected = document.getElementsByTagName("script")[0];
      injected.onerror();
    }).to.throw();
  });
});
