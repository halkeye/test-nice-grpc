import { afterAll, beforeAll, expect, test } from "@jest/globals";
import { Channel, createChannel, createClient, createServer } from "nice-grpc";
import {
  DeepPartial,
  ExampleRequest,
  ExampleResponse,
  ExampleServiceClient,
  ExampleServiceDefinition,
  ExampleServiceImplementation,
} from "./compiled_proto/example";

let exampleUnaryMethod = async (
  _request: ExampleRequest,
): Promise<DeepPartial<ExampleResponse>> => {
  const response: DeepPartial<ExampleResponse> = {};
  return response;
};
const exampleServiceImpl: ExampleServiceImplementation = {
  async exampleUnaryMethod(
    request: ExampleRequest,
  ): Promise<DeepPartial<ExampleResponse>> {
    return exampleUnaryMethod(request);
  },
};

let client: ExampleServiceClient;
let channel: Channel;
const server = createServer();
beforeAll(async () => {
  server.add(ExampleServiceDefinition, exampleServiceImpl);

  const port = await server.listen("127.0.0.1:0");

  channel = createChannel(`127.0.0.1:${port}`);
  client = createClient(ExampleServiceDefinition, channel);
});

afterAll(async () => {
  channel.close();
  await server.shutdown();
});

test("foo", async () => {
  const resp = await client.exampleUnaryMethod({});
  expect(resp).toEqual({ exampleField: "" });

  exampleUnaryMethod = async () => {
    return { exampleField: "foo" };
  };
  const resp2 = await client.exampleUnaryMethod({});
  expect(resp2).toEqual({ exampleField: "bar" });
});
