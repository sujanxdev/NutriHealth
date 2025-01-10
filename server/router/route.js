import { Router } from "express";
import axios from "axios"; // Import axios for HTTP requests
const router = Router();

/** import all controllers */
import * as controller from "../controllers/appController.js";
import Auth, { localVariables } from "../middleware/auth.js";
import { registerMail } from "../controllers/mailer.js";

/** POST Methods */
router.route("/register").post(controller.register); // register user

router.route("/registerMail").post(registerMail); // send the email
router
  .route("/authenticate")
  .post(controller.verifyUser, (req, res) => res.end()); // authenticate user
router.route("/login").post(controller.verifyUser, controller.login); // login in app

/** GET Methods */
router.route("/user/:username").get(controller.getUser); // user with usernames
router
  .route("/generateOTP")
  .get(controller.verifyUser, localVariables, controller.generateOTP); // generate random OTP
router.route("/verifyOTP").get(controller.verifyOTP); // verify generated OTP
router.route("/createResetSession").get(controller.createResetSession); // reset all the variables

/** PUT Methods */
router.route("/updateuser").put(Auth, controller.updateUser); // is use to update the user profile
router
  .route("/resetPassword")
  .put(controller.verifyUser, controller.resetPassword); // use to reset password

/** POST Method for fetching recommendation */
router.route("/getRecommendation").post(async (req, res) => {
  const userInput = req.body;
  console.log("User Input:", userInput);  // Log input data

  try {
    const flaskResponse = await axios.post(
      "http://127.0.0.1:5000/recommendations",
      userInput,
      { timeout: 30000 }
    );
    return res.status(200).json(flaskResponse.data);
  } catch (error) {
    console.error("Error fetching recommendation from Flask:", error.response || error.message);
    return res.status(500).json({ error: "Internal server error while fetching recommendation" });
  }
});

export default router;
