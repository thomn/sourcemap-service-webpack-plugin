import assert from 'assert';
import webpack from 'webpack';
import {make, interceptor, read, cleanup} from './util';

const {name} = require('../package-lock.json');

describe('SourceMapServicePlugin', () => {
    const protocol = 'http';
    const hostname = 'localhost';
    const port = 4000;
    const intercept = interceptor({
        protocol,
        hostname,
        port,
    });

    const options = make({
        protocol,
        hostname,
        port,
    });

    describe('clean state', () => {
        it('should upload and append artifact url to bundle', (done) => {
            const id = 'foo';

            intercept({
                method: 'post',
                uri: '/artifact/claim',
                status: 200,
                response: id,
            });

            intercept({
                method: 'post',
                uri: `/artifact/${id}`,
                status: 201,
                response: id,
            });

            cleanup(id);
            webpack(options({path: id}), () => {
                const content = read(id);
                const [ref] = content.split('//# ')
                    .reverse()
                ;

                assert(ref === `sourceMappingURL=${protocol}://${hostname}:${port}/artifact/${id}`);
                done();
            });
        }).timeout(25 * 1000);
    });

    describe('same build, previously uploaded', () => {
        it('should not upload artifact but append artifact url to bundle', (done) => {
            const id = 'bar';

            intercept({
                method: 'post',
                uri: '/artifact/claim',
                status: 400,
                response: id,
            });

            cleanup(id);
            webpack(options({path: id}), () => {
                const content = read(id);
                const [ref] = content.split('//# ')
                    .reverse()
                ;

                assert(ref === `sourceMappingURL=${protocol}://${hostname}:${port}/artifact/${id}`);
                done();
            });
        }).timeout(25 * 1000);
    });

    describe('unexpected response while claiming', () => {
        it('should throw error and upload nothing', (done) => {
            const id = 'baz';

            intercept({
                method: 'post',
                uri: '/artifact/claim',
                status: 500,
                response: 'trigger',
            });

            cleanup(id);
            webpack(options({path: id}), (err, {compilation}) => {
                // @ts-ignore
                const logs = compilation.logging.get(name);
                const [warning] = logs;

                assert(warning.type === 'warn');
                assert(warning.args[0] === 'Something went wrong: body="trigger", status="500"');
                done();
            });
        }).timeout(25 * 1000);
    });
});
