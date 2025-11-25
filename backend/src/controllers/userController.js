const userService = require('../services/userService');

async function register(req, res) {
  try {
    const result = await userService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error('Register error:', err);
    res.status(err.status || 500).json({ error: err.message || 'internal server error' });
  }
}

async function login(req, res) {
  try {
    const result = await userService.loginUser(req.body);
    res.json(result);
  } catch (err) {
    console.error('Login error:', err);
    res.status(err.status || 500).json({ error: err.message || 'internal server error' });
  }
}

async function me(req, res) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });

  try {
    const user = await userService.getCurrentUser(req.user.userId);
    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(err.status || 500).json({ error: err.message || 'internal server error' });
  }
}

module.exports = { register, login, me };
