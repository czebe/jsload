import jsdom from "jsdom-global";
import { expect } from "chai";
import jsload from "../src/jsload";
import sinon from "sinon";

describe("Load resources with callback and fallbacks", () => {
  let cleanup;

  beforeEach(() => {
    cleanup = jsdom();
  });

  afterEach(() => {
    cleanup();
  });

  it("should load requested fallback resource and execute `callback` function", () => {
    const callbackSpy = sinon.spy();
    jsload(["http://localhost/foo.js"], null, callbackSpy, [
      "http://localhost/foo2.js"
    ]);

    const injected = document.getElementsByTagName("script")[0];
    injected.onerror();

    const injected2 = document.getElementsByTagName("script")[1];
    injected2.onload();

    expect(callbackSpy.calledOnce).to.be.true;
  });
});
