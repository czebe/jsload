import jsdom from "jsdom-global";
import { expect } from "chai";
import jsload from "../src/jsload";
import sinon from "sinon";

describe("Load resources with Promise and fallbacks", () => {
  let cleanup;

  beforeEach(() => {
    cleanup = jsdom();
  });

  afterEach(() => {
    cleanup();
  });

  it("should load fallback for requested resource and resolve the promise", done => {
    const fallback = "http://localhost/foo2.js";
    jsload(["http://localhost/foo.js"], [fallback]).then(result => {
      expect(result.length).to.equal(1);
      expect(result[0].src).to.equal(fallback);
      done();
    });

    setTimeout(() => {
      const injected0 = document.getElementsByTagName("script")[0];
      injected0.onerror();

      setTimeout(() => {
        const injected1 = document.getElementsByTagName("script")[1];
        injected1.onload();
      }, 0);
    }, 0);
  });

  it("should try to load multiple fallbacks for requested resource and resolve the promise", done => {
    const fallback1 = "http://localhost/foo1.js";
    const fallback2 = "http://localhost/foo2.js";
    const fallback3 = "http://localhost/foo3.js";
    jsload(
      ["http://localhost/foo.js"],
      [[fallback1, fallback2, fallback3]]
    ).then(result => {
      expect(result.length).to.equal(1);
      expect(result[0].src).to.equal(fallback3);
      done();
    });

    setTimeout(() => {
      const injected0 = document.getElementsByTagName("script")[0];
      injected0.onerror();

      setTimeout(() => {
        const injected1 = document.getElementsByTagName("script")[1];
        injected1.onerror();

        setTimeout(() => {
          const injected2 = document.getElementsByTagName("script")[2];
          injected2.onerror();

          setTimeout(() => {
            const injected3 = document.getElementsByTagName("script")[3];
            injected3.onload();
          }, 0);
        }, 0);
      }, 0);
    }, 0);
  });

  it("should load the fallback resource when a timeout occurs", done => {
    jsload(
      ["http://localhost/foo_primary.js"],
      ["http://localhost/foo_secondary.js"],
      null,
      null,
      500
    ).then(result => {
      expect(result).to.not.be.undefined;
      done();
    });

    // clock.tick(1001);

    setTimeout(() => {
      setTimeout(() => {
        const injected1 = document.getElementsByTagName("script")[1];
        injected1.onload();
      }, 0);
    }, 500);
  });
});
