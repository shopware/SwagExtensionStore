import helloWorld from '_src/helloWorld';

describe('testing the hello world', () => {
    test('helloWorld returns "Hello World"', () => {
        expect(helloWorld()).toEqual('Hello World');
    });
});
