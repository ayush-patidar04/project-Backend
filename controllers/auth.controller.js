const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userModel = require("../models/user.model");
const tokenBlackListModel = require("../models/blacklist.model");

async function registerUserController(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const userExists = await userModel.findOne({
    $or: [{ username }, { email }],
  });
  if (userExists) {
    if (userExists.username === username) {
      return res.status(400).json({
        success: false,
        message: "This username is taken",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Account already exists with this email ",
      });
    }
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new userModel({
    username,
    email,
    password: hashedPassword,
  });
  await newUser.save();

  const token = jwt.sign(
    {
      id: newUser._id,
      username: newUser.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.cookie("token", token);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    },
  });
}

async function loginUserController(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
  });
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.cookie("token", token);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

async function logoutUserController(req, res) {
    const token = req.cookies.token;

    if(token) {
        await tokenBlackListModel.create({token})
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    res.status(200).json({
        success: true,
        message: "User details fetched succesfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

module.exports = {
  registerUserController,
  loginUserController,
  logoutUserController,
  getMeController
};
