const load = (resource, callback, timeout) => {
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
      let timer;
      if (timeout) {
        // Create a timeout
        timer = setTimeout(() => {
          script.onerror = script.onload = null;
          callback.call(
            this,
            new Error(`Timeout occured loading: ${resource}`)
          );
        }, timeout);
      }

      script.onload = () => {
        if (timer) clearTimeout(timer);
        script.onerror = script.onload = null;
        callback.call(this, null, script);
      };

      script.onerror = () => {
        if (timer) clearTimeout(timer);
        script.onerror = script.onload = null;
        callback.call(this, new Error(`Failed to load: ${resource}`));
      };
    }

    head.appendChild(script);
  }
};

const promisedLoad = (resource, timeout) =>
  new Promise((resolve, reject) => {
    load(
      resource,
      (err, result) => {
        if (err) {
          reject(err);
        } else if (result) {
          resolve(result);
        }
      },
      timeout
    );
  });

const promisedLoadWithFallbacks = (resources, timeout) =>
  resources.reduce(
    (previousLoader, resource) =>
      previousLoader.then(null, () => promisedLoad(resource, timeout)),
    Promise.reject()
  );

const jsload = (resources, fallbacks, promise, callback, timeout = 8000) => {
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
          load(
            fallbacks[index],
            (err, result) => loadResult(err, result),
            timeout
          );
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
      load(url, (err, result) => loadResult(err, result, index), timeout)
    );
  } else {
    // Promise based loading
    // TODO: Add timeout to promises as well
    // https://gist.github.com/davej/728b20518632d97eef1e5a13bf0d05c7
    const deferreds = promise ? [].concat(promise) : [];

    urls.forEach((url, index) => {
      let deferred;
      if (fallbacks && fallbacks[index]) {
        const fallbackUrls =
          typeof fallbacks[index] === "string"
            ? [fallbacks[index]]
            : fallbacks[index];
        deferred = promisedLoadWithFallbacks([url, ...fallbackUrls], timeout);
      } else {
        deferred = promisedLoad(url, timeout);
      }
      deferreds.push(deferred);
    });

    return Promise.all(deferreds);
  }
};

export default jsload;
