export interface User {
    id: number;
    first_name: string;
    last_name?: string | null;
    email: string;
    password: string;
    role: string;
}