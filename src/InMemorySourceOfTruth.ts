import {merge, Observable, of, Subject} from "rxjs";
import {filter, map} from "rxjs/operators";
import {EMPTY_CACHE, SourceOfTruth} from "./SourceOfTruth";
import {Serializer} from "@upcodee/store";

export interface KeyValue<Key, Value> {
    key: Key,
    value: Value
}

export class InMemorySourceOfTruth<Key, Value> implements SourceOfTruth<Key, Value> {

    private serializer: Serializer;

    storage = new Map<string, Value>()
    subject$ = new Subject<KeyValue<string, Value>>()

    constructor(serializer: Serializer) {
        this.serializer = serializer;
    }

    async delete(key: Key): Promise<void> {
        this.storage.delete(this.keyToString(key))
    }

    async deleteAll(): Promise<void> {
        this.storage.clear()
    }

    reader(key: Key): Observable<Value | EMPTY_CACHE> {
        const keyString = this.keyToString(key)
        const cached = this.storage.get(keyString)
        return merge(
            this.subject$.pipe(
                filter(it => it.key == this.keyToString(key)),
                map(it => it.value),
            ),
            of(cached).pipe(
                map(it => it ?? "EMPTY_CACHE"),
            )
        )
    }

    async writer(key: Key, input: Value): Promise<void> {
        const keyValue = {
            key: this.keyToString(key),
            value: input
        }
        this.storage.set(keyValue.key, keyValue.value)
        this.subject$.next(keyValue)
    }

    private keyToString(key: Key): string {
        return this.serializer.serialize(key)
    }

}