### mini-mobx (around 100 lines~)

try to clone [mobx](https://github.com/mobxjs/mobx).

In the mox original implementation, it has Observable and Derivation. I combine those two into Observer.
An Observer can be observed by a set of observers.
Whenever an observer changes, it will notify the observers.
Since it is possible that an observer can trigger another observer and that observer can trigger another observer,
we need to create a observing context during building dependencies.

I also noticed a disadvantage of mobx during this cloning. Since mobx is building dependencies at runtime, it may lack of some dependencies
because of some short-circuit operators (||, &&).
