class ApiError extends Error{
    constructor(message = "Something went wrong", statusCode, errors = [], stack){
        super(message); //super method must be called to initizalize the objects before accessing this 
        this.statusCode = statusCode;
        this.errors = errors;

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, ApiError);
        }
    }
}