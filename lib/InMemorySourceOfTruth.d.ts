import { Observable, Subject } from "rxjs";
import { EMPTY_CACHE, SourceOfTruth } from "./SourceOfTruth";
import { Serializer } from "./Serializer";
export interface KeyValue<Key, Value> {
    key: Key;
    value: Value;
}
export declare class InMemorySourceOfTruth<Key, Value> implements SourceOfTruth<Key, Value> {
    private serializer;
    storage: Map<string, Value>;
    subject$: Subject<KeyValue<string, Value>>;
    constructor(serializer: Serializer);
    delete(key: Key): Promise<void>;
    deleteAll(): Promise<void>;
    reader(key: Key): Observable<Value | EMPTY_CACHE>;
    writer(key: Key, input: Value): Promise<void>;
    private keyToString;
}
