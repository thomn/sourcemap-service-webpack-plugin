import {readFileSync, rmSync, copyFileSync, mkdirSync, existsSync} from 'fs';
import {resolve, dirname, extname} from 'path';
import nock from 'nock';
import sourceMapServicePlugin from '../src';
import assert from 'assert';

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
 * @param protocol
 * @param hostname
 * @param port
 */
export const interceptor = ({protocol, hostname, port}) => (
    ({method, uri, status, response = null}) => (
        nock(`${protocol}://${hostname}:${port}`)
            .intercept(uri, method)
            .query(true)
            .reply(status, response)
    )
);

/**
 *
 * @param id
 */
export const tester = (id: string) => {
    const cleanup = () => {
        const path = resolve(__dirname, 'bundles', id);

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
     * @param ext
     */
    const read = (ext: string) => {
        const path = resolve(__dirname, 'bundles', id, 'bundle' + ext);

        return readFileSync(path, {encoding: 'utf-8'});
    };

    /**
     *
     * @param file
     */
    const copy = (file: string) => {
        const from = resolve(__dirname, 'fixtures', file);
        const to = resolve(__dirname, 'bundles', id, 'bundle' + extname(file));

        const folder = dirname(to);
        if (!existsSync(folder)) {
            mkdirSync(folder, {
                recursive: true,
            });
        }

        return copyFileSync(from, to);
    };

    /**
     *
     */
    const find = (): string => {
        return resolve(__dirname, 'bundles', id, 'bundle.css');
    };

    /**
     *
     * @param ext
     * @param fn
     */
    const verify = (ext: string, fn: (string) => boolean) => {
        const content = read(ext);
        const regex = /\/\*# (.*) \*\/|\/\/# (.*)/gm;
        const [match] = regex.exec(content);

        return assert(fn(match.trim()) === true);
    };

    return {
        cleanup,
        read,
        copy,
        find,
        verify,
    };
};
