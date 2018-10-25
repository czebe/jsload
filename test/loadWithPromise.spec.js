import jsdom from "jsdom-global";
import { expect } from "chai";
import jsload from "../src/jsload";
import sinon from "sinon";

describe("Load resources with Promise", () => {
  let cleanup;

  beforeEach(() => {
    cleanup = jsdom();
  });

  afterEach(() => {
    cleanup();
  });

  it("should load requested resource and resolve the promise", done => {
    jsload(["http://localhost/foo.js"]).then(result => {
      expect(result.length).to.equal(1);
      done();
    });

    setTimeout(() => {
      const injected = document.getElementsByTagName("script")[0];
      injected.onload();
    }, 0);
  });

  it("should load multiple resources and resolve the promise", done => {
    jsload([
      "http://localhost/foo.js",
      "http://localhost/foo2.js",
      "http://localhost/foo3.js"
    ]).then(result => {
      expect(result.length).to.equal(3);
      done();
    });

    setTimeout(() => {
      const injected0 = document.getElementsByTagName("script")[0];
      const injected1 = document.getElementsByTagName("script")[1];
      const injected2 = document.getElementsByTagName("script")[2];
      injected0.onload();
      injected1.onload();
      injected2.onload();
    }, 0);
  });

  it("should reject the Promise when a timeout occurs", done => {
    const clock = sinon.useFakeTimers();
    jsload("http://localhost/foo.js", null, null, null, 1000).catch(err => {
      expect(err).to.not.be.undefined;
      done();
    });

    clock.tick(1001);
    clock.restore();
  });
});
