### mini-immer

try to clone [immer](https://github.com/immerjs/immer).
the main idea is to use a [proxy class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to handle
all the getters and setters. For each setter, it will remember the set action and run the build.
For each getter, it will remember the next proxy in the get action.
