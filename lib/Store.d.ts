import { Observable } from "rxjs";
import { Fetcher } from "./Fetcher";
import { SourceOfTruth } from "./SourceOfTruth";
export interface Store<Key, Value> {
    cached(key: Key, refresh: boolean): Observable<StoreResponse<Value>>;
    fresh(key: Key): Observable<StoreResponse<Value>>;
}
export declare class StoreImpl<Key, Value> implements Store<Key, Value> {
    private readonly fetcher;
    private readonly source;
    constructor(fetcher: Fetcher<Key, Value>, source: SourceOfTruth<Key, Value>);
    cached(key: Key, refresh: boolean): Observable<StoreResponse<Value>>;
    fresh(key: Key): Observable<StoreResponse<Value>>;
    fetch(key: Key): Promise<Value>;
}
export declare type ResponseOrigin = "Cache" | "SourceOfTruth" | "Fetcher";
export declare type StoreResponse<T> = StoreResponseLoading | StoreResponseData<T> | StoreResponseError;
export interface StoreResponseLoading {
    type: "StoreResponseLoading";
    origin: ResponseOrigin;
}
export interface StoreResponseData<T> {
    type: "StoreResponseData";
    origin: ResponseOrigin;
    value: T;
}
export interface StoreResponseError {
    type: "StoreResponseError";
    origin: ResponseOrigin;
    error: any;
}
