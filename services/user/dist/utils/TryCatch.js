import ErrorHandler from "./errorHandler.js";
export const TryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res, next);
    }
    catch (error) {
        if (error instanceof ErrorHandler) {
            return res.status(error.statusCode).json({
                message: error.message
            });
        }
        res.status(500).json({
            message: error.message
        });
    }
};
