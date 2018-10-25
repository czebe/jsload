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
    jsload(
      ["http://localhost/foo_load_with_callback_1.js"],
      [],
      null,
      callbackSpy
    );

    const injected = document.getElementsByTagName("script")[0];
    injected.onload();

    expect(callbackSpy.calledOnce).to.be.true;
  });

  it("should load requested Array of resources and execute `callback` function", () => {
    const callbackSpy = sinon.spy();
    jsload(
      [
        "http://localhost/foo_load_with_callback_2.js",
        "http://localhost/foo_load_with_callback_3.js",
        "http://localhost/foo_load_with_callback_4.js"
      ],
      [],
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

  it("should execute callback with error when script onError happens", () => {
    const callbackSpy = sinon.spy();
    jsload(
      ["http://localhost/foo_load_with_callback_5.js"],
      [],
      null,
      callbackSpy
    );
    const injected = document.getElementsByTagName("script")[0];
    injected.onerror();
    expect(callbackSpy.getCall(0).args[0]).to.be.an.instanceOf(Error);
  });

  it("should execute callback with error when a timeout occurs", () => {
    const clock = sinon.useFakeTimers();
    const callbackSpy = sinon.spy();
    jsload(
      ["http://localhost/foo_load_with_callback_6.js"],
      [],
      null,
      callbackSpy,
      1000
    );
    clock.tick(1001);
    expect(callbackSpy.getCall(0).args[0]).to.be.an.instanceOf(Error);
    clock.restore();
  });
});
