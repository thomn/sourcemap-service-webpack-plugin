import {createHash} from 'crypto';
import {IncomingMessage, request as httpRequest} from 'http';
import {request as httpsRequest} from 'https';
import {appendFile} from 'fs';
import {Options} from './types';

/**
 *
 * @param string
 */
export const hash = (string: string): string => (
    createHash('md5')
        .update(string)
        .digest('hex')
);

/**
 *
 * @param object
 */
export const omit = (object: object) => {
    const clone = Object.assign({}, object);

    return Object.keys(clone)
        .reduce((acc, key) => {
            if (acc[key] == null) {
                delete acc[key];
            }

            return acc;
        }, clone)
    ;
};

/**
 *
 * @param object
 */
export const stringify = (object: object): string => (
    Object.keys(object)
        .filter((key) => !!object[key])
        .map((key) => [key, object[key]])
        .reduce((acc, [key, value]) => acc.push(`${key}="${value}"`) && acc, [])
        .join(', ')
);

/**
 *
 * @param file
 * @param data
 */
export const append = (file: string, data: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            appendFile(file, data, (err) => {
                if (!err) {
                    return resolve(file);
                } else {
                    return reject(err);
                }
            });
        } catch (err) {
            return reject(err);
        }
    });
};

/**
 *
 * @param protocol
 * @param hostname
 * @param port
 * @param context
 */
export const fetch = ({protocol, hostname, port, context}: Options) => {
    return (path: string, data: string): Promise<{ res: IncomingMessage, body: string, status: number }> => {
        const options = {
            protocol: protocol && protocol + ':',
            hostname,
            port,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Content-Length': Buffer.byteLength(data, 'utf-8'),
            },
        };

        if (context) {
            context = omit(context);
            options.path += '?' + new URLSearchParams(context as any)
                .toString()
            ;
        }

        /**
         *
         * @param resolve
         * @param reject
         */
        const handle = (resolve, reject): void => {
            let request = httpRequest;
            if (protocol === 'https') {
                request = httpsRequest;
            }

            const req = request(options, (res) => {
                const {statusCode: status} = res;
                const response = [];

                res.on('data', chunk => {
                    response.push(chunk);
                });

                res.on('end', () => {
                    const body = Buffer.concat(response)
                        .toString()
                    ;

                    resolve({
                        res,
                        body,
                        status,
                    });
                });

                res.on('error', reject);
            });

            req.on('error', reject);
            req.write(data);
            req.end();
        };

        return new Promise(handle);
    };
};
