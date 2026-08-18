namespace QuickEats.API.Exceptions;

public class UnauthorizedAppException : Exception
{
    public UnauthorizedAppException(string message)
        : base(message)
    {
    }
}
