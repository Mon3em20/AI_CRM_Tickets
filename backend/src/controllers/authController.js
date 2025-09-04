const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/env');

const authController = {
    register: async (req, res) => {
        try {
            const { email, password, name, phone, role = "customer" } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ message: "Name, email, and password are required" });
            }

            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(409).json({ message: "User already exists" });
            }

            const newUser = new User({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password,
                phone: phone?.trim(),
                role
            });

            await newUser.save();

            const token = jwt.sign(
                { user: { userId: newUser._id, role: newUser.role } },
                config.SECRET_KEY,
                { expiresIn: '7d' }
            );

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            return res
                .cookie('token', token, {
                    expires: expiresAt,
                    httpOnly: true,
                    secure: config.NODE_ENV === 'production',
                    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax'
                })
                .status(201)
                .json({
                    message: "User registered successfully",
                    user: {
                        id: newUser._id,
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        phone: newUser.phone
                    }
                });

        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
            if (!user) {
                return res.status(404).json({ message: "Email not found" });
            }

            if (!user.isActive) {
                return res.status(401).json({ message: "Account has been deactivated" });
            }

            const passwordMatch = await user.comparePassword(password);
            if (!passwordMatch) {
                return res.status(401).json({ message: "Incorrect password" });
            }

            user.lastLogin = new Date();
            await user.save();

            const token = jwt.sign(
                { user: { userId: user._id, role: user.role } },
                config.SECRET_KEY,
                { expiresIn: '7d' }
            );

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            return res
                .cookie("token", token, {
                    expires: expiresAt,
                    httpOnly: true,
                    secure: config.NODE_ENV === 'production',
                    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax'
                })
                .status(200)
                .json({
                    message: "Login successful",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        phone: user.phone,
                        lastLogin: user.lastLogin
                    }
                });

        } catch (error) {
            console.error("Error logging in:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

    logout: async (req, res) => {
        try {
            return res
                .clearCookie('token', {
                    httpOnly: true,
                    secure: config.NODE_ENV === 'production',
                    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax'
                })
                .status(200)
                .json({ message: "Logged out successfully" });

        } catch (error) {
            console.error("Error during logout:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

    me: async (req, res) => {
        try {
            const userId = req.user.userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!user.isActive) {
                return res.status(401).json({ message: "Account has been deactivated" });
            }

            res.status(200).json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            });

        } catch (error) {
            console.error("Get profile error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
};

module.exports = authController;