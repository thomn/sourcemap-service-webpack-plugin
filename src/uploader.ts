import {fetch} from './utils';
import {Status} from './status';

/**
 *
 * @param hostname
 * @param port
 * @param id
 * @param data
 */
const factory = async ({hostname, port}: { hostname: string, port: number }, id: string, data: string | object) => (
    fetch({hostname, port})('/artifact/' + id, data)
        .then(({body, status}) => {
            if (status === Status.CREATED) {
                return {
                    id: body,
                };
            }

            throw new Error(`Something went wrong: response="${body}", status="${status}"`);
        })
);

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 19.01.2022
 * Time: 15:21
 */
export default factory;
