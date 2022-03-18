import {fetch, stringify} from './utils';
import {Status} from './status';



/**
 *
 * @param protocol
 * @param hostname
 * @param port
 * @param id
 * @param data
 */
const factory = async ({protocol, hostname, port}: { protocol: string, hostname: string, port: number }, id: string, data: string | object) => (
    fetch({protocol, hostname, port})('/artifact/' + id, data)
        .then(({body, status}) => {
            if (status === Status.CREATED) {
                return {
                    id: body,
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
