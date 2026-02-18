    import jwt from 'jsonwebtoken'

    const SECRET = process.env.JWT_SECRET;
export function generateToken(payload: { id: string; role: string }): string{
    if (!SECRET) {
        throw new Error("jwt secret is not defined");
        }
        return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}
export function verifyToken(token: string): { id: string; role: string } | null{
      if (!SECRET) {
        throw new Error("JWT_SECRET is not defined");
      }
    try {
        return jwt.verify(token, SECRET) as { id: string; role: string };
    }
    catch {
        return null;
    }
}