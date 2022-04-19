import {fetch, stringify} from './utils';
import {Status} from './status';
import type {Options} from './types';

/**
 *
 * @param protocol
 * @param hostname
 * @param port
 * @param context
 * @param id
 * @param data
 */
const factory = async ({protocol, hostname, port, context}: Options, id: string, data: string) => (
    fetch({protocol, hostname, port, context})('/artifact/' + id, data)
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
