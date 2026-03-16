declare module 'supertest' {
  import * as express from 'express'
  interface SuperAgentTest {
    (app: express.Application): SuperTest
  }
  interface SuperTest {
    get(path: string): Test
    post(path: string): Test
    put(path: string): Test
    delete(path: string): Test
    patch(path: string): Test
    set(field: string, value: string): Test
    send(body: any): Test
    expect(status: number): Test
    expect(field: string, value: any): Test
    end(callback: (err: any, res: any) => void): Test
  }
  interface Test {
    then(callback: (res: any) => void): Promise<any>
  }
  const supertest: SuperAgentTest
  export = supertest
}