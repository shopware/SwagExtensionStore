import helloWorld from 'SwagExtensionStore/helloWorld';

describe('testing the hello world', () => {
    test('helloWorld returns "Hello World"', () => {
        expect(helloWorld()).toEqual('Hello World');
    });
});
