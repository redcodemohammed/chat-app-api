export default (input: {
    type: "success" | "error",
    data,
    message: string
}): {
    type: "success" | "error",
    data,
    message: string
} => {
    return {
        type: input.type,
        data: input.data,
        message: input.message
    }
}
