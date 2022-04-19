import {SourceMapDevToolPlugin} from 'webpack';

export type SourceMapDevToolPluginOptions = Omit<SourceMapDevToolPlugin.Options, 'filename' | 'append'>
export type Options = {
    protocol: string,
    hostname: string,
    port: number,
    context?: {
        name?: string,
        version?: number | string,
        user?: string
    },
};
