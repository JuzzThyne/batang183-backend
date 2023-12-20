// httpsMiddleware.js
export default function enforceHttps(req, res, next) {
    if (req.protocol !== 'https') {
        const error = new Error('HTTPS is required for this resource');
        error.status = 400;
        return next(error);
    }
    next();
}
