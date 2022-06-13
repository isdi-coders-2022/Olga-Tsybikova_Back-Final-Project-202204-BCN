require("dotenv").config();
const { verify } = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const request = require("supertest");
const connectDB = require("../database");
const Medication = require("../database/models/Medication");
const mockmeds = require("../mocks/mockmeds");
const app = require("../server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());
});
beforeEach(async () => {
  await Medication.create(mockmeds[0]);
});

afterEach(async () => {
  await Medication.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  verify: jest.fn(),
}));

describe("Given a GET/medication/list endpoint", () => {
  describe("When its been called with a request", () => {
    test("Then it should respond with the status 200 and the list of medications", async () => {
      verify.mockImplementation(() => "anymockvalue");

      Medication.find = jest.fn().mockResolvedValueOnce(mockmeds);
      const { body } = await await request(app)
        .get("/medications")
        .set({ authorization: "Bearer mocktoken" })
        .expect(200);

      expect(body).toEqual(mockmeds);
    });
  });
});
