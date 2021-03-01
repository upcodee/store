export interface Fetcher<Key, Value> {
    (key: Key): Promise<Value>
}