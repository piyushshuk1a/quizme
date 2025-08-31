/**
 * A utility type for creating union types based on the values of a given object
 * @note TObject denotes the type of the object
 */
type ObjectValuesUnion<TObject> = TObject[keyof TObject];
