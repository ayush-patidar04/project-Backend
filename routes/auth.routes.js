const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = Router();

authRouter.post("/register", authController.registerUserController);

/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access public 
 */
authRouter.post("/login", authController.loginUserController);


/**
 * @route GET /api/auth/logout
 * @description clear cookie, token and add token in blacklist 
 * @access public 
 */
authRouter.get("/logout", authController.logoutUserController);


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private 
 */ 
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController);

module.exports = authRouter;