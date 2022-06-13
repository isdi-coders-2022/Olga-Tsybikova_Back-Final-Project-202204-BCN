const debug = require("debug")("set-appArt:server:firebase");
const chalk = require("chalk");
const { initializeApp } = require("firebase/app");
const path = require("path");
const fs = require("fs");

const {
  getStorage,
  uploadBytes,
  getDownloadURL,
  ref,
} = require("firebase/storage");

const firebase = async (req, res, next) => {
  const firebaseConfig = {
    apiKey: "AIzaSyDMraNYN2_zuBqkJBHZH1I0cCg-2a1kj_U",
    authDomain: "medicapp-4cfb0.firebaseapp.com",
    projectId: "medicapp-4cfb0",
    storageBucket: "medicapp-4cfb0.appspot.com",
    messagingSenderId: "1093360418276",
    appId: "1:1093360418276:web:a1b3e24208d62069e6dbf1",
  };

  const firebaseApp = initializeApp(firebaseConfig);

  const { file } = req;

  try {
    if (file) {
      const newFileName = `${file.originalname.split(".")[0]}-${Date.now()}.${
        file.originalname.split(".")[1]
      }`;

      fs.rename(
        path.join("images", file.filename),
        path.join("images", newFileName),
        async (error) => {
          if (error) {
            debug(chalk.red("Error renaming post picture"));

            next(error);
            return;
          }
          req.body.image = newFileName;

          fs.readFile(
            path.join("images", newFileName),
            async (readError, readFile) => {
              if (readError) {
                debug(chalk.red("Error reading post picture"));

                next(readError);
                return;
              }
              const storage = getStorage(firebaseApp);

              const storageRef = ref(storage, newFileName);
              await uploadBytes(storageRef, readFile);
              const firebaseFileURL = await getDownloadURL(storageRef);

              req.body.defaultImage = firebaseFileURL;

              next();
            }
          );
        }
      );
    } else {
      next();
    }
  } catch (error) {
    error.statusCode = 400;
    error.customMessage = "Couldn't process images";
    debug(chalk.red(error.message));

    next(error);
  }
};

module.exports = firebase;
