import { Pipe, PipeTransform } from '@angular/core';

/**
 * Cast super type into type using generics
 * Return Type obtained by optional @param type OR assignment type.
 */

@Pipe({ name: 'cast', pure: true, standalone: true })
export class CastPipe implements PipeTransform {
  /**
   * Cast (input: unknown) into (T: Type) using Generics.
   * @param input (unknown) obtained from input type.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform<T>(input: unknown, _: T): T {
    return input as T;
  }
}
