type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>
export type IntMap<T, N extends number> = number extends N ? { readonly [K: number]: T } : { readonly [K in Enumerate<N>]: T }

const pipo: IntMap<string, number> = { 0: 'a', 1: 'b', 2: 'c' };

/**
 * Vector interface, N elements of type T
 */
export type Vector<T, N extends number> = IntMap<T, N> & Iterable<T> & {
    readonly length: N;
    at(i: number): T | undefined;
    map<U>(f: (v: T, i: number) => U): Vector<U, N>;
    reduce<U>(f: (acc: U, v: T, i: IntRange<0, N>) => U, initialValue: U): U;
    forEach(cb: (value: T, index: IntRange<0, N>) => void): void;
    join(separator?: string): string;
  }

/**
* Extract the size type of a Vector
*/
export type VECTOR_SIZE<T> = T extends Vector<unknown, infer N> ? N : never;

/**
 * Matrix interface, L lines, C columns, based on a L-vector of C-vectors
 */
export type Matrix<T, L extends number, C extends number> = Vector<Vector<T, C>, L>;

/**
 * Extract the number of lines types of a Matrix
 */
export type NbLines  <T> = T extends Matrix<unknown, infer N, number> ? N : never;
export type NbColumns<T> = T extends Matrix<unknown, number, infer N> ? N : never;


/**
 * Initialize a vector of length N with the value returned by fValue
 * @param fValue a function that returns the value of the vector at the given index
 * @param length the length of the vector to be initialized
 * @returns a vector of length N with the value returned by fValue
 */
export function initVector<T, N extends number>(fValue: (index: number) => T, length: N): Vector<T, N> {
    return Array.from( Array(length), (_, i) => fValue(i) ) as unknown as Vector<T, N>;
  }
  
  /**
   * Initialize a matrix of size nbLines x nbColumns with the value returned by fValue
   * @param fValue a function that returns the value of the matrix at the given indexes (i, j)
   * @param nbLines number of lines of the matrix to be initialized
   * @param nbColumns number of columns of the matrix to be initialized
   * @returns a matrix of size nbLines x nbColumns with the value returned by fValue
   */
  export function initMatrix<T, L extends number, C extends number>(fValue: (i: number, j: number) => T, nbLines: L, nbColumns: C): Matrix<T, L, C> {
    return initVector<Vector<T,C>, L>( i => initVector<T, C>( j => fValue(i, j), nbColumns), nbLines);
  }

  export function toVector<T, N extends number>(n: N, v: readonly T[]): Vector<T, N> {
    if (v.length !== n) throw new Error(`toVector: expected ${n} elements, got ${v.length}`);
    return v as unknown as Vector<T, N>;
  }

  export function toMatrix<T, L extends number, H extends number>(l: L, h: H, m: Vector<T, H>[]): Matrix<T, L, H> {
    if (m.length !== l) throw new Error(`toMatrix: expected ${l} lines, got ${m.length}`);
    return m as unknown as Matrix<T, L, H>;
  }
