import {join} from 'path';
import {SourceMapDevToolPlugin} from 'webpack';
import claimer from './claimer';
import uploader from './uploader';
import {append, hash} from './utils';
import type {Compiler, compilation} from 'webpack';

const {name} = require('../package.json');
const MAP_EXTENSION = '.map';

type Options = Omit<SourceMapDevToolPlugin.Options, 'filename' | 'append'>

/**
 *
 * @param protocol
 * @param hostname
 * @param port
 * @param options
 */
const factory = ({protocol, hostname, port}: { protocol: string, hostname: string, port: number }, options: Options = {}) => {
    const promises: Promise<any>[] = [];

    /**
     *
     * @param id
     */
    const getUrl = (id: string) => {
        const parts = [
            '\n//# sourceMappingURL=',
        ];

        if (protocol) {
            parts.push(`${protocol}://`);
        }

        parts.push(hostname);

        if (port) {
            parts.push(`:${port}`);
        }

        parts.push(`/artifact/${id}`);

        return parts.join('');
    };

    /**
     *
     * @param compilation
     * @param name
     */
    const getSource = (compilation: compilation.Compilation, name: string) => {
        return compilation.assets[name + MAP_EXTENSION];
    };

    /**
     *
     * @param compilation
     * @param name
     */
    const getPath = (compilation: compilation.Compilation, name: string) => {
        const path = compilation.getPath(compilation.compiler.outputPath, null);
        const [part] = name.split('?');

        return join(path, part);
    };

    /**
     *
     * @param compilation
     */
    const getAssets = (compilation: compilation.Compilation) => {
        return Object.keys(compilation.assets)
            .filter((name) => /\.js$/.test(name))
            .map((name) => ({
                source: getSource(compilation, name),
                path: getPath(compilation, name),
            }))
            .filter(Boolean)
        ;
    };

    /**
     *
     * @param json
     * @param path
     */
    const processAsset = async (json: string, path: string) => {
        const crc = hash(json);
        const {id, upload} = await claimer({hostname, port}, crc);
        if (upload) {
            await uploader({hostname, port}, id, json);
        }

        const url = getUrl(id);

        return append(path, url);
    };

    /**
     *
     * @param compilation
     */
    const onCompilation = async (compilation: compilation.Compilation) => {
        const logger = compilation.getLogger(name);
        const assets = getAssets(compilation);

        for (const {source, path} of assets) {
            const {_value: json} = source;
            const promise = processAsset(json, path);
            promises.push(promise);
        }

        return await Promise.all(promises)
            .catch(({message}) => logger.warn(message))
        ;
    };

    /**
     *
     * @param compiler
     */
    const apply = ({hooks: {afterEmit}}: Compiler) => {
        afterEmit.tapPromise(name, onCompilation);
    };

    return [
        new SourceMapDevToolPlugin({
            append: false,
            filename: '[file]' + MAP_EXTENSION,
            ...options,
        }),
        {
            apply,
        },
    ];
};

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 19.01.2022
 * Time: 15:22
 */
// module.exports = factory;
export = factory;
