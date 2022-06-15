const fs = require("fs");
const path = require("path");
const firebase = require("./firebase");

jest.mock("firebase/storage", () => ({
  ...jest.requireActual("firebase/storage"),
  getStorage: jest.fn(),
  ref: jest.fn().mockReturnValue("storageRef"),
  uploadBytes: jest.fn().mockResolvedValue("Mock uploaded bytes"),
  getDownloadURL: jest
    .fn()
    .mockResolvedValue("pictureBackup.firebase.picture1.jpg"),
}));

describe("Given the firebase middleware function", () => {
  describe("When it receives a request with a new post with a file and next", () => {
    test("Then it should call next", async () => {
      const req = { file: null };
      const next = jest.fn();

      await firebase(req, null, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("When it's invoqued with a request that has a new project and a file but fails on renaming it's name", () => {
    test("Then it should call next", async () => {
      const expectedError = "Error reanming file";
      jest
        .spyOn(path, "join")
        .mockReturnValue(`${path.join("uploads", "images")}`);

      jest
        .spyOn(fs, "rename")
        .mockImplementation((oldpath, newpath, callback) => {
          callback(expectedError);
        });
      const req = { body: {}, file: { originalname: "picture.jpg" } };

      const next = jest.fn();
      await firebase(req, null, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });

  describe("When the readFile method files", () => {
    test("Then it should call the received next function with the error 'readFileError'", async () => {
      const expectedError = "Error reading file";
      jest
        .spyOn(path, "join")
        .mockReturnValue(`${path.join("uploads", "images")}`);

      jest
        .spyOn(fs, "rename")
        .mockImplementation((oldpath, newpath, callback) => {
          callback();
        });

      jest.spyOn(fs, "readFile").mockImplementation((pathToRead, callback) => {
        callback(expectedError);
      });
      const next = jest.fn();
      const req = { body: {}, file: { originalname: "picture.jpg" } };

      await firebase(req, null, next);

      expect(next).toHaveBeenCalledWith(expectedError);
    });
  });
});
