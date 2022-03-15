import {readFileSync, rmSync} from 'fs';
import {resolve} from 'path';
import nock from 'nock';
import sourceMapServicePlugin from '../src';

/**
 *
 * @param protocol
 * @param hostname
 * @param port
 */
export const make = ({protocol, hostname, port}: { protocol: string, hostname: string, port: number }) => ({path, ...rest}: any) => (
    {
        context: __dirname + '/fixtures',
        entry: './index.js',
        output: {
            path: resolve(__dirname, 'bundles', path),
            filename: 'bundle.js',
        },
        plugins: [
            ...sourceMapServicePlugin({
                protocol,
                hostname,
                port,
            }),
        ],
        ...rest,
    }
);

/**
 *
 */
export const read = (name: string) => {
    const path = resolve(__dirname, 'bundles', name, 'bundle.js');

    return readFileSync(path, {encoding: 'utf-8'});
};

/**
 *
 */
export const cleanup = (name: string) => {
    const path = resolve(__dirname, 'bundles', name);

    try {
        rmSync(path, {
            recursive: true,
        });
    } catch (e) {
        //
    }
};

/**
 *
 * @param protocol
 * @param hostname
 * @param port
 */
export const interceptor = ({protocol, hostname, port}) => (
    ({method, uri, status, response = null}) => (
        nock(`${protocol}://${hostname}:${port}`)
            .intercept(uri, method)
            .reply(status, response)

    )
);
