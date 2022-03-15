import {fetch} from './utils';
import {Status} from './status';

/**
 *
 * @param hostname
 * @param port
 * @param crc
 */
const factory = ({hostname, port}: { hostname: string, port: number }, crc: string): Promise<{
    id: string,
    upload: boolean,
}> => (
    fetch({hostname, port})('/artifact/claim', {crc})
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

            throw new Error(`Something went wrong: response="${body}", status="${status}"`);
        })
);

/**
 * User: Oleg Kamlowski <oleg.kamlowski@thomann.de>
 * Date: 19.01.2022
 * Time: 15:21
 */
export default factory;
