import {appendFile} from 'fs';

/**
 *
 * @param protocol
 * @param hostname
 * @param port
 * @param path
 * @param id
 */
const factory = ({protocol, hostname, port}: { protocol: string, hostname: string, port: number }, path: string, id: string) => {
    const ref = [
        () => '\n//# sourceMappingURL=',
        ({protocol}) => protocol && `${protocol}://`,
        ({hostname}) => hostname,
        ({port}) => port && `:${port}`,
        ({id}) => id && `/artifact/${id}`,
    ].map((fn) => fn({protocol, hostname, port, id}))
        .filter(Boolean)
        .join('')
    ;

    return new Promise(async (resolve, reject): Promise<string | any> => {
        try {
            appendFile(path, ref, (err) => {
                if (!err) {
                    return resolve(ref);
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
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 23.03.2022
 * Time: 15:46
 */
export default factory;
