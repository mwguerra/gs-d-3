// Requires a previous auth middleware.

export default async (req, res, next) => {
  if (!req.userIsAdmin) {
    return res.status(401).json({
      error: 'Only admin users can do that.',
    });
  }

  return next();
};
