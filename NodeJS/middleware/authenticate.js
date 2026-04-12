import jwt from "jsonwebtoken"

//This runs before any protected route. It checks if the request has a valid JWT token in the header. If the token is valid it extracts the userId from it and attaches it to the request object (req.userId) so the next function can use it. If there's no token or it's invalid it blocks the request and returns a 401 error.
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    //{ userId: 5, iat: 1697264442, exp: 1697268042 } example of a decoded token. iat->issued at
    req.userId = decoded.userId // attach userId to request
    req.userRole = decoded.role

    next()//move to the function in route
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" })
  }
}

export default authenticate
