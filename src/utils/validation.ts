import * as z from "zod";

export const username = z
    .string()
    .min(1, "Username is Required")

export const email = z
    .string()
    .min(1, "Email is Required")
    .email("Please enter a valid email");

export const password = z
    .string()
    .min(1, "Password is Required")

export const login = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("username"),
        username: username,
        password: password,
    }),
    z.object({
        type: z.literal("email"),
        email: email,
        password: password,
    }),
]);

export const name = z
    .string()
    .min(1, "Name is Required")

export const signUp = z
    .object({
        name: name,
        email: email,
        password: password,
        confirmPassword: password,
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const resetPassword = z.object({
    email: email,
    password: password,
    newPassword: password,
});
