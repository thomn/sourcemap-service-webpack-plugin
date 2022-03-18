import {fetch, stringify} from './utils';
import {Status} from './status';

/**
 *
 * @param protocol
 * @param hostname
 * @param port
 * @param crc
 */
const factory = ({protocol, hostname, port}: { protocol: string, hostname: string, port: number }, crc: string): Promise<{
    id: string,
    upload: boolean,
}> => (
    fetch({protocol, hostname, port})('/artifact/claim', {crc})
        .then(({body, status}) => {
            if (status === Status.OK) {
                return {
                    id: body,
                    upload: true,
                };
            } else if (status === Status.BAD_REQUEST) {
                return {
                    id: body,
                    upload: false,
                };
            }

            const message = 'Something went wrong: ' + stringify({
                body,
                status,
            });
            throw new Error(message);
        })
);

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 19.01.2022
 * Time: 15:21
 */
export default factory;
