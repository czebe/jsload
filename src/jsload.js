const load = (resource, callback) => {
  const head = document.head || document.getElementsByTagName("head")[0];

  if (/\.css$/i.test(resource)) {
    // CSS file, simply append it to head
    // We're not handling onload/onerror, since the lack of browser support
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.crossOrigin = "anonymous";
    link.href = resource;
    head.appendChild(link);
  } else {
    const script = document.createElement("script");

    script.type = "text/javascript";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = resource;

    if (callback) {
      script.onload = () => {
        script.onerror = script.onload = null;
        callback.call(this, null, script);
      };

      script.onerror = () => {
        script.onerror = script.onload = null;
        callback.call(this, new Error(`Failed to load ${resource}`), script);
      };
    }

    head.appendChild(script);
  }
};

const promisedLoad = resource =>
  new Promise((resolve, reject) =>
    load(resource, (err, result) => {
      if (err) {
        reject(err);
      } else if (result) {
        resolve(result);
      } else {
        resolve();
      }
    })
  );

const promisedLoadWithFallbacks = resources =>
  resources.reduce(
    (previousLoader, resource) =>
      previousLoader.then(null, () => promisedLoad(resource)),
    Promise.reject()
  );

const jsload = (resources, fallbacks, promise, callback) => {
  if (!resources) {
    throw new TypeError("`resources` is missing");
  }

  if (typeof resources !== "string" && !Array.isArray(resources)) {
    throw new TypeError(
      "`resources` must be an Array of URLs or an URL String"
    );
  }

  if (fallbacks && typeof resources !== typeof fallbacks) {
    throw new TypeError("`fallback` must be the same type as `resources`");
  }

  if (promise && !(promise instanceof Promise)) {
    throw new TypeError("`promise` must be a Promise");
  }

  if (callback && typeof callback !== "function") {
    throw new TypeError("`callback` must be a Function");
  }

  let urls = resources;
  if (!Array.isArray(urls)) {
    urls = [urls];
  }

  if (callback) {
    // Traditional way of loading stuff
    let loadCount = 0;
    const loadResult = (err, result, index) => {
      if (err) {
        if (index >= 0 && fallbacks && fallbacks[index]) {
          load(fallbacks[index], (err, result) => loadResult(err, result));
        } else {
          throw err;
        }
      } else {
        loadCount++;
        if (loadCount === urls.length) {
          callback.call(this, result); // All scripts loaded
        }
      }
    };

    urls.forEach((url, index) =>
      load(url, (err, result) => loadResult(err, result, index))
    );
  } else {
    // Promise based loading
    const deferreds = promise ? [].concat(promise) : [];

    urls.forEach((url, index) => {
      let deferred;
      if (fallbacks && fallbacks[index]) {
        const fallbackUrls =
          typeof fallbacks[index] === "string"
            ? [fallbacks[index]]
            : fallbacks[index];
        deferred = promisedLoadWithFallbacks([url, ...fallbackUrls]);
      } else {
        deferred = promisedLoad(url);
      }
      deferreds.push(deferred);
    });

    return Promise.all(deferreds);
  }
};

export default jsload;
