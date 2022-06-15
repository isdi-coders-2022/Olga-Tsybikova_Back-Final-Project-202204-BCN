const { MongoMemoryServer } = require("mongodb-memory-server");
const { default: mongoose } = require("mongoose");
const connectDB = require("../database");
const Medication = require("../database/models/Medication");
const User = require("../database/models/User");
const mockmeds = require("../mocks/mockmeds");
const {
  getMedications,
  deleteMedications,
  createMedication,
  updateMedication,
  getMedicationById,
} = require("./medicationsControllers");

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

describe("Given a getMedicationsList function", () => {
  describe("When it receives a request", () => {
    test("Then it should response with a method status 200 and a mockMedications", async () => {
      const medicationsMock = [
        {
          id: 22,
          title: "Ibuprofen",
        },
      ];
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      Medication.find = jest.fn().mockResolvedValue(medicationsMock);

      const expectedStatusCode = 200;

      await getMedications(null, res);

      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(medicationsMock);
    });
    describe("When it receives a request with not correct data", () => {
      test("then it should throw an error with code 404 and message 'Not found'", async () => {
        const next = jest.fn();

        Medication.find = jest.fn().mockResolvedValue(false);
        await getMedications(null, null, next);

        const expectedErrorMessage = "Not found";
        const expectedError = new Error(expectedErrorMessage);

        expect(next).not.toHaveBeenCalledWith(expectedError);
      });
    });
  });
});

describe("Given a deleteMedication controller", () => {
  describe("When it receives a request", () => {
    test("Then it should respond with a method status and a confirmation of deletion 'Medication deleted correctly!'", async () => {
      const expectedJsonMessage = {
        message: "Medication deleted correctly!",
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(expectedJsonMessage),
      };
      const req = { params: { id: "629a0d040a3e1e0a9b455361" } };
      Medication.findByIdAndDelete = jest
        .fn()
        .mockResolvedValue(expectedJsonMessage);
      await deleteMedications(req, res);

      const expectedStatus = 200;

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith(expectedJsonMessage);
    });
    describe("When it receives a request to delete an item but cant find", () => {
      test("Then it should throw an error and a code 404", () => {});
    });
  });
});

describe("Given createMedication function", () => {
  const next = jest.fn();

  describe("When it's invoked with a request that has a new medication", () => {
    test("Then it should call the response's status method with 201 and the json method with the created medication", async () => {
      const req = {
        body: { newMedication: mockmeds },
        file: {
          filename: "mockimagename",
          originalname: "mockimage.jpg",
        },
        userId: "mockid",
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      Medication.create = jest.fn().mockResolvedValueOnce(mockmeds);
      User.findOneAndUpdate = jest.fn().mockResolvedValueOnce(true);

      await createMedication(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ medication: mockmeds });
    });
  });
});

describe("Given updateMedication function", () => {
  describe("When it receives an id of the medication", () => {
    test("Then it should call a response method with status 200", async () => {
      const modifiedMed = "Ibuprofen";

      const expectedStatus = 200;

      const req = {
        params: { id: modifiedMed.id },
        body: modifiedMed,
        userId: modifiedMed.owner,
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Medication.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(true);

      await updateMedication(req, res, null);
      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalled();
    });
  });
});

describe("Given find medication by id function", () => {
  describe("When invoked with a correct request and it finds medication", () => {
    test("Then it should call the response status method 200 and it's json method with the found medication", async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const expectedStatus = 200;
      const req = {
        params: { id: mockmeds[0].id },
      };

      Medication.findById = jest.fn(() => ({
        populate: jest.fn().mockReturnValue(),
      }));

      await getMedicationById(req, res);
      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
