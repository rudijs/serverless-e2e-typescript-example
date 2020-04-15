# serverless-e2e-typescript-example

Code repository for the blog post on end to end testing aws serverless api's with Typescript and Jest.

If you find any typo's or cut-n-paste errors or mistakes please let me know.

## Setup from scratch

The following steps are all command line on a Unix platorm, please adjust for your platorm where required.

Create a new directory and chnage to it (for example):

`mkdir serverless-e2e-typescript-example`

`cd serverless-e2e-typescript-example`

Create an AWS Lambda serverless API:

`npx serverless create --template aws-nodejs-typescript --name api`

Here's an example of the output:

```
❯ npx serverless create --template aws-nodejs-typescript --name api
Serverless: Generating boilerplate...
 _______                             __
|   _   .-----.----.--.--.-----.----|  .-----.-----.-----.
|   |___|  -__|   _|  |  |  -__|   _|  |  -__|__ --|__ --|
|____   |_____|__|  \___/|_____|__| |__|_____|_____|_____|
|   |   |             The Serverless Application Framework
|       |                           serverless.com, v1.67.3
 -------'

Serverless: Successfully generated boilerplate for template: "aws-nodejs-typescript"
```

Install the node dependencies

`npm install`

Edit the `serverless.yml` file so that we can set a default stage and region.

Under the `provider` section add:

```
stage: ${opt:stage, 'dev'}
region: ${opt:region, 'us-east-1'}
```

Lets make our API endpoint output only a message and not echo the Lambda `input`

Edit `handler.ts`, comment out line 9

`// input: event`

Deploy the API to the 'dev' stage.

Example deployment command and output:

```
> npx serverless --stage dev deploy
Serverless: Bundling with Webpack...
Time: 394ms
Built at: 04/15/2020 1:38:22 PM
         Asset      Size  Chunks                   Chunk Names
    handler.js  1.28 KiB       0  [emitted]        handler
handler.js.map  5.27 KiB       0  [emitted] [dev]  handler
Entrypoint handler = handler.js handler.js.map
[0] ./handler.ts 316 bytes {0} [built]
[1] external "source-map-support/register" 42 bytes {0} [built]
Serverless: Package lock found - Using locked versions
Serverless: Packing external modules: source-map-support@^0.5.10
Serverless: Packaging service...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service api.zip file to S3 (289.14 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
..............................
Serverless: Stack update finished...
Service Information
service: api
stage: dev
region: us-east-1
stack: api-dev
resources: 11
api keys:
  None
endpoints:
  GET - https://driyuairb6.execute-api.us-east-1.amazonaws.com/dev/hello
functions:
  hello: api-dev-hello
layers:
  None
Serverless: Run the "serverless" command to setup monitoring, troubleshooting and testing.
```

Lets call the new API endpoint, copy the `hello` endpoint from your deployment:

```
❯ curl https://driyuairb6.execute-api.us-east-1.amazonaws.com/dev/hello
{
  "message": "Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!"
}
``
```

Great! Our new typescript API endpoint is working, lets setup the end-to-end testing.

Install test dependencies:

`npm i -D jest ts-jest @types/jest axios`

Create a testing directory and Jest config file

```
mkdir e2e
touch e2e/jest.config.js
```

This is how your `jest.config.js` file should be:

```
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
}
```

You can create any testing file structure you prefer but for this example we'll be creating files of the test functions then importing them into a single test file describing all the tests in order and assigning them with the imported functions.

Create a test file for the `hello` API endpoint, I prefer to prefix with a number as it's common to test API endpoints in sequence:

Create the file `100_hello.ts` with the code content:

```
import axios from "axios"

const url = process.env.URL

export const helloTest = () => {
  test("should reply success", async () => {
    const res = await axios.get(`${url}/hello`)
    expect(res.status).toEqual(200)
    expect(res.data.message).toMatch(/Your function executed successfully!/)
  })
}
```

Create the test suite runner file `index.test.js` with the code content:

```
import { helloTest } from "./100_hello"

describe("hello", helloTest)
```

Lets run the end-to-end test manually first, then we'll create an npm script to simplify it:

```
 URL=https://driyuairb6.execute-api.us-east-1.amazonaws.com/dev ./node_modules/.bin/jest -c e2e/jest.config.js  --runInBand --bail
ts-jest[config] (WARN) message TS151001: If you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
 PASS  e2e/index.test.ts
  hello
    ✓ should reply success (474ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.059s, estimated 2s
Ran all test suites.
```

Yay! Our end-to-end test passes.

Let's fix that ts-jest warning by adding `"esModuleInterop": true` in the tsconfig.json file

`"esModuleInterop": true`

Run the tests manually again:

```
URL=https://driyuairb6.execute-api.us-east-1.amazonaws.com/dev ./node_modules/.bin/jest -c e2e/jest.config.js --runInBand --bail
 PASS  e2e/index.test.ts
  hello
    ✓ should reply success (489ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.96s, estimated 2s
Ran all test suites.
```

Next lets create an npm script in `package.json`:

```
"scripts": {
"test": "echo \"Error: no test specified\" && exit 1",
"e2e": "jest -c e2e/jest.config.js --runInBand --bail e2e"
},
```

Now we can run our tests with:

```
URL=https://driyuairb6.execute-api.us-east-1.amazonaws.com/dev npm run e2e

> api@1.0.0 e2e /home/rudi/projects/serverless-e2e-typescript-example
> jest -c e2e/jest.config.js --runInBand e2e

 PASS  e2e/index.test.ts
  hello
    ✓ should reply success (474ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.001s
Ran all test suites matching /e2e/i.
```
