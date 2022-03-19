### mini-immer

try to clone [immer](https://github.com/immerjs/immer).
the main idea is to use a [proxy class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) to handle
all the getters and setters.

For each setter, it will remember the set action and run the build.

For each getter, it will remember the parent proxy in the get action.

Benchmark test code is adapted from immer, so i think it is a fair comparison. My implementation is about 5x faster.

```
Benchmarks:
  add data test
    mini-immer                           9.37 ms ± 1.81 %   (70 runs sampled)
    immer (proxy) - without auto freeze  64.33 ms ± 3.05 %  (39 runs sampled)
  incremental test
    mini-immer                           6.33 ms ± 3.36 %   (67 runs sampled)
    immer (proxy) - without auto freeze  30.63 ms ± 2.38 %  (52 runs sampled)
  todo test
    mini-immer                           2.59 ms ± 4.18 %   (74 runs sampled)
    immer (proxy) - without auto freeze  15.43 ms ± 2.56 %  (63 runs sampled)
```
