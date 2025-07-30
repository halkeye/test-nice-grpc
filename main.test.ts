import { expect, test } from "@jest/globals";
import { createChannel, createClient } from "nice-grpc";
import {
  ExampleServiceClient,
  ExampleServiceDefinition,
} from "./compiled_proto/example";

const channel = createChannel("localhost:8080");
const client: ExampleServiceClient = createClient(
  ExampleServiceDefinition,
  channel,
);

test("foo", async () => {
  const resp = await client.exampleUnaryMethod({});
  expect(resp).toEqual({});
});
