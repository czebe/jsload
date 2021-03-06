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
    jsload(
      ["http://localhost/foo_load_with_callback_and_fallback_1.js"],
      ["http://localhost/foo_load_with_callback_and_fallback_1_fb.js"],
      null,
      callbackSpy
    );

    const injected = document.getElementsByTagName("script")[0];
    injected.onerror();

    const injected2 = document.getElementsByTagName("script")[1];
    injected2.onload();

    expect(callbackSpy.calledOnce).to.be.true;
  });

  it("should load fallback resource when a timeout occurs", () => {
    const clock = sinon.useFakeTimers();
    const callbackSpy = sinon.spy();
    jsload(
      ["http://localhost/foo_load_with_callback_and_fallback_2.js"],
      ["http://localhost/foo_load_with_callback_and_fallback_2_fb.js"],
      null,
      callbackSpy,
      1000
    );

    clock.tick(1001);

    const injected2 = document.getElementsByTagName("script")[1];
    injected2.onload();

    expect(callbackSpy.calledOnce).to.be.true;

    clock.restore();
  });
});
