import { afterAll, beforeAll, expect, jest, test } from "@jest/globals";
import { Channel, createChannel, createClient, createServer } from "nice-grpc";
import {
  ExampleServiceClient,
  ExampleServiceDefinition,
  ExampleServiceImplementation,
} from "./compiled_proto/example";

const exampleServiceImpl: Partial<ExampleServiceImplementation> = {};

let client: ExampleServiceClient;
let channel: Channel;
const server = createServer();
beforeAll(async () => {
  server.add(
    ExampleServiceDefinition,
    // @ts-ignore-next-line
    Object.keys(ExampleServiceDefinition.methods).reduce(function (
      obj,
      methodName,
    ) {
      // @ts-ignore-next-line
      obj[methodName] = async (request, context) => {
        // @ts-ignore-next-line
        if (exampleServiceImpl[methodName]) {
          // @ts-ignore-next-line
          return exampleServiceImpl[methodName](request, context);
        }
        throw new Error("unimplemented " + methodName);
      };
      return obj;
    }, {}),
  );

  const port = await server.listen("127.0.0.1:0");

  channel = createChannel(`127.0.0.1:${port}`);
  client = createClient(ExampleServiceDefinition, channel);
});

afterAll(async () => {
  channel.close();
  await server.shutdown();
});

test("empty response", async () => {
  exampleServiceImpl.exampleUnaryMethod = jest.fn(async () => ({}));
  const resp = await client.exampleUnaryMethod({});
  expect(resp).toEqual({ exampleField: "" });
});

test("specific response", async () => {
  exampleServiceImpl.exampleUnaryMethod = jest.fn(async () => ({
    exampleField: "bar",
  }));
  const resp2 = await client.exampleUnaryMethod({});
  expect(resp2).toEqual({ exampleField: "bar" });
});
