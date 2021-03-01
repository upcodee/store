import {injectable} from "inversify";

export interface Serializer {
    serialize<R>(input: R): string

    deserialize<R>(input: string): R
}