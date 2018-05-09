/**
 *
 * any question or idea, email to i@closx.com
 * @author HerbLuo
 * @date 2017/10/6
 * @license Licensed under the MIT license.
 *
 * change logs:
 * 2017/10/6 herbluo created
 */
interface Object<T> {
  let<S>(func: (T) => S): S;
  also(func: (T) => void): T;
  takeIf(func: (T) => boolean): T | null;
  takeUnless(func: (T) => boolean): T | null;

  let<S>(itFunc: S): S;
  also(itFunc: any): T;
  takeIf(itFunc: T): T | null;
  takeUnless(itFunc: T): T | null;

  alsoPrint(tip?: string): null;
  to(left: any): T
}

interface global {
  it: any
}

interface Window {
  it: any
}
