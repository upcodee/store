import {EMPTY, from, iif, merge, Observable, of} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {Fetcher} from "./Fetcher";
import {SourceOfTruth} from "./SourceOfTruth";
import {typed} from "@upcodee/typed";

export interface Store<Key, Value> {
    cached(key: Key, refresh: boolean): Observable<StoreResponse<Value>>

    fresh(key: Key): Observable<StoreResponse<Value>>
}

export class StoreImpl<Key, Value> implements Store<Key, Value> {

    private readonly fetcher: Fetcher<Key, Value>;
    private readonly source: SourceOfTruth<Key, Value>;

    constructor(fetcher: Fetcher<Key, Value>, source: SourceOfTruth<Key, Value>) {
        this.fetcher = fetcher;
        this.source = source;
    }

    cached(key: Key, refresh: boolean): Observable<StoreResponse<Value>> {
        return merge(
            iif(() => refresh, this.fresh(key)),
            this.source.reader(key).pipe(
                switchMap(it => it == "EMPTY_CACHE" ? (refresh ? EMPTY : this.fresh(key)) : of(it).pipe(
                    map(it => StoreResponseData<Value>(it, "SourceOfTruth")),
                    catchError(it => of(StoreResponseError(it, "SourceOfTruth"))),
                )),
                startWith(StoreResponseLoading("SourceOfTruth")),
            )
        )
    }

    fresh(key: Key): Observable<StoreResponse<Value>> {
        return from(this.fetch(key)).pipe(
            map(it => StoreResponseData<Value>(it, "Fetcher")),
            catchError(it => of(StoreResponseError(it, "Fetcher"))),
            startWith(StoreResponseLoading("Fetcher")),
        )
    }

    async fetch(key: Key): Promise<Value> {
        const fresh = await this.fetcher(key)
        await this.source.writer(key, fresh)
        return fresh
    }

}

export type ResponseOrigin = "Cache" | "SourceOfTruth" | "Fetcher"

export type StoreResponse<T> = StoreResponseLoading | StoreResponseData<T> | StoreResponseError

export interface StoreResponseLoading {
    type: "StoreResponseLoading"
    origin: ResponseOrigin
}

const StoreResponseLoading = (origin: ResponseOrigin) => typed<StoreResponseLoading>({origin: origin}, "StoreResponseLoading")

export interface StoreResponseData<T> {
    type: "StoreResponseData"
    origin: ResponseOrigin
    value: T
}

const StoreResponseData = <T>(value: T, origin: ResponseOrigin) => typed<StoreResponseData<T>>({origin: origin, value: value}, "StoreResponseData")

export interface StoreResponseError {
    type: "StoreResponseError"
    origin: ResponseOrigin
    error: any
}

const StoreResponseError = <T>(error: any, origin: ResponseOrigin) => typed<StoreResponseError>({origin: origin, error: error}, "StoreResponseError")