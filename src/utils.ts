import {createHash} from 'crypto';
import {IncomingMessage, request} from 'http';
import {appendFile} from 'fs';

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
 * @param hostname
 * @param port
 */
export const fetch = ({hostname, port}: { hostname: string, port: number }) => {
    return (path: string, data: string | object): Promise<{ res: IncomingMessage, body: string, status: number }> => {
        const buffer = (typeof data === 'object')
            ? JSON.stringify(data)
            : Buffer.from(data)
        ;

        const type = (typeof data === 'object')
            ? 'application/json'
            : 'text/plain'
        ;

        const options = {
            hostname,
            port,
            path,
            method: 'POST',
            headers: {
                'Content-Type': type,
                'Content-Length': buffer.length,
            },
        };

        /**
         *
         * @param resolve
         * @param reject
         */
        const handle = (resolve, reject): void => {
            const req = request(options, (res) => {
                const {statusCode: status} = res;
                const response = [];

                res.on('data', chunk => {
                    response.push(chunk);
                });

                res.on('end', () => {
                    const body = Buffer.concat(response).toString();

                    resolve({
                        res,
                        body,
                        status,
                    });
                });

                res.on('error', reject);
            });

            req.on('error', reject);
            req.write(buffer);
            req.end();
        };

        return new Promise(handle);
    };
};
