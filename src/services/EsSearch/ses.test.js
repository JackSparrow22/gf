import { indices, indice, uniqueValInField, test, schemas, schema, addSchema } from './ses'

describe('es service ', () => {
    // it('test ', async () => {
    //     // const a = {
    //     //     hello: 'jest',
    //     //     hi: {
    //     //         name: 'jest'
    //     //     }
    //     // };
    //     // const b = {
    //     //     hello: 'jest',
    //     //     hi: {
    //     //         name: 'jest'
    //     //     }
    //     // };

    //     // expect(a).toEqual(b)
    //     // expect([1, 2, 3]).toEqual([1, 2, 3])
    //     // expect(null).toBeNull()
    //     // expect([1, 2, 3]).toContain(1)
    //     // expect(b).toHaveProperty('hi')
    //     // expect('123').toContain('2')
    //     // expect('123').toMatch(/^\d+$/)
    //     // expect('123').not.toContain('4')
    // });

    // it('indices', async () => {
    //     const result = await indices();
    //     console.log('result', result)
    // })

    // it('indice', async () => {
    //     const result = await indice({ index: 'aaaa' });
    //     console.log('result', result)
    // })

    // it('schemas', async () => {
    //     const result = await schemas({
    //         offset: 0, limit: 10, type: 1
    //     });
    //     console.log('result', result)
    // })

    it('schema', async () => {
        const result = await schema({
            id: 19
        });
        console.log('result', result)
    })



    // it('uniqueValueInField', async () => {
    //     const result = await uniqueValInField({
    //         index: 'index1',
    //         field: 'field1',
    //         size: 10
    //     });
    //     console.log('result', result)
    // })



    // it('addSchema', async () => {
    //     const result = await addSchema({
    //         "name": "个人档案流水测试",
    //         "type": 1,
    //         "schema": { "index": "rest_b", "index2": "test2" },
    //         "author": "test"
    //     });
    //     console.log('result', result)
    // })
});