import {Observable} from "rxjs";

export type EMPTY_CACHE = "EMPTY_CACHE"

export interface SourceOfTruth<Key, Value> {
    reader(key: Key): Observable<Value | EMPTY_CACHE>

    writer(key: Key, input: Value): Promise<void>

    delete(key: Key): Promise<void>

    deleteAll(): Promise<void>
}