// Checks if the logged in user has the required role.
// Always use after authenticate middleware, never alone.
// Usage: router.post("/route", authenticate, authorizeRole(1), controller)
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ message: "Access denied" })
    }
    next()//move to function in route
  }
}

export default authorizeRole

//this will be used when building /internship,etc routes
//example: router.post("/internship", authenticate, authorizeRole(1), createInternship)
//only role 1 users are allowed to make a request to this route